import DS from 'ember-data';
const { Model, attr } = DS;

export default class TeamModel extends Model {
  @attr('string') name;
  @attr('number') lat;
  @attr('number') lon;
}
