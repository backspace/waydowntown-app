import { module, test } from 'qunit';
import { click, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('the requested game’s name is printed', async function(assert) {
    const host = this.owner.lookup('adapter:application').host;
    this.server.post(`${host}/games`, () => {
      return { name: 'a new game' };
    });

    await visit('/');
    await click('[data-test-request]');

    assert.dom('[data-test-game-name]').hasText('a new game');
  });
});
