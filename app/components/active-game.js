import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ActiveGame extends Component {
  @service gameClock;
  @service vibration;

  get teamParticipation() {
    return this.args.game.participations.find(
      participation => participation.get('team.id') === this.args.team.id,
    );
  }

  get isRepresenting() {
    const memberRepresentation = this.teamParticipation.representations.find(
      representation => representation.get('member.id') === this.args.member.id,
    );

    if (!memberRepresentation) {
      return false;
    }

    return memberRepresentation.representing;
  }
}
