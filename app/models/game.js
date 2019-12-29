import DS from 'ember-data';
const { Model, attr, belongsTo, hasMany } = DS;
import { modelAction, resourceAction } from 'ember-custom-actions';

const includes =
  'incarnation,incarnation.concept,participations.team,participations.team.members,participations.representations,participations.representations.member';

export default class GameModel extends Model {
  @belongsTo() incarnation;
  @hasMany() participations;

  @attr('date') representingEndsAt;

  @attr('date') beginsAt;
  @attr('date') endsAt;

  @attr('number') duration;

  @attr('string') instructions;

  request = resourceAction('request', {
    method: 'POST',
    pushToStore: true,
    queryParams: {
      include: includes,
    },
  });

  accept = patchModelAction('accept');
  arrive = patchModelAction('arrive');
  represent = patchModelAction('represent');
  report = patchModelAction('report');
  archive = patchModelAction('archive');

  cancel = patchModelAction('cancel');
  dismiss = patchModelAction('dismiss');
}

function patchModelAction(path) {
  return modelAction(path, {
    method: 'PATCH',
    pushToStore: true,
    queryParams: {
      include: includes,
    },
  });
}
