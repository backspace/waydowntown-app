import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DBMeterController extends Controller {
  @tracked dB;

  @action
  start() {
    window.DBMeter.start(dB => this.dB = dB);
  }

  @action
  stop() {
    window.DBMeter.stop();
  }
}
