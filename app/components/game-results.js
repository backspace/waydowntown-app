import Component from '@glimmer/component';

export default class GameResults extends Component {
  get participationsWithResults() {
    return this.args.game.participations.filter(p => {
      return p.representations.any(
        r => r.result !== undefined && r.result !== null,
      );
    });
  }
}
