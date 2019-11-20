import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class VolumeController extends Controller {
  @tracked brightness;

  @action
  getBrightness() {
    window.cordova.plugins.brightness.getBrightness(brightness => this.brightness = brightness);
  }
}
