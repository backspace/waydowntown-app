import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default class TeamModel extends Model {
  @attr('string') name;
  @attr('number') lat;
  @attr('number') lon;

  @hasMany() members;
  @hasMany() participations;

  get cannotRequest() {
    const requestableStates = [
      'finished',
      'cancelled',
      'dismissed',
      'archived',
      'unsent',
    ];

    return this.participations.any(
      participation => !requestableStates.includes(participation.state),
    );
  }

  get isPresent() {
    return this.members.any(member => member.isPresent);
  }
}
