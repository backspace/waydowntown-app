import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/deviceorientation', function(
  hooks,
) {
  setupRenderingTest(hooks);

  test('it provides results from the deviceorientation capability', async function(assert) {
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Deviceorientation as |deviceorientation|>
          <button {{action (perform deviceorientation.request)}} />
          <span data-test-running>{{deviceorientation.request.isRunning}}</span>
          <span data-test-alpha>{{deviceorientation.event.alpha}}</span>
        </Capabilities::Deviceorientation>
      {{/if}}
    `);

    assert.dom('[data-test-running]').hasText('false');

    let permissionResolve;

    window.DeviceOrientationEvent = {
      requestPermission() {
        return new Promise(resolve => {
          permissionResolve = resolve;
        });
      },
    };

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    permissionResolve('granted');

    await settled();

    // Adapted from https://gist.github.com/apeckham/3276533
    const event = document.createEvent('Event');
    event.initEvent('deviceorientation', true, true);
    event.alpha = 100;
    dispatchEvent(event);

    await settled();

    await settled();
    await settled();
    assert.dom('[data-test-alpha]').hasText('100');

    // Can’t check that listener is removed?
  });

  test('it works when permissions are not needed', async function(assert) {
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Deviceorientation as |deviceorientation|>
          <button {{action (perform deviceorientation.request)}} />
          <span data-test-alpha>{{deviceorientation.event.alpha}}</span>
        </Capabilities::Deviceorientation>
      {{/if}}
    `);

    delete window.DeviceOrientationEvent;

    await click('button');
    await settled();

    // Adapted from https://gist.github.com/apeckham/3276533
    const event = document.createEvent('Event');
    event.initEvent('deviceorientation', true, true);
    event.alpha = 100;
    dispatchEvent(event);

    await settled();

    assert.dom('[data-test-alpha]').hasText('100');
  });

  test('it displays an error when permission is denied', async function(assert) {
    await render(hbs`
      <Capabilities::Deviceorientation as |deviceorientation|>
        <button {{action (perform deviceorientation.request)}} />
        <span data-test-error>{{deviceorientation.error}}</span>
      </Capabilities::Deviceorientation>
    `);

    assert.dom('[data-test-error]').hasNoText();

    window.DeviceOrientationEvent = {
      requestPermission() {
        return new Promise((resolve, reject) => {
          reject('denied');
        });
      },
    };

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');
    await settled();

    assert.dom('[data-test-error]').hasText('denied');
  });
});
