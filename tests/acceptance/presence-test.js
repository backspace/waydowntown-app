import { module, test } from 'qunit';
import { click, fillIn, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import resetStorages from 'ember-local-storage/test-support/reset-storage';
import mockCable from 'waydowntown/tests/helpers/mock-cable';

module('Acceptance | request game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  mockCable(hooks);

  hooks.beforeEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();
  });

  test('teams are listed with presence indicators', async function(assert) {
    const member = this.server.create('member', { name: 'me' });
    const team = member.createTeam({ name: 'our team' });

    const others = this.server.create('team', { name: 'others' });
    const otherMember = others.createMember({
      last_subscribed: new Date(2010, 1, 1),
      last_unsubscribed: new Date(2011, 1, 1),
    });

    await visit('/');

    await fillIn('[data-test-token-field]', member.id);
    await click('[data-test-token-save');

    assert.dom(`[data-test-team-id='${others.id}']`).hasClass('bg-red-300');
    assert.dom(`[data-test-team-id='${team.id}']`).doesNotExist();

    otherMember.attrs.last_subscribed = new Date();
    otherMember.save();

    await this.cable.PresenceChannel.handlers.received({
      type: 'changes',
      content: this.server.serializerOrRegistry.serialize(otherMember),
    });

    await settled();

    assert.dom(`[data-test-team-id='${others.id}']`).hasClass('bg-green-300');
  });
});
