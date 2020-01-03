import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ColorThief from 'colorthief';

export default class PaletteController extends Controller {
  @tracked photoUrl;
  @tracked palette;
  @tracked error;

  @action
  getPicture() {
    navigator.camera.getPicture(
      photoUrl => {
        this.photoUrl = photoUrl;
      },
      error => (this.error = error),
      {
        correctOrientation: true,
      },
      {
        destinationType: navigator.camera.DestinationType.NATIVE_URI,
      },
    );
  }

  @action getPalette() {
    let img = document.querySelector('[data-palette-image]');

    if (img.complete) {
      this.palette = new ColorThief().getPalette(img);
    } else {
      img.addEventListener('load', () => {
        this.palette = new ColorThief().getPalette(img);
      });
    }
  }
}
