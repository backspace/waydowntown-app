import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('the requested game’s name is printed', async function(assert) {
    const concept = this.server.create('concept', { name: 'a concept' });
    const incarnation = concept.createIncarnation();
    incarnation.createGame();

    const host = this.owner.lookup('adapter:application').host || '';

    this.server.post(`${host}/games/request`, schema => {
      return schema.games.first();
    });

    await visit('/');
    await click('[data-test-request]');

    assert.dom('[data-test-concept-name]').hasText('a concept');
  });
});
