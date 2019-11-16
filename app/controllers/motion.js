import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MotionController extends Controller {
  @tracked event = [];

  @action
  start() {
    this.handler = event => this.event = event;
    window.addEventListener('devicemotion', this.handler, true);
  }

  @action
  stop() {
    window.removeEventListener('devicemotion', this.handler, true);
  }
}
