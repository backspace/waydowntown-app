import regionFinder from 'waydowntown/utils/region-finder';
import { module, test } from 'qunit';

module('Unit | Utility | region-finder', function() {
  test('it determines which region a point is in', function(assert) {
    assert.equal('graham', regionFinder(49.8919007, -97.1418848));
    assert.equal('main', regionFinder(49.8955307, -97.1384552));
    assert.equal('portage', regionFinder(49.8927707, -97.1490556));
    assert.equal('stmary', regionFinder(49.889317, -97.144782));
    assert.equal('none', regionFinder(49.8947336, -97.1566301));
  });
});
