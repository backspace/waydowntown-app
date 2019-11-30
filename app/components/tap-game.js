import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class TapGame extends Component {
  @tracked taps = 0;

  @action
  incrementTaps() {
    this.taps += 1;
  }
}
