import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

import mockGameClock from '../../helpers/mock-game-clock';
import mockVibration from '../../helpers/mock-vibration';

module('Integration | Component | game-list-item', function(hooks) {
  setupRenderingTest(hooks);
  mockGameClock(hooks);
  mockVibration(hooks);

  hooks.beforeEach(function() {
    this.set('team', { id: '1' });
  });

  test('the concept name is rendered', async function(assert) {
    this.set('game', {
      incarnation: {
        concept: {
          name: 'a concept',
        },
      },
      participations: [],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom(`[data-test-concept-name]`).hasText('a concept');
  });

  test('other teams are listed', async function(assert) {
    // FIXME should list self team as well
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'invited', team: this.team }),
        EmberObject.create({ state: 'invited', team: { name: 'Other' } }),
        EmberObject.create({ state: 'invited', team: { name: 'Another' } }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('li:nth-child(1) [data-test-team-name]').hasText('Other');
    assert.dom('li:nth-child(2) [data-test-team-name]').hasText('Another');
    assert.dom('[data-test-team-name]').exists({ count: 2 });
  });

  test('an invited game has accept and cancel buttons', async function(assert) {
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'invited', team: this.team }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('[data-test-accept]').exists();
    assert.dom('[data-test-cancel]').exists();
    assert.dom('button').exists({ count: 2 });
  });

  test('an accepted game has a cancel button', async function(assert) {
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'accepted', team: this.team }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('[data-test-cancel]').exists();
    assert.dom('button').exists({ count: 1 });
  });

  test('a converging game has arrive and cancel buttons', async function(assert) {
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'converging', team: this.team }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('[data-test-arrive]').exists();
    assert.dom('[data-test-cancel]').exists();
    assert.dom('button').exists({ count: 2 });
  });

  test('a representing game has a represent button', async function(assert) {
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'representing', team: this.team }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('[data-test-represent]').exists();
    assert.dom('button').exists({ count: 1 });
  });

  test('a scheduled game shows instructions and when it begins', async function(assert) {
    const now = new Date();
    const gameStartTime = new Date(now.getTime() + 1000 * 60);
    this.setGameClock(now);

    this.set('game', {
      beginsAt: gameStartTime,
      incarnation: {
        concept: {
          instructions: 'Game instructions',
        },
      },
      participations: [
        EmberObject.create({ state: 'scheduled', team: this.team }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('[data-test-instructions]').hasText('Game instructions');
    assert.dom('[data-test-begins-at]').hasText('Begins in 60 seconds');
  });

  test('a cancelled game has a dismiss button', async function(assert) {
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'cancelled', team: this.team }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{this.team}} />`);

    assert.dom('[data-test-dismiss]').exists();
    assert.dom('button').exists({ count: 1 });
  });
});
