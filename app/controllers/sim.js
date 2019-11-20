import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SimController extends Controller {
  @tracked info;
  @tracked error;

  @action
  start() {
    window.plugins.sim.getSimInfo(info => this.info = info, error => this.error = error);
  }
}
