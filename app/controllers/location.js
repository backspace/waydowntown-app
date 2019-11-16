import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LocationController extends Controller {
  @tracked event = [];

  @action
  start() {
    window.BackgroundGeolocation.configure({
      debug: true
    });

    window.BackgroundGeolocation.on('location', loc => {
      window.BackgroundGeolocation.startTask(key => {
        this.event = loc;
        this.event.date = new Date(loc.time);
        window.BackgroundGeolocation.endTask(key);
      })
    });

    window.BackgroundGeolocation.start();
  }

  @action
  stop() {
    window.BackgroundGeolocation.removeAllListeners();
  }
}
