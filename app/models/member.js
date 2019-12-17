import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;
import { fragment } from 'ember-data-model-fragments/attributes';

export default class MemberModel extends Model {
  @attr('string') name;
  @attr('number') lat;
  @attr('number') lon;

  @attr('string') registrationId;
  @attr('string') registrationType;

  @attr('date') lastSubscribed;
  @attr('date') lastUnsubscribed;

  @fragment('capabilities', { defaultValue: {} }) capabilities;

  get isPresent() {
    return this.lastSubscribed > this.lastUnsubscribed;
  }

  @belongsTo() team;
}
