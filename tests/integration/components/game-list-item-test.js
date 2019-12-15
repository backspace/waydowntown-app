import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

import mockGameClock from 'waydowntown/tests/helpers/mock-game-clock';
import mockVibration from 'waydowntown/tests/helpers/mock-vibration';

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

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom(`[data-test-concept-name]`).hasText('a concept');
  });

  test('teams and their states are listed', async function(assert) {
    this.set('team', { id: 1, name: 'us' });
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'invited', team: this.team }),
        EmberObject.create({ state: 'x', team: { id: 2, name: 'Other' } }),
        EmberObject.create({ state: 'y', team: { id: 3, name: 'Another' } }),
      ],
      team: this.team,
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-team-id="1"] [data-test-name]').hasText('us (you)');
    assert.dom('[data-test-team-id="1"] [data-test-state]').hasText('invited');

    assert.dom('[data-test-team-id="2"] [data-test-name]').hasText('Other');
    assert.dom('[data-test-team-id="2"] [data-test-state]').hasText('x');

    assert.dom('[data-test-team-id="3"] [data-test-name]').hasText('Another');
    assert.dom('[data-test-team-id="3"] [data-test-state]').hasText('y');

    assert.dom('[data-test-name]').exists({ count: 3 });
  });

  test('an invited game has accept and cancel buttons', async function(assert) {
    this.set('team', { id: 1 });
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'invited', team: this.team }),
      ],
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-accept]').exists();
    assert.dom('[data-test-cancel]').exists();
    assert.dom('button').exists({ count: 2 });
  });

  test('an accepted game has a cancel button', async function(assert) {
    this.set('team', { id: 1 });
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'accepted', team: this.team }),
      ],
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-cancel]').exists();
    assert.dom('button').exists({ count: 1 });
  });

  test('a converging game has arrive and cancel buttons', async function(assert) {
    this.set('team', { id: 1 });
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'converging', team: this.team }),
      ],
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-arrive]').exists();
    assert.dom('[data-test-cancel]').exists();
    assert.dom('button').exists({ count: 2 });
  });

  test('a representing game with a self representation has no represent button', async function(assert) {
    this.set('member', { id: 1 });
    this.set('team', { id: 1, members: [this.member] });
    this.set('game', {
      participations: [
        EmberObject.create({
          state: 'representing',
          team: this.team,
          representations: [
            EmberObject.create({ representing: true, member: this.member }),
          ],
        }),
      ],
    });

    await render(
      hbs`<GameListItem @game={{game}} @team={{team}} @member={{member}} />`,
    );

    assert.dom('[data-test-represent]').doesNotExist();
    assert.dom('button').doesNotExist();
  });

  test('a representing game with an other representation has representation buttons', async function(assert) {
    this.set('member', { id: 1 });

    const otherMember = { id: 2 };

    this.set('team', { id: 1, members: [this.member, otherMember] });
    this.set('game', {
      participations: [
        EmberObject.create({
          state: 'representing',
          team: this.team,
          representations: [
            EmberObject.create({ representing: null, member: this.member }),
            EmberObject.create({ representing: true, member: otherMember }),
          ],
        }),
      ],
    });

    await render(
      hbs`<GameListItem @game={{game}} @team={{team}} @member={{member}} />`,
    );

    assert.dom('[data-test-represent]').exists();
    assert.dom('[data-test-antirepresent]').exists();
    assert.dom('button').exists({ count: 2 });
  });

  test('a scheduled game shows instructions and when it begins', async function(assert) {
    const now = new Date();
    const gameStartTime = new Date(now.getTime() + 1000 * 60);
    this.setGameClock(now);

    this.set('team', { id: 1 });
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
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-instructions]').hasText('Game instructions');
    assert.dom('[data-test-begins-at]').hasText('Begins in 60 seconds');
  });

  test('a cancelled game has a dismiss button', async function(assert) {
    this.set('team', { id: 1 });
    this.set('game', {
      participations: [
        EmberObject.create({ state: 'cancelled', team: this.team }),
      ],
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-dismiss]').exists();
    assert.dom('button').exists({ count: 1 });
  });
});
