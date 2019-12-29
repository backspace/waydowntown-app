import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default class ConceptModel extends Model {
  @attr('string') name;
  @hasMany() incarnations;

  get description() {
    return {
      'barcode-finder': 'Scan barcodes',
      'bluetooth-collector': 'Find Bluetooth devices',
      tap: 'Tap the button',
      'word-finder': 'Find words via camera text recognition',
    }[this.id];
  }
}
