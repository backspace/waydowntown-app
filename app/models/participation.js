import DS from 'ember-data';
const { Model, attr, belongsTo, hasMany } = DS;

export default class ParticipationModel extends Model {
  @belongsTo() game;
  @belongsTo() team;

  @hasMany() representations;

  @attr() state;
  @attr('boolean') initiator;

  get accepted() {
    return this.state === 'accepted';
  }
}
