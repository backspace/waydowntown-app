import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ColorThief from 'colorthief';

export default class PaletteController extends Controller {
  @tracked photoUrl;
  @tracked palette;
  @tracked error;

  @service debugLog;

  @action
  getPicture() {
    navigator.camera.getPicture(
      photoUrl => {
        this.debugLog.log(`Camera URL: ${photoUrl}`);
        this.photoUrl = `data:image/jpeg;base64,${photoUrl}`;
      },
      error => (this.error = error),
      {
        correctOrientation: true,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        targetWidth: 800,
        targetHeight: 600,
      },
    );
  }

  @action getPalette() {
    let img = document.querySelector('[data-palette-image]');

    if (img.complete) {
      try {
        this.palette = new ColorThief().getPalette(img);
      } catch (e) {
        this.error = JSON.stringify(e);
      }
    } else {
      try {
        this.palette = new ColorThief().getPalette(img);
      } catch (e) {
        this.error = JSON.stringify(e);
      }
    }
  }
}
