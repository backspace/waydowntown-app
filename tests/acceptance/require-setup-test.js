import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import resetStorages from 'ember-local-storage/test-support/reset-storage';

module('Acceptance | require setup', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();
  });

  test('the interface is hidden if no token is present', async function(assert) {
    await visit('/');

    assert.dom('.text-2xl').doesNotExist();
  });

  test('filling in a token shows the logged-in interface with team name', async function(assert) {
    const team = this.server.create('team', { name: 'our team' });

    await visit('/');

    await fillIn('[data-test-token-field]', team.id);
    await click('[data-test-token-save');

    assert.dom('.text-2xl').exists();
    assert.dom('[data-test-team-name]').hasText('our team');
  });
});
