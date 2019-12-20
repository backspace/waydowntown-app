import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from 'waydowntown/tests/helpers/set-token';
import mockCable from 'waydowntown/tests/helpers/mock-cable';
import mockGameClock from 'waydowntown/tests/helpers/mock-game-clock';
import mockVibration from 'waydowntown/tests/helpers/mock-vibration';

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
            'participations,participations.team,participations.team.members,participations.representations,participations.representations.member,incarnation,incarnation.concept',
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

    this.server.patch(
      `/games/${game.id}/arrive`,
      ({ participations, games }) => {
        participations
          .find(teamParticipation.id)
          .update('state', 'representing');

        this.server.create('representation', {
          member: this.member,
          participation: teamParticipation,
        });

        const serverGame = games.find(game.id);
        return serverGame;
      },
    );

    await click(`[data-test-game-id='${game.id}'] [data-test-arrive]`);
    await settled();

    assert.dom('[data-test-convergings]').doesNotExist();
    assert.dom('[data-test-representings]').exists();
  });

  test('invitations, acceptances, convergings, representings, cancellations are listed', async function(assert) {
    const otherTeam = this.server.create('team', { name: 'other team' });
    this.server.create('team', { name: 'a third team' });

    const invitedGame = this.server.create('game', {
      state: 'invited',
    });

    const acceptedGame = this.server.create('game', {
      state: 'accepted',
    });
    this.server.schema.participations
      .findBy({ gameId: acceptedGame.id, teamId: otherTeam.id })
      .update({ state: 'invited' });
    // FIXME see index controller: why is this needed?

    const convergingGame = this.server.create('game', {
      state: 'converging',
    });

    const representingGame = this.server.create('game', {
      state: 'representing',
    });

    const cancelledGame = this.server.create('game', {
      state: 'cancelled',
    });

    await visit('/');

    assert
      .dom(`[data-test-invitations] [data-test-game-id='${invitedGame.id}']`)
      .exists();

    assert
      .dom(`[data-test-acceptances] [data-test-game-id='${acceptedGame.id}']`)
      .exists();

    assert
      .dom(`[data-test-convergings] [data-test-game-id='${convergingGame.id}']`)
      .exists();

    assert
      .dom(
        `[data-test-representings] [data-test-game-id='${representingGame.id}']`,
      )
      .exists();

    assert
      .dom(
        `[data-test-cancellations] [data-test-game-id='${cancelledGame.id}']`,
      )
      .exists();
  });

  test('a representing game can be represented and when it becomes scheduled it shows as that way', async function(assert) {
    const now = new Date();
    const representingEndsAt = new Date(now.getTime() + 1000 * 10);
    this.setGameClock(now);

    const game = this.server.create('game', {
      conceptName: 'tap',
      representingEndsAt,
      state: 'representing',
    });
    const teamParticipation = this.server.schema.participations.findBy({
      teamId: this.team.id,
    });
    teamParticipation.createRepresentation({
      member: this.member,
    });

    await visit('/');

    assert.dom('[data-test-representings]').exists();
    assert
      .dom('[data-test-representing-ends-at]')
      .hasText('Representing ends in 10 seconds');
    assert.dom('[data-test-scheduleds]').doesNotExist();

    this.server.patch(`/games/${game.id}/represent`, function(
      { representations, games },
      { requestBody },
    ) {
      const representing = JSON.parse(requestBody).representing;
      assert.ok(representing);

      representations.all().update('representing', representing);

      return games.find(game.id);
    });

    assert.dom('[data-test-represent]').exists();
    assert.dom('[data-test-antirepresent]').exists();
    assert.dom('[data-test-unrepresent]').doesNotExist();

    await click(`[data-test-game-id='${game.id}'] [data-test-represent]`);
    await settled();

    assert.dom('[data-test-represent]').doesNotExist();
    assert.dom('[data-test-antirepresent]').doesNotExist();
    assert.dom('[data-test-unrepresent]').exists();

    const gameStartTime = new Date(now.getTime() + 1000 * 60);

    this.server.schema.participations.all().update('state', 'scheduled');
    const serverGame = this.server.schema.games.find(game.id);
    serverGame.update('beginsAt', gameStartTime);

    await this.cable.TeamChannel.handlers.received({
      type: 'changes',
      content: this.server.serializerOrRegistry.serialize(serverGame, {
        queryParams: {
          include:
            'participations,participations.team,participations.team.members,participations.representations,participations.representations.member,incarnation,incarnation.concept',
        },
      }),
    });

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
    const game = this.server.create('game', {
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
            'participations,participations.team,participations.team.members,participations.representations,participations.representations.member,incarnation,incarnation.concept',
        },
      }),
    });

    await settled();

    assert
      .dom('[data-test-scheduleds] [data-test-begins-at]')
      .hasText('Begins in 59 seconds');
  });

  test('a game can be cancelled', async function(assert) {
    const game = this.server.create('game', {
      state: 'invited',
    });

    this.server.patch(`/games/${game.id}/cancel`, function({
      participations,
      games,
    }) {
      participations.all().update('state', 'cancelled');
      return games.find(game.id);
    });

    await visit('/');
    await click('[data-test-cancel]');
    await click('[data-test-action-confirmation]');

    await settled();

    assert
      .dom(`[data-test-cancellations] [data-test-game-id='${game.id}']`)
      .exists();
  });

  test('a cancelled game can be dismissed', async function(assert) {
    const game = this.server.create('game', {
      state: 'cancelled',
    });

    this.server.patch(`/games/${game.id}/dismiss`, function({
      participations,
      games,
    }) {
      participations.all().update('state', 'dismissed');
      return games.find(game.id);
    });

    await visit('/');
    await click('[data-test-dismiss]');

    await settled();

    assert.dom(`[data-test-game-id='${game.id}']`).doesNotExist();
  });

  test('a finished game can be archived', async function(assert) {
    this.server.logging = true;
    const game = this.server.create('game', {
      state: 'finished',
    });

    game.createParticipation({
      team: this.server.create('team', { name: 'other team' }),
      state: 'finished',
    });

    this.server.patch(
      `/games/${game.id}/archive`,
      ({ participations, games }) => {
        participations
          .where({ teamId: this.team.id })
          .update('state', 'archived');
        return games.find(game.id);
      },
    );

    await visit('/');
    await click('[data-test-archive]');

    await settled();

    assert.dom(`[data-test-game-id='${game.id}']`).doesNotExist();
  });
});
