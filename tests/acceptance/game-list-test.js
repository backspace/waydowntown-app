import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../helpers/set-token';
import mockCable from '../helpers/mock-cable';
import mockGameClock from '../helpers/mock-game-clock';
import mockVibration from '../helpers/mock-vibration';

module('Acceptance | game list', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);
  mockGameClock(hooks);
  mockVibration(hooks);

  test('a received invitation is displayed, triggers vibration, and can be accepted', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'an invited concept',
    });
    const incarnation = concept.createIncarnation();

    await visit('/');

    assert.equal(this.mockVibration.calls, 0);

    const game = incarnation.createGame();
    game.createParticipation({
      team: this.server.create('team', { name: 'other team' }),
    });
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'invited',
      initiator: false,
    });

    await this.cable.TeamChannel.handlers.received({
      type: 'changes',
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
    assert.equal(this.mockVibration.calls, 1);

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

  test('a team can arrive at a converging game and it becomes representing', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'tap',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'converging',
    });

    await visit('/');

    assert.dom('[data-test-convergings]').exists();
    assert.dom('[data-test-representings]').doesNotExist();

    this.server.patch(`/games/${game.id}/arrive`, function({
      participations,
      games,
    }) {
      participations.find(teamParticipation.id).update('state', 'representing');
      const serverGame = games.find(game.id);
      return serverGame;
    });

    await click(`[data-test-game-id='${game.id}'] [data-test-arrive]`);
    await settled();

    assert.dom('[data-test-convergings]').doesNotExist();
    assert.dom('[data-test-representings]').exists();
  });

  test('existing invitations, acceptances, and convergings have cancel buttons and representings and cancellations are listed', async function(assert) {
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

    const representingConcept = this.server.create('concept', {
      name: 'a representing concept',
    });
    const representingIncarnation = representingConcept.createIncarnation();
    const representingGame = representingIncarnation.createGame();
    representingGame.createParticipation({
      team: this.team,
      state: 'representing',
    });

    const cancelledIncarnation = this.server.create('incarnation');
    const cancelledGame = cancelledIncarnation.createGame();
    cancelledGame.createParticipation({
      team: this.team,
      state: 'cancelled',
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
    assert.dom(`[data-test-game-id='${game.id}'] [data-test-cancel]`).exists();

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
      .dom(`[data-test-game-id='${acceptedGame.id}'] [data-test-cancel]`)
      .exists();

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
    assert
      .dom(`[data-test-game-id='${convergingGame.id}'] [data-test-cancel]`)
      .exists();

    assert
      .dom(
        `[data-test-representings] [data-test-game-id='${representingGame.id}']`,
      )
      .exists();
    assert
      .dom(`[data-test-game-id='${representingGame.id}'] [data-test-cancel]`)
      .doesNotExist();

    assert
      .dom(
        `[data-test-cancellations] [data-test-game-id='${cancelledGame.id}']`,
      )
      .exists();
    assert
      .dom(`[data-test-game-id='${cancelledGame.id}'] [data-test-cancel]`)
      .doesNotExist();
    assert
      .dom(`[data-test-game-id='${cancelledGame.id}'] [data-test-dismiss]`)
      .exists();
  });

  test('a representing game can be represented and when it becomes scheduled it shows as that way', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'tap',
    });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'representing',
    });
    const memberRepresentation = teamParticipation.createRepresentation({
      member: this.member,
    });

    await visit('/');

    assert.dom('[data-test-representings]').exists();
    assert.dom('[data-test-scheduleds]').doesNotExist();

    const now = new Date();
    const gameStartTime = new Date(now.getTime() + 1000 * 60);
    this.setGameClock(now);

    this.server.patch(`/games/${game.id}/represent`, function({
      participations,
      representations,
      games,
    }) {
      representations
        .find(memberRepresentation.id)
        .update('representing', true);

      participations.find(teamParticipation.id).update('state', 'scheduled');
      const serverGame = games.find(game.id);
      serverGame.update('beginsAt', gameStartTime);
      return serverGame;
    });

    await click(`[data-test-game-id='${game.id}'] [data-test-represent]`);
    await settled();

    assert.dom('[data-test-representings]').doesNotExist();
    assert.dom('[data-test-scheduleds]').exists();

    assert
      .dom('[data-test-scheduleds] [data-test-begins-at]')
      .hasText('Begins in 60 seconds');
    assert
      .dom('[data-test-scheduleds] [data-test-instructions]')
      .hasText('Tap the button as many times as you can');
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

    await this.cable.TeamChannel.handlers.received({
      type: 'changes',
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

  test('a game can be cancelled', async function(assert) {
    const incarnation = this.server.create('incarnation');
    const game = incarnation.createGame();
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'invited',
    });

    this.server.patch(`/games/${game.id}/cancel`, function({
      participations,
      games,
    }) {
      participations.find(teamParticipation.id).update('state', 'cancelled');
      return games.find(game.id);
    });

    await visit('/');
    await click('[data-test-cancel]');

    await settled();

    assert
      .dom(`[data-test-cancellations] [data-test-game-id='${game.id}']`)
      .exists();
  });

  test('a cancelled game can be dismissed', async function(assert) {
    const incarnation = this.server.create('incarnation');
    const game = incarnation.createGame();
    const teamParticipation = game.createParticipation({
      team: this.team,
      state: 'cancelled',
    });

    this.server.patch(`/games/${game.id}/dismiss`, function({
      participations,
      games,
    }) {
      participations.find(teamParticipation.id).update('state', 'dismissed');
      return games.find(game.id);
    });

    await visit('/');
    await click('[data-test-dismiss]');

    await settled();

    assert.dom(`[data-test-game-id='${game.id}']`).doesNotExist();
  });
});
