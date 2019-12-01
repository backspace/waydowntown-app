import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../set-token';
import mockCable from '../mock-cable';
import mockGameClock from '../mock-game-clock';

module('Acceptance | game list', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);
  mockGameClock(hooks);

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

  test('a team can arrive at a converging game and when it becomes scheduled it shows as that way', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'a converging concept',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'converging',
    });

    await visit('/');

    assert.dom('[data-test-convergings]').exists();
    assert.dom('[data-test-scheduleds]').doesNotExist();

    const now = new Date();
    const gameStartTime = new Date(now.getTime() + 1000 * 60);
    this.setGameClock(now);

    this.server.patch(`/games/${game.id}/arrive`, function({
      participations,
      games,
    }) {
      participations.find(teamParticipation.id).update('state', 'scheduled');
      const serverGame = games.find(game.id);
      serverGame.update('beginsAt', gameStartTime);
      return serverGame;
    });

    await click(`[data-test-game-id='${game.id}'] [data-test-arrive]`);
    await settled();

    assert.dom('[data-test-convergings]').doesNotExist();
    assert.dom('[data-test-scheduleds]').exists();

    assert
      .dom('[data-test-scheduleds] [data-test-begins-at]')
      .hasText('Begins in 60 seconds');
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

  test('a game becoming scheduled via the socket shows the time until it starts', async function(assert) {
    const now = new Date();
    const concept = this.server.create('concept');
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();

    game.createParticipation({
      team: this.team,
      state: 'scheduled',
    });

    await visit('/');

    assert.dom('[data-test-scheduleds] [data-test-begins-at]').doesNotExist();

    game.attrs.beginsAt = new Date(now.getTime() + 1000 * 60);
    game.attrs.endsAt = new Date();
    game.save();

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
      .dom('[data-test-scheduleds] [data-test-begins-at]')
      .hasText('Begins in 59 seconds');
  });
});
