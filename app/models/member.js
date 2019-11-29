import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class MemberModel extends Model {
  @attr('string') name;
  @attr('number') lat;
  @attr('number') lon;

  @belongsTo() team;
}
