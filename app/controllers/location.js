import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LocationController extends Controller {
  @tracked event = [];

  @action
  start() {
    this.watchId = navigator.geolocation.watchPosition(position => {
      this.event = position.coords;
      this.event.date = new Date(position.timestamp);
    });
  }

  @action
  stop() {
    navigator.geolocation.clearWatch(this.watchId);
  }
}
