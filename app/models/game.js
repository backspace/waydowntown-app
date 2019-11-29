import DS from 'ember-data';
const { Model, belongsTo, hasMany } = DS;
import { modelAction, resourceAction } from 'ember-custom-actions';

export default class GameModel extends Model {
  @belongsTo() incarnation;
  @hasMany() participations;

  accept = modelAction('accept', {
    method: 'POST',
    pushToStore: true,
    queryParams: {
      include: 'incarnation,incarnation.concept,participations.team',
    },
  });

  request = resourceAction('request', {
    method: 'POST',
    pushToStore: true,
    queryParams: { include: 'incarnation,incarnation.concept' },
  });
}
