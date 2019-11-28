import { module, test } from 'qunit';
import { settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import setToken from '../set-token';

let teamSubscriptionHandlers;

class MockCableService extends Service {
  createConsumer() {
    return new MockConsumer();
  }
}

class MockConsumer {
  get subscriptions() {
    return {
      create(channel, handlers) {
        teamSubscriptionHandlers = handlers;
      },
    };
  }

  destroy() {}
}

module('Acceptance | game invitation receipt', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:cable', MockCableService);
  });

  test('a received invitation is displayed', async function(assert) {
    const concept = this.server.create('concept', { name: 'a concept' });
    const incarnation = concept.createIncarnation();
    const game = incarnation.createGame();
    game.createParticipation({
      team: this.server.create('team', { name: 'other team' }),
    });

    await visit('/');

    await teamSubscriptionHandlers.received({
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
      .dom('[data-test-invitation] [data-test-concept-name]')
      .hasText('a concept');
    assert
      .dom('[data-test-invitation] [data-test-team-name]')
      .hasText('other team');
  });
});
