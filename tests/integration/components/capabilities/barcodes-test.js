import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/barcodes', function(hooks) {
  setupRenderingTest(hooks);

  test('it provides results from the barcode scanner', async function(assert) {
    this.set('show', true);

    await render(hbs`
      <Capabilities::Barcodes as |barcodes|>
        <button {{action (perform barcodes.request)}} />
        <span data-test-running>{{barcodes.request.isRunning}}</span>
        <span data-test-barcodes>{{join " " barcodes.barcodes}}</span>
        <span data-test-device-count>{{barcodes.devices.length}}</span>
      </Capabilities::Barcodes>
    `);

    assert.dom('[data-test-running]').hasText('false');

    let barcodeSuccessHandler;

    window.cordova = {
      plugins: {
        barcodeScanner: {
          scan(success) {
            barcodeSuccessHandler = success;
          },
        },
      },
    };

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    barcodeSuccessHandler({
      text: '1919',
    });

    await settled();

    assert.dom('[data-test-barcodes]').includesText('1919');

    barcodeSuccessHandler({
      text: '1312',
    });

    barcodeSuccessHandler({
      cancelled: 1,
      text: 'fake',
    });

    await settled();

    assert.dom('[data-test-barcodes]').hasText('1919 1312');
  });

  test('it displays an error from the barcode scanner', async function(assert) {
    await render(hbs`
      <Capabilities::Barcodes as |barcodes|>
        <button {{action (perform barcodes.request)}} />
        <span data-test-error>{{barcodes.error}}</span>
      </Capabilities::Barcodes>
    `);

    assert.dom('[data-test-error]').hasNoText();

    let barcodeErrorHandler;

    window.cordova = {
      plugins: {
        barcodeScanner: {
          scan(success, error) {
            barcodeErrorHandler = error;
          },
        },
      },
    };

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');

    barcodeErrorHandler(new Error('hello'));
    await settled();

    assert.dom('[data-test-error]').hasText('Error: hello');
  });

  test('it displays an error when the barcode scanner doesn’t exist', async function(assert) {
    await render(hbs`
      <Capabilities::Barcodes as |barcodes|>
        <button {{action (perform barcodes.request)}} />
        <span data-test-error>{{barcodes.error}}</span>
      </Capabilities::Barcodes>
    `);

    assert.dom('[data-test-error]').hasNoText();

    delete window.cordova;

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');
    await settled();

    assert.dom('[data-test-error]').hasText('Barcode scanner not found');
  });
});
