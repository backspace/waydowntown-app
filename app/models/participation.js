import DS from 'ember-data';
const { Model, belongsTo } = DS;

export default class ParticipationModel extends Model {
  @belongsTo() game;
  @belongsTo() team;
}
