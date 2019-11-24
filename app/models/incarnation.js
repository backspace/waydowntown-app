import DS from 'ember-data';
const { Model, belongsTo, hasMany } = DS;

export default class Incarnation extends Model {
  @belongsTo() concept;
  @hasMany() games;
}
