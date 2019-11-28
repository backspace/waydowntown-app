import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../set-token';
import mockCable from '../mock-cable';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  test('the requested game’s name is printed', async function(assert) {
    const concept = this.server.create('concept', { name: 'a concept' });
    const incarnation = concept.createIncarnation();
    incarnation.createGame();

    await visit('/');
    await click('[data-test-request]');
    await settled();

    assert.dom('[data-test-concept-name]').hasText('a concept');
  });
});
