import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/magnetometer', function(hooks) {
  setupRenderingTest(hooks);

  test('it provides results from the magnetometer capability and stops it when destroyed', async function(assert) {
    const done = assert.async();
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Magnetometer as |magnetometer|>
          <button {{action (perform magnetometer.request)}} />
          <span data-test-running>{{magnetometer.request.isRunning}}</span>
          <span data-test-magnitude>{{magnetometer.reading.magnitude}}</span>
        </Capabilities::Magnetometer>
      {{/if}}
    `);

    assert.dom('[data-test-running]').hasText('false');

    let magnetometerSuccessHandler;

    window.cordova = {
      plugins: {
        magnetometer: {
          stop() {
            done();
          },
          watchReadings(success) {
            magnetometerSuccessHandler = success;
          },
        },
      },
    };

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    magnetometerSuccessHandler({
      magnitude: '100',
    });

    await settled();

    assert.dom('[data-test-magnitude]').hasText('100');

    this.set('show', false);
  });

  test('it displays an error from the magnetometer capability', async function(assert) {
    await render(hbs`
      <Capabilities::Magnetometer as |magnetometer|>
        <button {{action (perform magnetometer.request)}} />
        <span data-test-error>{{magnetometer.error}}</span>
      </Capabilities::Magnetometer>
    `);

    assert.dom('[data-test-error]').hasNoText();

    let magnetometerErrorHandler;

    window.cordova = {
      plugins: {
        magnetometer: {
          stop() {},
          watchReadings(success, error) {
            magnetometerErrorHandler = error;
          },
        },
      },
    };

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');

    magnetometerErrorHandler('An error');
    await settled();

    assert.dom('[data-test-error]').hasText('An error');
  });
});
