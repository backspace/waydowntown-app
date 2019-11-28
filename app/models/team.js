import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default class TeamModel extends Model {
  @attr('string') name;
  @attr('number') lat;
  @attr('number') lon;

  @hasMany() participations;
}
