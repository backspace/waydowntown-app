import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
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

  test('it returns to the token field when auth fails', async function(assert) {
    const applicationController = this.owner.lookup('controller:application');
    applicationController.set('tokenStorage.token', 1);

    this.server.post('/auth', () => {
      return new Response(401, {}, {});
    });

    await visitWithAbortedTransition('/team');

    assert.dom('.text-2xl').doesNotExist();
    assert.dom('[data-test-token-field]').exists();
    assert.dom('[data-test-error]').hasText('Invalid token');
  });
});

async function visitWithAbortedTransition(url) {
  try {
    await visit(url);
  } catch (error) {
    const { message } = error;
    if (message !== 'TransitionAborted') {
      throw error;
    }
  }
}
