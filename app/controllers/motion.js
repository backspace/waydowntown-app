import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MotionController extends Controller {
  @tracked event = [];

  @action
  start() {
    window.addEventListener('devicemotion', event => {
      this.event = event;
    }, true);
  }
}
