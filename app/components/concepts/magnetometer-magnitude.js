import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MagnetometerMagnitude extends Component {
  @tracked maximumMagnitude = 0;

  @action setNewMax(element, [newCurrent]) {
    if (newCurrent > this.maximumMagnitude) {
      this.maximumMagnitude = newCurrent;
    }
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      window.cordova.plugins.magnetometer.stop();
      this.args.game.report({ value: this.maximumMagnitude });
    }
  }
}
