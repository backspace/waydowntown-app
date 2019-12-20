import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

export default class LocationController extends Controller {
  @controller('member') memberController;
  @tracked event = [];

  @action
  start() {
    this.watchId = navigator.geolocation.watchPosition(position => {
      this.event = position.coords;
      this.event.date = new Date(position.timestamp);

      if (this.memberController.member) {
        const member = this.memberController.member;
        member.setProperties({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        member.save();
      }
    });
  }

  @action
  stop() {
    navigator.geolocation.clearWatch(this.watchId);
  }
}
