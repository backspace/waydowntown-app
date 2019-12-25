import { module, test } from 'qunit';
import { click, currentURL, visit, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from 'waydowntown/tests/helpers/set-token';
import mockCable from 'waydowntown/tests/helpers/mock-cable';

module('Acceptance | capabilities', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  hooks.beforeEach(function() {
    window.device = {
      cordova: 'a',
      model: 'b',
      platform: 'c',
      uuid: 'uuid',
      version: 'e',
      manufacturer: 'f',
      isVirtual: 'g',
      serial: 'h',
    };

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
    delete window.device;
    navigator.geolocation.getCurrentPosition = this.oldGetCurrentPosition;
  });

  test('device and capabilities are requested and obtained in sequence and persisted', async function(assert) {
    this.member.attrs.capabilities = { stairs: true };
    this.member.save();

    const done = assert.async();
    const expectedCapabilities = {
      bluetooth: false,
      camera: true,
      decibels: false,
      location: true,
      notifications: true,
      ocr: true,

      exertion: true,
      speed: true,
      stairs: false,

      fastNavigation: true,
    };

    this.server.patch(`/members/:id`, function({ members }, request) {
      const member = members.find(request.params.id);
      member.update(this.normalizedRequestAttrs());

      assert.deepEqual(member.attrs.device, window.device);
      assert.deepEqual(member.attrs.capabilities, expectedCapabilities);

      done();

      return member;
    });

    await visit('/member/capabilities');

    await click('[data-test-next]');

    assert.dom('h2').includesText('Device');

    Object.keys(window.device).forEach(key => {
      assert
        .dom(`[data-test-device='${key}'] [data-test-value]`)
        .hasText(window.device[key].toString());
    });

    await click('[data-test-next]');

    assert.dom('h2').includesText('Location');

    await click('[data-test-request]');

    window.PushNotification = {
      init() {
        return {
          on(event, handler) {
            if (event === 'registration') {
              handler({ registrationType: 'X', registrationId: 'Y' });
            }
          },
        };
      },
    };

    assert.dom('h2').includesText('Notifications');

    await click('[data-test-request]');
    await settled();

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

    assert.dom('[data-test-error]').doesNotExist();

    navigator.camera = {
      getPicture(success) {
        success();
      },
    };

    assert.dom('h2').includesText('Camera');
    await click('[data-test-request]');
    await settled();

    assert.dom('h2').includesText('Decibel meter');
    await click('[data-test-skip]');

    window.textocr = {
      recText(sourceType, uri, success) {
        success();
      },
    };

    assert.dom('h2').includesText('Text recognition');
    await click('[data-test-request]');
    await settled();

    assert.dom('h2').includesText('Physical');
    await click('#exertion');
    await click('#speed');
    await click('#stairs');
    await click('[data-test-next]');

    assert.dom('h2').includesText('Phone');
    await click('#fastNavigation');
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

  test('a failure to obtain location permissions is displayed but cleared on the next step', async function(assert) {
    this.getCurrentPositionOverride = (success, error) => {
      error('error');
    };

    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-next]');
    await click('[data-test-request]');

    assert.dom('[data-test-error]').hasText('error');

    this.getCurrentPositionOverride = success => {
      success();
    };

    await click('[data-test-request]');

    assert.dom('[data-test-error]').doesNotExist();
  });

  test('exiting the process before anything has changed takes one step', async function(assert) {
    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-exit]');

    assert.equal(currentURL(), '/member');
  });

  test('exiting the process when something has changed takes two steps and reverts changes', async function(assert) {
    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-next]');
    await click('[data-test-request]');

    await click('[data-test-request-exit]');
    await click('[data-test-cancel-exit]');
    await click('[data-test-request-exit]');
    await click('[data-test-exit]');

    assert.equal(currentURL(), '/member');

    const memberRecord = this.owner
      .lookup('service:store')
      .peekRecord('member', this.member.id);
    assert.notOk(memberRecord.capabilities.hasDirtyAttributes);
  });

  test('the walkthrough begins automatically when the device details are unknown', async function(assert) {
    window.device.available = true;
    this.member.attrs.device = {};
    this.member.save();

    await visit('/');

    assert.equal(currentURL(), '/member/capabilities?first=true');
    assert.dom('[data-test-exit]').doesNotExist();
  });

  test('the walkthrough begins automatically with an explanation when the device OS version changes', async function(assert) {
    window.device.available = true;
    this.member.attrs.device.version = '1312';
    this.member.save();

    await visit('/');

    assert.equal(currentURL(), '/member/capabilities?forced=true');
    assert.dom('[role=alert]').exists();
  });
});
