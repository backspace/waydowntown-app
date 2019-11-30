import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../set-token';
import mockCable from '../mock-cable';

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

  test('a game can become active and inactive again as time passes', async function(assert) {
    this.owner.register('service:game-clock', MockClockService);

    const concept = this.server.create('concept');
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame({
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
    });

    game.createParticipation({
      team: this.team,
      state: 'scheduled',
    });

    this.owner.lookup('service:game-clock').date = new Date(
      new Date().getTime() - 1000 * 60 * 2,
    );

    await visit('/');

    assert.dom('[data-test-active-game]').doesNotExist();

    this.owner.lookup('service:game-clock').date = new Date(
      new Date().getTime() - 1000 * 30,
    );
    await settled();

    assert.dom('[data-test-active-game]').exists();

    this.owner.lookup('service:game-clock').date = new Date(
      new Date().getTime() + 1000 * 30 * 2,
    );
    await settled();

    assert.dom('[data-test-active-game]').doesNotExist();
  });

  test('the active game counts taps and reports back manually', async function(assert) {
    const concept = this.server.create('concept', {
      name: 'clicky',
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

    await visit('/');

    assert.dom('[data-test-active-game] [data-test-taps]').hasText('0');

    await click('[data-test-tap-target]');

    assert.dom('[data-test-active-game] [data-test-taps]').hasText('1');

    await click('[data-test-tap-target]');
    await click('[data-test-tap-target]');
    await click('[data-test-tap-target]');

    assert.dom('[data-test-active-game] [data-test-taps]').hasText('4');

    assert.dom('[data-test-results]').doesNotExist();

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, games }, { requestBody }) => {
        const result = JSON.parse(requestBody).result;
        participations
          .findBy({ teamId: this.team.id })
          .update('result', result);
        return games.find(game.id);
      },
    );

    await click('[data-test-report]');
    await settled();

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-result]`,
      )
      .hasText('4');
  });
});

class MockClockService extends Service {
  @tracked date;

  constructor() {
    super(...arguments);
    this.date = new Date();
  }
}
