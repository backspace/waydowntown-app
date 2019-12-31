import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | representation-result', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a single value', async function(assert) {
    this.set('representation', {
      result: { value: 1312 },
    });

    await render(
      hbs`<RepresentationResult @representation={{representation}} />`,
    );

    assert.dom('[data-test-result]').hasText('1312');
  });

  test('it renders multiple values', async function(assert) {
    this.set('representation', {
      result: { values: [1312, 1919] },
    });

    await render(
      hbs`<RepresentationResult @representation={{representation}} />`,
    );

    assert.dom('[data-test-result]').hasText('1312, 1919');
  });

  test('it renders matches and the count of non-matches', async function(assert) {
    this.set('representation', {
      result: { matches: [1312, 1919], values: [1312, 1867, 1919] },
    });

    await render(
      hbs`<RepresentationResult @representation={{representation}} />`,
    );

    assert
      .dom('[data-test-result]')
      .hasText('1312, 1919 and 1 other non-match');
  });
});
