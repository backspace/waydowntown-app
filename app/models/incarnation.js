import DS from 'ember-data';
const { Model, attr, belongsTo, hasMany } = DS;

export default class IncarnationModel extends Model {
  @belongsTo() concept;
  @hasMany() games;

  @attr() questions;
  @attr('string') credit;

  @attr('number') lat;
  @attr('number') lon;
}
