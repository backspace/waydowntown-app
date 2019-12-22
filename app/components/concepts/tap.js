import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';

export default class Tap extends Component {
  @tracked taps = 0;

  @action
  incrementTaps() {
    this.taps += 1;
  }

  willDestroy() {
    // super(...arguments);

    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      this.args.game.report({ value: this.taps });
    }
  }
}
