import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/ocr', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    navigator.camera = {
      getPicture: (success, error) => {
        if (this.getPictureOverride) {
          this.getPictureOverride(success, error);
        } else {
          success();
        }
      },
    };
  });

  test('it passes an image from the camera to the OCR capability', async function(assert) {
    let successHandler;
    this.getPictureOverride = success => {
      successHandler = success;
    };

    await render(hbs`
      <Capabilities::Ocr as |ocr|>
        <button {{action (perform ocr.request)}} />
        <span data-test-running>{{ocr.request.isRunning}}</span>
        <span data-test-image-url>{{ocr.imageUrl}}</span>
        <span data-test-words>{{join " " ocr.recognised.words.wordtext}}</span>
      </Capabilities::Ocr>
    `);

    assert.dom('[data-test-running]').hasText('false');

    window.textocr = {
      recText(sourceType, uri, success) {
        success({
          words: {
            wordtext: ['end', 'imperialism'],
          },
        });
      },
    };

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    successHandler('http://example.com');
    await settled();

    assert.dom('[data-test-image-url]').hasText('http://example.com');
    assert.dom('[data-test-words]').hasText('end imperialism');
  });

  test('it provides errors from the camera', async function(assert) {
    let errorHandler;
    this.getPictureOverride = (success, error) => {
      errorHandler = error;
    };

    setupOnerror(function() {});

    await render(hbs`
      <Capabilities::Ocr as |ocr|>
        <button {{action (perform ocr.request)}} />
        <span data-test-error>{{ocr.error}}</span>
      </Capabilities::Ocr>
    `);

    await click('button');

    errorHandler(new Error('yes'));
    await settled();

    assert.dom('[data-test-error]').hasText('Error: yes');
  });

  test('it provides OCR errors', async function(assert) {
    this.getPictureOverride = success => {
      success('http://example.com');
    };

    setupOnerror(function() {});

    await render(hbs`
      <Capabilities::Ocr as |ocr|>
        <button {{action (perform ocr.request)}} />
        <span data-test-error>{{ocr.error}}</span>
      </Capabilities::Ocr>
    `);

    window.textocr = {
      recText(sourceType, uri, success, error) {
        error(new Error('yes'));
      },
    };

    await click('button');
    await settled();

    assert.dom('[data-test-error]').hasText('Error: yes');
  });
});
