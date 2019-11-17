import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CompassController extends Controller {
  @tracked event = [];

  @action
  start() {
    this.watchId = window.cordova.plugins.magnetometer.watchReadings(reading => this.event = reading);
  }

  @action
  stop() {
    window.cordova.plugins.magnetometer.stop(this.watchId);
  }
}
