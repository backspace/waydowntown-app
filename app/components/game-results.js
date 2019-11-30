import Component from '@glimmer/component';

export default class GameResults extends Component {
  get participationsWithResults() {
    return this.args.game.participations.filter(
      p => p.result !== undefined && p.result !== null, // FIXME change to base on state?
    );
  }
}
