import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | debug log', function(hooks) {
  setupApplicationTest(hooks);

  test('logging statements are displayed', async function(assert) {
    await visit('/');

    assert.dom('[data-test-log-drawer]').doesNotExist();

    const debugLog = this.owner.lookup('service:debug-log');
    debugLog.log('Hello');

    await settled();

    assert.dom('[data-test-log-drawer]').exists();
    assert.dom('[data-test-log-count]').containsText('1');
    assert.dom('[data-test-log-entry]').doesNotExist();

    await click('[data-test-log-drawer]');

    assert.dom('[data-test-log-entry]').containsText('Hello');
  });
});
