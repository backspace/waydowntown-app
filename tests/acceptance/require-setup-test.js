import { module, test } from 'qunit';
import { click, currentURL, fillIn, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
import resetStorages from 'ember-local-storage/test-support/reset-storage';
import mockCable from 'waydowntown/tests/helpers/mock-cable';

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

  test('filling in a token shows the logged-in interface with member name and registers the device', async function(assert) {
    const done = assert.async();

    const member = this.server.create('member', {
      name: 'me',
      capabilities: {
        notifications: true,
      },
    });

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

      const requestAttributes = JSON.parse(request.requestBody).data.attributes;

      assert.notOk(requestAttributes.name);
      assert.notOk(requestAttributes.lat);
      assert.notOk(requestAttributes.lon);

      done();
      return member;
    });

    registrationHandler({ registrationId: '1312', registrationType: '!' });
  });

  test('the token can be extracted from the initial URL', async function(assert) {
    const member = this.server.create('member', { name: 'tokenme' });

    await visit(`/?token=${member.id}`);

    assert.dom('[data-test-member-name]').hasText('tokenme');
  });

  test('the token can be entered by scanning a QR code', async function(assert) {
    const member = this.server.create('member', {
      name: 'me',
    });

    window.cordova = {
      plugins: {
        barcodeScanner: {
          scan(success, error) {
            error('Error');
          },
        },
      },
    };

    await visit('/');
    await click('[data-test-scan]');

    assert
      .dom('[data-test-alert]')
      .hasText('There was an error with the QR code scanner: Error');

    window.cordova = {
      plugins: {
        barcodeScanner: {
          scan(success) {
            success({ text: member.id });
          },
        },
      },
    };

    await click('[data-test-scan]');

    assert.dom('[data-test-member-name]').hasText('me');
  });

  test('can return to the login route after logging in while preserving the token', async function(assert) {
    const member = this.server.create('member', { name: 'me' });

    await visit('/');
    await fillIn('[data-test-token-field]', member.id);
    await click('[data-test-token-save');

    assert.dom('[data-test-member-name]').hasText('me');

    await click('[data-test-return-to-login]');

    assert.equal(currentURL(), '/?stop=true');
    assert.dom('[data-test-token-field]').hasValue(member.id);
  });

  test('no save happens if the registration is the same', async function(assert) {
    const member = this.server.create('member', {
      name: 'me',
      capabilities: {
        notifications: true,
      },
      registrationId: '1312',
      registrationType: '!',
      lat: 123,
    });

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

    registrationHandler({ registrationId: '1312', registrationType: '!' });

    await settled();
  });

  test('it returns to the token field when auth fails but doesn’t clear it', async function(assert) {
    const applicationController = this.owner.lookup('controller:application');
    applicationController.set('tokenStorage.token', 1);

    this.server.post('/auth', () => {
      return new Response(401, {}, {});
    });

    await visitWithAbortedTransition('/');

    assert.dom('[data-test-token-field]').hasValue('1');
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
