import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from '../helpers/set-token';
import mockCable from '../helpers/mock-cable';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  test('teams are listed', async function(assert) {
    this.server.create('team', { name: 'others' });
    await visit('/');

    assert.dom('[data-test-teams] [data-test-team]').exists({ count: 2 });
  });
});
