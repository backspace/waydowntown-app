import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  cordova: attr('string'),
  model: attr('string'),
  platform: attr('string'),
  uuid: attr('string'),
  version: attr('string'),
  manufacturer: attr('string'),
  isVirtual: attr('string'),
  serial: attr('string'),
});
