import DS from 'ember-data';
const { Model, belongsTo } = DS;
import { resourceAction } from 'ember-custom-actions';

export default class GameModel extends Model {
  @belongsTo() incarnation;

  request = resourceAction('request', {
    method: 'POST',
    pushToStore: true,
    queryParams: { include: 'incarnation,incarnation.concept' },
  });
}
