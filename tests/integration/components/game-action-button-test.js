import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | game-action-button', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    this.set('game', store.createRecord('game', { id: 1 }));
  });

  test('the content is yielded', async function(assert) {
    await render(hbs`
      <GameActionButton @game={{game}} @action={{game.arrive}}>
        Button text
      </GameActionButton>
    `);

    assert.dom('button').hasText('Button text');
  });

  test('a test selector is attached', async function(assert) {
    await render(hbs`
      <GameActionButton @game={{game}} @action={{game.arrive}} data-test-test>
        Button text
      </GameActionButton>
    `);

    assert.dom('[data-test-test]').exists();
  });

  test('clicking the button triggers a game action', async function(assert) {
    const done = assert.async();

    this.server.patch(`/games/${this.game.id}/arrive`, function(
      schema,
      { requestBody },
    ) {
      assert.ok(true, 'Action was triggered');
      assert.equal(requestBody, '{}');
      done();
    });

    await render(hbs`
      <GameActionButton @game={{game}} @action={{game.arrive}}>
        Button text
      </GameActionButton>
    `);

    await click('button');
  });

  test('data can be passed through to the action', async function(assert) {
    const done = assert.async();

    this.server.patch(`/games/${this.game.id}/arrive`, function(
      schema,
      { requestBody },
    ) {
      assert.ok(true, 'Action was triggered');
      assert.equal(requestBody, '{"x":1312}');
      done();
    });

    await render(hbs`
      <GameActionButton @game={{game}} @action={{game.arrive}} @data={{hash x=1312}}>
        Button text
      </GameActionButton>
    `);

    await click('button');
  });
});

