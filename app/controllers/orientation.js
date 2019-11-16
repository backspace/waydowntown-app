import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrientationController extends Controller {
  @tracked event;

  @action
  start() {
    window.addEventListener('deviceorientation', event => {
      this.event = event;
    }, true);
  }
}
