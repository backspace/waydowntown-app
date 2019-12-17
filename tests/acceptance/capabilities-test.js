import { module, test } from 'qunit';
import { click, visit, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from 'waydowntown/tests/helpers/set-token';

module('Acceptance | capabilities', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);

  hooks.beforeEach(function() {
    this.oldGetCurrentPosition = navigator.geolocation.getCurrentPosition;

    navigator.geolocation.getCurrentPosition = (success, error) => {
      if (this.getCurrentPositionOverride) {
        this.getCurrentPositionOverride(success, error);
      } else {
        success();
      }
    };
  });

  hooks.afterEach(function() {
    navigator.geolocation.getCurrentPosition = this.oldGetCurrentPosition;
  });

  test('capabilities are requested and obtained in sequence and persisted', async function(assert) {
    this.member.attrs.capabilities = { stairs: true };
    this.member.save();

    const done = assert.async();

    const expectedCapabilities = {
      bluetooth: false,
      decibels: false,
      location: true,

      exertion: true,
      speed: true,
      stairs: false,

      fastTapping: true,
    };

    this.server.patch(`/members/:id`, function({ members }, request) {
      const member = members.find(request.params.id);
      member.update(this.normalizedRequestAttrs());

      assert.deepEqual(member.attrs.capabilities, expectedCapabilities);

      done();

      return member;
    });

    await visit('/capabilities');

    await click('[data-test-next]');

    assert.dom('h2').includesText('Location');

    await click('[data-test-request]');

    const mockBluetooth = {
      initialize(f) {
        f({ status: 'disabled' });
      },
    };

    window.bluetoothle = mockBluetooth;

    assert.dom('h2').includesText('Bluetooth');

    await click('[data-test-request]');
    await settled();

    assert
      .dom('[data-test-error]')
      .hasText('Failed to obtain access to Bluetooth');

    await click('[data-test-skip]');

    assert.dom('h2').includesText('Decibel meter');
    await click('[data-test-skip]');

    assert.dom('h2').includesText('Physical');
    await click('#exertion');
    await click('#speed');
    await click('#stairs');
    await click('[data-test-next]');

    assert.dom('h2').includesText('Phone');
    await click('#fastTapping');
    await click('[data-test-next]');

    assert.dom('h2').includesText('Summary');

    Object.keys(expectedCapabilities).forEach(capability => {
      assert
        .dom(`[data-test-capability='${capability}'] [data-test-value]`)
        .hasText(expectedCapabilities[capability].toString());
    });

    assert
      .dom('[data-test-capability]')
      .exists({ count: Object.keys(expectedCapabilities).length });

    await click('[data-test-save]');
  });

  test('a failure to obtain location permissions is displayed', async function(assert) {
    this.getCurrentPositionOverride = (success, error) => {
      error('error');
    };

    await visit('/capabilities');
    await click('[data-test-next]');
    await click('[data-test-request]');

    assert.dom('[data-test-error]').hasText('error');
  });
});
