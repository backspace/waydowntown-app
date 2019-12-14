import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
import setToken from 'waydowntown/tests/helpers/set-token';
import mockCable from 'waydowntown/tests/helpers/mock-cable';
import mockVibration from 'waydowntown/tests/helpers/mock-vibration';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);
  mockVibration(hooks);

  test('a requested game is displayed as an invitation but does not trigger vibration', async function(assert) {
    this.server.post('/games/request', () => {
      const game = this.server.create('game', {
        conceptName: 'a requested concept',
        state: 'invited',
      });

      this.server.schema.participations.all().update('initiator', true);

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

  test('a request failure shows a flash message but no game is ever rendered', async function(assert) {
    this.server.post('/games/request', () => {
      return new Response(400, {}, {});
    });

    await visit('/');

    await click('[data-test-request]');
    assert.dom('[data-test-game]').doesNotExist();

    await settled();

    assert
      .dom('[data-test-alert]')
      .hasText('There was an error requesting a game');
    assert.dom('[data-test-game]').doesNotExist();
  });

  test('a game cannot be requested when an unfinished one exists', async function(assert) {
    this.server.create('game', {
      state: 'invited',
    });

    await visit('/');

    assert.dom('[data-test-request]').isDisabled();
  });

  test('cancelled, dismissed, and unsent games don’t block requests', async function(assert) {
    this.server.create('game', { state: 'cancelled' });
    this.server.create('game', { state: 'dismissed' });
    this.server.create('game', { state: 'unsent' });

    await visit('/');

    assert.dom('[data-test-request]').isNotDisabled();
  });
});
