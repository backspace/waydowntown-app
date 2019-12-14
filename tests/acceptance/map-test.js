import { module, test } from 'qunit';
import { click, fillIn, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from 'waydowntown/tests/helpers/set-token';
import mockCable from 'waydowntown/tests/helpers/mock-cable';

module('Acceptance | map', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  test('members show on the live-updating map', async function(assert) {
    this.member.attrs.lat = 49.897561;
    this.member.attrs.lon = -97.140272;
    const others = this.server.create('team', { name: 'others' });
    const otherMember = others.createMember();

    await visit('/');

    assert.dom('[data-test-map]').doesNotExist();

    await click('[data-test-toggle-map]');

    assert.dom('[data-test-map]').exists();
    assert.dom('.leaflet-marker-icon').exists({ count: 1 });

    await click('.leaflet-marker-icon');

    assert
      .dom(`[data-test-marker-popup-member-id='${this.member.id}']`)
      .hasText('me');

    otherMember.attrs.lat = 49.8913444;
    otherMember.attrs.lon = -97.1429387;
    otherMember.save();

    await this.cable.PresenceChannel.handlers.received({
      type: 'changes',
      content: this.server.serializerOrRegistry.serialize(otherMember),
    });

    await settled();

    assert.dom('.leaflet-marker-icon').exists({ count: 2 });
  });
});
