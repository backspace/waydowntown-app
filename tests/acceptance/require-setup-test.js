import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
import resetStorages from 'ember-local-storage/test-support/reset-storage';
import mockCable from '../helpers/mock-cable';

module('Acceptance | require setup', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  mockCable(hooks);

  hooks.beforeEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();
  });

  test('filling in a token shows the logged-in interface with team name and registers the device', async function(assert) {
    const done = assert.async();

    const member = this.server.create('member', { name: 'me' });

    let registrationHandler;

    const mockPushNotification = {
      init() {
        return {
          on(event, handler) {
            if (event === 'registration') {
              registrationHandler = handler;
            }
          },
        };
      },
    };

    window.PushNotification = mockPushNotification;

    await visit('/');

    await fillIn('[data-test-token-field]', member.id);
    await click('[data-test-token-save');

    assert.dom('.text-2xl').exists();
    assert.dom('[data-test-member-name]').hasText('me');

    this.server.patch(`/members/:id`, function({ members }, request) {
      const member = members.find(request.params.id);
      member.update(this.normalizedRequestAttrs());

      assert.equal(member.attrs.registrationId, '1312');
      assert.equal(member.attrs.registrationType, '!');

      done();
      return member;
    });

    registrationHandler({ registrationId: '1312', registrationType: '!' });
  });

  test('it returns to the token field when auth fails', async function(assert) {
    const applicationController = this.owner.lookup('controller:application');
    applicationController.set('tokenStorage.token', 1);

    this.server.post('/auth', () => {
      return new Response(401, {}, {});
    });

    await visitWithAbortedTransition('/');

    assert.dom('[data-test-token-field]').exists();
    assert.dom('[data-test-error]').hasText('Error: Authentication failed');
  });
});

async function visitWithAbortedTransition(url) {
  try {
    await visit(url);
  } catch (error) {
    const { message } = error;
    if (message !== 'TransitionAborted') {
      throw error;
    }
  }
}
