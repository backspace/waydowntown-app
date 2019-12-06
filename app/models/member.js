import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class MemberModel extends Model {
  @attr('string') name;
  @attr('number') lat;
  @attr('number') lon;

  @attr('string') registrationId;
  @attr('string') registrationType;

  @attr('date') lastSubscribed;
  @attr('date') lastUnsubscribed;

  get isPresent() {
    return this.lastSubscribed > this.lastUnsubscribed;
  }

  @belongsTo() team;
}
