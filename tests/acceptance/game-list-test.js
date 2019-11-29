import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../set-token';
import mockCable from '../mock-cable';

module('Acceptance | game list', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  test('a requested game is displayed as an invitation', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'a requested concept',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    game.createParticipation({
      team: this.team,
    });

    await visit('/');
    await click('[data-test-request]');
    await settled();

    assert
      .dom(
        `[data-test-invitations] [data-test-game-id='${game.id}'] [data-test-concept-name]`,
      )
      .hasText('a requested concept');
  });

  test('a received invitation is displayed', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'an invited concept',
    });
    const incarnation = concept.createIncarnation();

    await visit('/');

    const game = incarnation.createGame();
    game.createParticipation({
      team: this.server.create('team', { name: 'other team' }),
    });
    game.createParticipation({ team: this.team });

    await this.cable.handlers.received({
      type: 'invitation',
      content: this.server.serializerOrRegistry.serialize(game, {
        queryParams: {
          include:
            'participations,participations.team,incarnation,incarnation.concept',
        },
      }),
    });

    await settled();

    assert
      .dom(
        `[data-test-invitations] [data-test-game-id='${game.id}'] [data-test-concept-name]`,
      )
      .hasText('an invited concept');
  });

  test('existing invitations and acceptances are listed', async function(assert) {
    const otherTeam = this.server.create('team', { name: 'other team' });
    const thirdTeam = this.server.create('team', { name: 'a third team' });

    const concept = this.server.create('concept', {
      name: 'an invited concept',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    game.createParticipation({
      team: otherTeam,
    });
    game.createParticipation({
      team: thirdTeam,
    });
    game.createParticipation({ team: this.team });

    const acceptedConcept = this.server.create('concept', {
      name: 'an accepted concept',
    });
    const acceptedIncarnation = acceptedConcept.createIncarnation();
    const acceptedGame = acceptedIncarnation.createGame();
    acceptedGame.createParticipation({
      team: this.team,
      accepted: true,
    });

    await visit('/');

    assert
      .dom(
        `[data-test-invitations] [data-test-game-id='${game.id}'] [data-test-concept-name]`,
      )
      .hasText('an invited concept');
    assert
      .dom(
        `[data-test-invitations] [data-test-team-id='${otherTeam.id}'] [data-test-team-name]`,
      )
      .hasText('other team');
    assert
      .dom(
        `[data-test-invitations] [data-test-team-id='${thirdTeam.id}'] [data-test-team-name]`,
      )
      .hasText('a third team');
    assert
      .dom(`[data-test-invitations] [data-test-team-id='${this.team.id}']`)
      .doesNotExist();

    assert
      .dom(`[data-test-invitations] [data-test-game-id='${acceptedGame.id}']`)
      .doesNotExist();

    assert
      .dom(
        `[data-test-acceptances] [data-test-game-id='${acceptedGame.id}'] [data-test-concept-name]`,
      )
      .hasText('an accepted concept');
  });
});
