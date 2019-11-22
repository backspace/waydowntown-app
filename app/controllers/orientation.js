import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrientationController extends Controller {
  @tracked event;

  @action
  start() {
    this.handler = event => (this.event = event);
    window.addEventListener('deviceorientation', this.handler, true);
  }

  @action
  stop() {
    window.removeEventListener('deviceorientation', this.handler, true);
  }
}
