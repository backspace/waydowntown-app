import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | game-results', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders winners, scores, and results', async function(assert) {
    this.set('game', {
      participations: [
        {
          representations: [
            {
              member: {
                id: 'a1',
                name: 'A1',
              },
              result: {
                value: '33',
              },
            },
          ],
          score: 1,
          team: {
            id: 'a',
            name: 'As',
          },
          winner: true,
        },
        {
          representations: [
            {
              member: {
                id: 'b1',
                name: 'B1',
              },
              result: {
                values: ['x', 'y', 'z'],
              },
            },
          ],
          score: 0,
          team: {
            id: 'b',
            name: 'Bs',
          },
          winner: false,
        },
      ],
    });

    await render(hbs`<GameResults @game={{game}} />`);

    assert.dom('[data-test-results]').exists();

    assert.dom('[data-test-team-id="a"] [data-test-score]').hasText('1');
    assert.dom('[data-test-team-id="a"] [data-test-winner]').exists();
    assert.dom('[data-test-member-id="a1"]').hasText('A1: 33');

    assert.dom('[data-test-team-id="b"] [data-test-score]').hasText('0');
    assert.dom('[data-test-team-id="b"] [data-test-winner]').doesNotExist();
    assert.dom('[data-test-member-id="b1"]').hasText('B1: x, y, z');
  });

  test('it renders nothing when no participations have results', async function(assert) {
    this.set('game', {
      participations: [
        {
          representations: [],
        },
      ],
    });

    await render(hbs`<GameResults @game={{game}} />`);

    assert.dom('[data-test-results]').doesNotExist();
  });
});
