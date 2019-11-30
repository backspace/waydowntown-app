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
      state: 'invited',
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

  test('a received invitation is displayed and can be accepted', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'an invited concept',
    });
    const incarnation = concept.createIncarnation();

    await visit('/');

    const game = incarnation.createGame();
    game.createParticipation({
      team: this.server.create('team', { name: 'other team' }),
    });
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'invited',
    });

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
    assert.dom('[data-test-acceptances]').doesNotExist();

    this.server.patch(`/games/${game.id}/accept`, function({
      participations,
      games,
    }) {
      participations.find(teamParticipation.id).update('state', 'accepted');
      return games.find(game.id);
    });

    await click(`[data-test-game-id='${game.id}'] [data-test-accept]`);
    await settled();

    assert.dom('[data-test-invitations]').doesNotExist();
  });

  test('existing invitations, acceptances, and pendings are listed', async function(assert) {
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
    game.createParticipation({ team: this.team, state: 'invited' });

    const acceptedConcept = this.server.create('concept', {
      name: 'an accepted concept',
    });
    const acceptedIncarnation = acceptedConcept.createIncarnation();
    const acceptedGame = acceptedIncarnation.createGame();
    acceptedGame.createParticipation({
      team: this.team,
      state: 'accepted',
    });
    acceptedGame.createParticipation({
      team: otherTeam,
    });

    const convergingConcept = this.server.create('concept', {
      name: 'a converging concept',
    });
    const convergingIncarnation = convergingConcept.createIncarnation();
    const convergingGame = convergingIncarnation.createGame();
    convergingGame.createParticipation({
      team: this.team,
      state: 'converging',
    });
    convergingGame.createParticipation({
      team: otherTeam,
      state: 'converging',
    });

    await visit('/');

    assert
      .dom(`[data-test-invitations] [data-test-game-id='${game.id}']`)
      .exists();
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
      .dom('[data-test-invitations] [data-test-concept-name]')
      .exists({ count: 1 });

    assert
      .dom('[data-test-acceptances] [data-test-concept-name]')
      .exists({ count: 1 });
    assert
      .dom(`[data-test-acceptances] [data-test-game-id='${acceptedGame.id}']`)
      .exists();
    assert
      .dom(
        `[data-test-acceptances] [data-test-game-id='${acceptedGame.id}'] [data-test-accept]`,
      )
      .doesNotExist();

    assert
      .dom('[data-test-convergings] [data-test-concept-name]')
      .exists({ count: 1 });
    assert
      .dom(`[data-test-convergings] [data-test-game-id='${convergingGame.id}']`)
      .exists();
    assert
      .dom(
        `[data-test-convergings] [data-test-game-id='${convergingGame.id}'] [data-test-accept]`,
      )
      .doesNotExist();
  });
});
