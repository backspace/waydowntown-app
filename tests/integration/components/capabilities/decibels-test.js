import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | capabilities/decibels', function(hooks) {
  setupRenderingTest(hooks);

  test('it provides results from the DBMeter capability and stops it when destroyed', async function(assert) {
    const done = assert.async();
    this.set('show', true);

    await render(hbs`
      {{#if show}}
        <Capabilities::Decibels as |decibels|>
          <button {{action (perform decibels.request)}} />
          <span data-test-running>{{decibels.request.isRunning}}</span>
          <span data-test-decibels>{{decibels.decibels}}</span>
        </Capabilities::Decibels>
      {{/if}}
    `);

    assert.dom('[data-test-running]').hasText('false');

    let DBMeterSuccessHandler;

    window.DBMeter = {
      start(successHandler) {
        DBMeterSuccessHandler = successHandler;
      },
      stop() {
        done();
      },
    };

    await click('button');

    assert.dom('[data-test-running]').hasText('true');

    DBMeterSuccessHandler(1312);
    await settled();

    assert.dom('[data-test-decibels]').hasText('1312');

    this.set('show', false);
  });

  test('it displays an error from the DBMeter capability', async function(assert) {
    await render(hbs`
      <Capabilities::Decibels as |decibels|>
        <button {{action (perform decibels.request)}} />
        <span data-test-error>{{decibels.error}}</span>
      </Capabilities::Decibels>
    `);

    assert.dom('[data-test-error]').hasNoText();

    let DBMeterErrorHandler;

    window.DBMeter = {
      start(success, errorHandler) {
        DBMeterErrorHandler = errorHandler;
      },
      stop() {},
    };

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('button');

    DBMeterErrorHandler('An error');
    await settled();

    assert.dom('[data-test-error]').hasText('An error');
  });
});
