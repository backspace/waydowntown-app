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
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  arrive = modelAction('arrive', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  report = modelAction('report', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  represent = modelAction('represent', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  cancel = modelAction('cancel', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  dismiss = modelAction('dismiss', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  archive = modelAction('archive', {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });

  request = resourceAction('request', {
    method: 'POST',
    pushToStore: true,
    queryParams: {
      include:
        'incarnation,incarnation.concept,participations,participations.team,participations.team.members,participations.representations,participations.representations.member',
    },
  });
}
