import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/bluetooth', function(hooks) {
  setupRenderingTest(hooks);

  test('it provides results from the Bluetooth capability and stops it when destroyed', async function(assert) {
    const done = assert.async();
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Bluetooth as |bluetooth|>
          <button {{action (perform bluetooth.request)}} />
          <span data-test-running>{{bluetooth.request.isRunning}}</span>
          <span data-test-status>{{bluetooth.status}}</span>
          <span data-test-devices>{{join " " bluetooth.devices}}</span>
          <span data-test-device-count>{{bluetooth.devices.length}}</span>
        </Capabilities::Bluetooth>
      {{/if}}
    `);

    assert.dom('[data-test-status]').hasText('unknown');
    assert.dom('[data-test-running]').hasText('false');

    let scanResultHandler;

    window.bluetoothle = {
      initialize(f) {
        f({ status: 'enabled' });
      },

      startScan(resultHandler) {
        scanResultHandler = resultHandler;
      },

      stopScan() {
        done();
      },
    };

    await click('button');

    assert.dom('[data-test-running]').hasText('true');
    assert.dom('[data-test-status]').hasText('enabled');

    scanResultHandler({
      status: 'scanResult',
      name: 'A',
    });

    await settled();

    assert.dom('[data-test-devices]').hasText('A');
    assert.dom('[data-test-device-count]').hasText('1');

    scanResultHandler({
      status: 'scanResult',
      name: 'B',
    });

    scanResultHandler({
      status: 'scanResult',
      name: 'A',
    });

    scanResultHandler({
      status: 'scanResult',
      name: null,
    });

    await settled();

    assert.dom('[data-test-devices]').hasText('A B');
    assert.dom('[data-test-device-count]').hasText('2');

    this.set('show', false);
  });

  test('it displays an error from the Bluetooth capability', async function(assert) {
    await render(hbs`
      <Capabilities::Bluetooth as |bluetooth|>
        <button {{action (perform bluetooth.request)}} />
        <span data-test-error>{{bluetooth.error}}</span>
      </Capabilities::Bluetooth>
    `);

    assert.dom('[data-test-error]').hasNoText();

    window.bluetoothle = {
      initialize(f) {
        f({ status: 'disabled' });
      },
    };

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');
    await settled();

    assert.dom('[data-test-error]').hasText('Bluetooth is disabled');
  });

  test('it displays an error when the Bluetooth capability doesn’t exist', async function(assert) {
    await render(hbs`
      <Capabilities::Bluetooth as |bluetooth|>
        <button {{action (perform bluetooth.request)}} />
        <span data-test-error>{{bluetooth.error}}</span>
      </Capabilities::Bluetooth>
    `);

    assert.dom('[data-test-error]').hasNoText();

    delete window.bluetoothle;

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');
    await settled();

    assert.dom('[data-test-error]').hasText('Bluetooth is missing');
  });
});
