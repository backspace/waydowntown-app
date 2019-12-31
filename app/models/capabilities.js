import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  bluetooth: attr('boolean'),
  camera: attr('boolean'),
  decibels: attr('boolean'),
  devicemotion: attr('boolean'),
  location: attr('boolean'),
  magnetometer: attr('boolean'),
  notifications: attr('boolean'),
  ocr: attr('boolean'),

  exertion: attr('boolean'),
  speed: attr('boolean'),
  stairs: attr('boolean'),

  fastNavigation: attr('boolean'),
});
