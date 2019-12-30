import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MagnetometerMagnitude extends Component {
  @tracked currentMagnitude = 0;
  @tracked maximumMagnitude = 0;

  @action
  startWatching() {
    window.cordova.plugins.magnetometer.watchReadings(({ magnitude }) => {
      this.currentMagnitude = magnitude;
      this.maximumMagnitude = Math.max(this.maximumMagnitude, magnitude);
    });
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      window.cordova.plugins.magnetometer.stop();
      this.args.game.report({ value: this.maximumMagnitude });
    }
  }
}
