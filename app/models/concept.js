import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default class ConceptModel extends Model {
  @attr('string') name;
  @hasMany() incarnations;

  get instructions() {
    return {
      'bluetooth-collector': 'Find Bluetooth devices',
      tap: 'Tap the button',
      'word-collector': 'Find words text-recognition on images from the camera',
    }[this.id];
  }
}
