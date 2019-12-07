import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../helpers/set-token';
import mockCable from '../helpers/mock-cable';
import mockVibration from '../helpers/mock-vibration';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);
  mockVibration(hooks);

  test('a requested game is displayed as an invitation but does not trigger vibration', async function(assert) {
    this.server.post('/games/request', () => {
      const concept = this.server.create('concept', {
        name: 'a requested concept',
      });
      const incarnation = concept.createIncarnation();
      const game = incarnation.createGame();
      game.createParticipation({
        team: this.team,
        state: 'invited',
        initiator: true,
      });
      game.save();

      return game;
    });

    await visit('/');

    assert.equal(this.mockVibration.calls, 0);

    await click('[data-test-request]');
    await settled();

    assert
      .dom(`[data-test-invitations] [data-test-concept-name]`)
      .hasText('a requested concept');
    assert.equal(this.mockVibration.calls, 0);
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

  test('cancelled and dismissed games don’t block requests', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'a requested concept',
    });
    const incarnation = concept.createIncarnation();

    const cancelledGame = incarnation.createGame();
    cancelledGame.createParticipation({
      team: this.team,
      state: 'cancelled',
    });

    const dismissedGame = incarnation.createGame();
    dismissedGame.createParticipation({
      team: this.team,
      state: 'dismissed',
    });

    await visit('/');

    assert.dom('[data-test-request]').isNotDisabled();
  });
});
