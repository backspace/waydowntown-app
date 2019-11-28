import DS from 'ember-data';
const { Model, belongsTo, hasMany } = DS;
import { resourceAction } from 'ember-custom-actions';

export default class GameModel extends Model {
  @belongsTo() incarnation;
  @hasMany() participations;

  request = resourceAction('request', {
    method: 'POST',
    pushToStore: true,
    queryParams: { include: 'incarnation,incarnation.concept' },
  });
}
