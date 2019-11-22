import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BatteryController extends Controller {
  @tracked event = [];

  @action
  start() {
    this.handler = event => (this.event = event);
    window.addEventListener('batterystatus', this.handler, true);
  }

  @action
  stop() {
    window.removeEventListener('batterystatus', this.handler, true);
  }
}
