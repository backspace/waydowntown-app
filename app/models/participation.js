import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class ParticipationModel extends Model {
  @belongsTo() game;
  @belongsTo() team;

  @attr('boolean') accepted;
}
