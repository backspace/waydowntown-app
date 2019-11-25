import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../set-token';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);

  test('the requested game’s name is printed', async function(assert) {
    const concept = this.server.create('concept', { name: 'a concept' });
    const incarnation = concept.createIncarnation();
    incarnation.createGame();

    await visit('/team'); // FIXME should autoforward from root?
    await click('[data-test-request]');

    assert.dom('[data-test-concept-name]').hasText('a concept');
  });
});
