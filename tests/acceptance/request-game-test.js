import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../helpers/set-token';
import mockCable from '../helpers/mock-cable';

module('Acceptance | game list', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  test('a requested game is displayed as an invitation', async function(assert) {
    this.server.post('/games/request', () => {
      const concept = this.server.create('concept', {
        name: 'a requested concept',
      });
      const incarnation = concept.createIncarnation();
      const game = incarnation.createGame();
      game.createParticipation({
        team: this.team,
        state: 'invited',
      });

      return game;
    });

    await visit('/');
    await click('[data-test-request]');
    await settled();

    assert
      .dom(`[data-test-invitations] [data-test-concept-name]`)
      .hasText('a requested concept');
  });

  test('a game cannot be requested when an unfinished one exists', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'a requested concept',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    game.createParticipation({
      team: this.team,
      state: 'invited',
    });

    await visit('/');

    assert.dom('[data-test-request]').isDisabled();
  });
});
