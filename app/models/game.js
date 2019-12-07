import DS from 'ember-data';
const { Model, attr, belongsTo, hasMany } = DS;
import { modelAction, resourceAction } from 'ember-custom-actions';

export default class GameModel extends Model {
  @belongsTo() incarnation;
  @hasMany() participations;

  @attr('date') beginsAt;
  @attr('date') endsAt;

  accept = modelAction('accept', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include: 'incarnation,incarnation.concept,participations.team',
    },
  });

  arrive = modelAction('arrive', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include: 'incarnation,incarnation.concept,participations.team',
    },
  });

  report = modelAction('report', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include: 'incarnation,incarnation.concept,participations.team',
    },
  });

  cancel = modelAction('cancel', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include: 'incarnation,incarnation.concept,participations.team',
    },
  });

  request = resourceAction('request', {
    method: 'POST',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations,participations.team',
    },
  });
}
