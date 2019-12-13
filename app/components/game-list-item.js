import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
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
    return this.teamParticipation?.state === 'representing';
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

  @task(function*() {
    yield this.args.game.accept();
    return this.game;
  })
  acceptGame;

  @task(function*() {
    yield this.args.game.arrive();
    return this.game;
  })
  arriveGame;

  @task(function*() {
    yield this.args.game.represent();
    return this.game;
  })
  representGame;

  @task(function*() {
    yield this.args.game.cancel();
    return this.game;
  })
  cancelGame;

  @task(function*() {
    yield this.args.game.dismiss();
    return this.game;
  })
  dismissGame;
}
