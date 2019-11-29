import Component from '@glimmer/component';

export default class GameListItem extends Component {
  get otherTeams() {
    return this.args.game.participations
      .mapBy('team')
      .rejectBy('id', this.args.team.id);
  }
}
