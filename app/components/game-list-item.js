import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class GameListItem extends Component {
  get teamParticipation() {
    return this.args.game.participations.find(
      participation => participation.get('team.id') === this.args.team.id,
    );
  }

  get canAccept() {
    return this.teamParticipation && this.teamParticipation.state === 'invited';
  }

  get canArrive() {
    return (
      this.teamParticipation && this.teamParticipation.state === 'converging'
    );
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
}
