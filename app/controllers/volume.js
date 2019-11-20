import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class VolumeController extends Controller {
  @tracked volume;

  @action
  getVolume() {
    window.volumeControl.init({}, volume => {
      this.volume = volume;
      // FIXME this seems to listen permanently…?
    });
  }
}
