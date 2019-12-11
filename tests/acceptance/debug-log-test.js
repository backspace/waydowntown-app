import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import resetStorages from 'ember-local-storage/test-support/reset-storage';

module('Acceptance | debug log', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();
  });

  test('logging statements are displayed', async function(assert) {
    await visit('/');

    assert.dom('[data-test-log-drawer]').doesNotExist();

    const debugLog = this.owner.lookup('service:debug-log');
    debugLog.log('Hello');

    await settled();

    assert.dom('[data-test-log-drawer]').exists();
    assert.dom('[data-test-log-count]').containsText('Show 1 log entry');
    assert.dom('[data-test-log-entry]').doesNotExist();

    await click('[data-test-log-drawer] button');

    assert.dom('[data-test-log-count]').containsText('Hide 1 log entry');
    assert.dom('[data-test-log-entry]').containsText('Hello');

    await click('[data-test-log-drawer] button');

    assert.dom('[data-test-log-count]').containsText('Show 1 log entry');
    assert.dom('[data-test-log-entry]').doesNotExist();
  });
});
