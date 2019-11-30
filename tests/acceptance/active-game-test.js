import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../set-token';
import mockCable from '../mock-cable';

module('Acceptance | active game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  test('an active game is displayed and an inactive one is not', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'an in-progress concept',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame({
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
    });

    game.createParticipation({
      team: this.team,
      state: 'scheduled',
    });

    const inactiveGame = incarnation.createGame({
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() - 1000 * 59),
    });

    inactiveGame.createParticipation({
      team: this.team,
      state: 'scheduled',
    });

    await visit('/');

    assert
      .dom('[data-test-active-game] [data-test-concept-name]')
      .hasText('an in-progress concept');

    assert.dom('[data-test-active-game]').exists({ count: 1 });
  });
});
