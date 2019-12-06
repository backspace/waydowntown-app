import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default class ConceptModel extends Model {
  @attr('string') name;
  @hasMany() incarnations;

  get instructions() {
    return {
      'bluetooth-collector': 'Find as many Bluetooth devices as you can',
      tap: 'Tap the button as many times as you can',
    }[this.id];
  }
}
