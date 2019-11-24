import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default class ConceptModel extends Model {
  @attr('string') name;
  @hasMany() incarnations;
}
