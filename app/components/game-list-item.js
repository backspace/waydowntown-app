import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class GameListItem extends Component {
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
}
