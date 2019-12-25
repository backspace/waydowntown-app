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

  test('the concept name and duration are rendered', async function(assert) {
    this.set('game', {
      duration: 30,
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
    assert.dom('[data-test-duration]').hasText('30 seconds');
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

  test('a representing game with a self representation on a team with other members has a button to unrepresent, a countdown, and instructions', async function(assert) {
    const now = new Date();
    const representingEndsAt = new Date(now.getTime() + 1000 * 10);
    this.setGameClock(now);

    this.set('member', { id: 1 });
    this.set('team', { id: 1, members: [this.member, { id: 2 }] });
    this.set('game', {
      incarnation: {
        concept: {
          instructions: 'Representing game instructions',
        },
      },
      participations: [
        EmberObject.create({
          state: 'representing',
          team: this.team,
          representations: [
            EmberObject.create({ representing: false, member: this.member }),
          ],
        }),
      ],
      representingEndsAt,
    });

    await render(
      hbs`<GameListItem @game={{game}} @team={{team}} @member={{member}} />`,
    );

    assert
      .dom('[data-test-unrepresent]')
      .hasText('Revert decision to not represent');
    assert.dom('button').exists({ count: 1 });
    assert
      .dom('[data-test-representing-ends-at]')
      .hasText('Representing ends in 10 seconds');
    assert
      .dom('[data-test-instructions]')
      .hasText('Representing game instructions');
  });

  test('a representing game with a self representation on a solo team has no button to unrepresent but has a countdown', async function(assert) {
    const now = new Date();
    const representingEndsAt = new Date(now.getTime() + 1000 * 10);
    this.setGameClock(now);

    this.set('member', { id: 1 });
    this.set('team', { id: 1, members: [this.member] });
    this.set('game', {
      participations: [
        EmberObject.create({
          state: 'representing',
          team: this.team,
          representations: [
            EmberObject.create({ representing: false, member: this.member }),
          ],
        }),
      ],
      representingEndsAt,
    });

    await render(
      hbs`<GameListItem @game={{game}} @team={{team}} @member={{member}} />`,
    );

    assert.dom('button').doesNotExist();
    assert.dom('[data-test-representing-others]').exists();
    assert
      .dom('[data-test-representing-ends-at]')
      .hasText('Representing ends in 10 seconds');
  });

  test('a representing game with an other representation has representation buttons, an explanation, and a countdown', async function(assert) {
    const now = new Date();
    const representingEndsAt = new Date(now.getTime() + 1000 * 1);
    this.setGameClock(now);

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
      representingEndsAt,
    });

    await render(
      hbs`<GameListItem @game={{game}} @team={{team}} @member={{member}} />`,
    );

    assert.dom('[data-test-represent]').exists();
    assert.dom('[data-test-antirepresent]').exists();
    assert.dom('button').exists({ count: 2 });
    assert.dom('[data-test-representing-choice]').exists();
    assert
      .dom('[data-test-representing-ends-at]')
      .hasText('Representing ends in 1 second');
  });

  test('a scheduled game for a team with multiple members shows instructions, when it begins, and representing status but no representation countdown', async function(assert) {
    const now = new Date();
    const gameStartTime = new Date(now.getTime() + 1000 * 60);
    this.setGameClock(now);

    this.set('member', { id: 1 });

    const otherMember = { id: 2 };

    this.set('team', { id: 1, members: [this.member, otherMember] });
    this.set('game', {
      beginsAt: gameStartTime,
      incarnation: {
        concept: {
          instructions: 'Game instructions',
        },
      },
      participations: [
        EmberObject.create({
          state: 'scheduled',
          team: this.team,
          representations: [
            EmberObject.create({ representing: false, member: this.member }),
            EmberObject.create({ representing: true, member: otherMember }),
          ],
        }),
      ],
      representingEndsAt: new Date(),
    });

    await render(
      hbs`<GameListItem @game={{game}} @team={{team}} @member={{member}} />`,
    );

    assert.dom('[data-test-instructions]').hasText('Game instructions');
    assert.dom('[data-test-begins-at]').hasText('Begins in 60 seconds');
    assert
      .dom('[data-test-scheduled-representing]')
      .hasText('You are not representing your team for this game.');
    assert.dom('[data-test-representing-ends-at]').doesNotExist();
  });

  test('a scheduled game for a solo team does not show representing status', async function(assert) {
    this.set('member', { id: 1 });
    this.set('team', { id: 1, members: [this.member] });
    this.set('game', {
      beginsAt: new Date(),
      participations: [
        EmberObject.create({
          state: 'scheduled',
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

    assert.dom('[data-test-scheduled-representing]').doesNotExist();
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

  test('a scoring game has a message to wait but no buttons or countdown', async function(assert) {
    this.set('member', { id: 1 });
    this.set('team', { id: 1, members: [this.member] });
    this.set('game', {
      beginsAt: new Date(),
      participations: [
        EmberObject.create({ state: 'scoring', team: this.team }),
      ],
    });

    await render(hbs`<GameListItem @game={{game}} @team={{team}} />`);

    assert.dom('[data-test-scoring]').exists();
    assert.dom('[data-test-begins-at]').doesNotExist();
    assert.dom('button').doesNotExist();
  });
});
