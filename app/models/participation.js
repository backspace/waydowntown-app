import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class ParticipationModel extends Model {
  @belongsTo() game;
  @belongsTo() team;

  @attr() state;
  @attr('boolean') initiator;

  @attr() result;

  get accepted() {
    return this.state === 'accepted';
  }
}
