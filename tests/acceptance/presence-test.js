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

  test('teams are listed with presence indicators', async function(assert) {
    this.member.attrs.last_subscribed = new Date();
    this.member.attrs.last_unsubscribed = new Date(new Date().getTime() - 1000);
    this.member.save();

    const others = this.server.create('team', { name: 'others' });
    others.createMember({
      last_subscribed: new Date(2010, 1, 1),
      last_unsubscribed: new Date(),
    });

    await visit('/');

    assert.dom(`[data-test-team-id='${others.id}']`).hasClass('bg-red-300');
    assert
      .dom(`[data-test-team-id='${this.team.id}']`)
      .hasClass('bg-green-300');
  });
});
