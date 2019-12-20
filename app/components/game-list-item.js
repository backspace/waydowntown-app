import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class GameListItem extends Component {
  @service gameClock;
  @service vibration;

  get teamParticipation() {
    return this.args.game.participations.find(
      participation => participation.get('team.id') === this.args.team.id,
    );
  }

  get participationIsScheduled() {
    return this.teamParticipation?.state === 'scheduled';
  }

  get shouldVibrate() {
    if (!this.teamParticipation) {
      // TODO why does this ever happen?
      return false;
    }

    return (
      this.teamParticipation.state === 'invited' &&
      !this.teamParticipation.initiator
    );
  }

  get canAccept() {
    return this.teamParticipation?.state === 'invited';
  }

  get canArrive() {
    return this.teamParticipation?.state === 'converging';
  }

  get canRepresent() {
    const memberRepresentation = this.memberRepresentation;

    return (
      memberRepresentation &&
      memberRepresentation.representing !== true &&
      memberRepresentation.representing !== false
    );
  }

  get canUnrepresent() {
    const memberRepresentation = this.memberRepresentation;

    return (
      memberRepresentation &&
      memberRepresentation.representing !== null &&
      memberRepresentation.representing !== undefined
    );
  }

  get memberRepresentation() {
    if (this.teamParticipation?.state !== 'representing') {
      return false;
    }

    return this.teamParticipation.representations.find(
      representation => representation.get('member.id') === this.args.member.id,
    );
  }

  get isSoloTeam() {
    return this.args.team.members.length === 1;
  }

  get canCancel() {
    return ['invited', 'accepted', 'converging'].includes(
      this.teamParticipation?.state,
    );
  }

  get canDismiss() {
    return this.teamParticipation?.state === 'cancelled';
  }

  get otherTeams() {
    return this.args.game.participations
      .mapBy('team')
      .rejectBy('id', this.args.team.id);
  }
}
