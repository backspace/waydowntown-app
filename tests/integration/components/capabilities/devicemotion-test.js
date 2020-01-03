import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/devicemotion', function(hooks) {
  setupRenderingTest(hooks);

  test('it provides results from the devicemotion capability', async function(assert) {
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Devicemotion as |devicemotion|>
          <button {{action (perform devicemotion.request)}} />
          <span data-test-running>{{devicemotion.request.isRunning}}</span>
          <span data-test-x>{{devicemotion.event.acceleration.x}}</span>
        </Capabilities::Devicemotion>
      {{/if}}
    `);

    assert.dom('[data-test-running]').hasText('false');

    let permissionResolve;

    window.DeviceMotionEvent = {
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
    event.initEvent('devicemotion', true, true);
    event.acceleration = { x: 100 };
    dispatchEvent(event);

    await settled();

    await settled();
    await settled();
    assert.dom('[data-test-x]').hasText('100');

    // Can’t check that listener is removed?
  });

  test('it works when permissions are not needed', async function(assert) {
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Devicemotion as |devicemotion|>
          <button {{action (perform devicemotion.request)}} />
          <span data-test-x>{{devicemotion.event.acceleration.x}}</span>
        </Capabilities::Devicemotion>
      {{/if}}
    `);

    delete window.DeviceMotionEvent;

    await click('button');
    await settled();

    // Adapted from https://gist.github.com/apeckham/3276533
    const event = document.createEvent('Event');
    event.initEvent('devicemotion', true, true);
    event.acceleration = { x: 100 };
    dispatchEvent(event);

    await settled();

    assert.dom('[data-test-x]').hasText('100');
  });

  test('it displays an error when permission is denied', async function(assert) {
    await render(hbs`
      <Capabilities::Devicemotion as |devicemotion|>
        <button {{action (perform devicemotion.request)}} />
        <span data-test-error>{{devicemotion.error}}</span>
      </Capabilities::Devicemotion>
    `);

    assert.dom('[data-test-error]').hasNoText();

    window.DeviceMotionEvent = {
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
