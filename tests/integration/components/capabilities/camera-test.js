import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/camera', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.oldGetPicture = navigator.camera.getPicture;

    navigator.camera.getPicture = (success, error) => {
      if (this.getPictureOverride) {
        this.getPictureOverride(success, error);
      } else {
        success();
      }
    };
  });

  hooks.afterEach(function() {
    navigator.camera.getPicture = this.oldGetPicture;
  });

  test('it provides an image from the camera', async function(assert) {
    let successHandler;
    this.getPictureOverride = success => {
      successHandler = success;
    };

    await render(hbs`
      <Capabilities::Camera as |camera|>
        <button {{action (perform camera.request)}} />
        <span data-test-running>{{camera.request.isRunning}}</span>
        <span data-test-image-url>{{camera.imageUrl}}</span>
      </Capabilities::Camera>
    `);

    assert.dom('[data-test-running]').hasText('false');

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    successHandler('http://example.com');
    await settled();

    assert.dom('[data-test-image-url]').hasText('http://example.com');
  });

  test('it provides errors from the camera', async function(assert) {
    let errorHandler;
    this.getPictureOverride = (success, error) => {
      errorHandler = error;
    };

    setupOnerror(function() {});

    await render(hbs`
      <Capabilities::Camera as |camera|>
        <button {{action (perform camera.request)}} />
        <span data-test-error>{{camera.error}}</span>
      </Capabilities::Camera>
    `);

    await click('button');

    errorHandler(new Error('yes'));
    await settled();

    assert.dom('[data-test-error]').hasText('Error: yes');
  });
});
