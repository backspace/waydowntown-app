import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/location', function(hooks) {
  setupRenderingTest(hooks);

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

  test('it provides results from the geolocation capability', async function(assert) {
    let successHandler;
    this.getCurrentPositionOverride = success => {
      successHandler = success;
    };

    await render(hbs`
      <Capabilities::Location as |location|>
        <button {{action (perform location.request)}} />
        <span data-test-running>{{location.request.isRunning}}</span>
        <span data-test-x>{{location.position.coords.x}}</span>
      </Capabilities::Location>
    `);

    assert.dom('[data-test-running]').hasText('false');

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    successHandler({
      coords: {
        x: 1312,
      },
    });
    await settled();

    assert.dom('[data-test-x]').hasText('1312');
  });

  test('it provides errors from the geolocation capability', async function(assert) {
    let errorHandler;
    this.getCurrentPositionOverride = (success, error) => {
      errorHandler = error;
    };

    setupOnerror(function() {});

    await render(hbs`
      <Capabilities::Location as |location|>
        <button {{action (perform location.request)}} />
        <span data-test-error>{{location.error}}</span>
      </Capabilities::Location>
    `);

    await click('button');

    errorHandler(new Error('yes'));
    await settled();

    assert.dom('[data-test-error]').hasText('Error: yes');

    // Would be nice to test GeolocationPositionError codes but seems impossible to mock…?
  });

  test('it provides an error if the geolocation capability doesn’t exist', async function(assert) {
    navigator.geolocation.getCurrentPosition = null;

    setupOnerror(function() {});

    await render(hbs`
      <Capabilities::Location as |location|>
        <button {{action (perform location.request)}} />
        <span data-test-error>{{location.error}}</span>
      </Capabilities::Location>
    `);

    await click('button');
    await settled();

    assert.dom('[data-test-error]').hasText('Geolocation property not found');
  });
});
