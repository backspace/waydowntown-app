import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OcrController extends Controller {
  @tracked photoUrl;
  @tracked recognised;
  @tracked error;

  @action
  recognise() {
    navigator.camera.getPicture(
      photoUrl => {
        this.photoUrl = photoUrl;

        window.textocr.recText(
          2,
          photoUrl,
          recognised => (this.recognised = recognised),
          err => (this.error = err),
        );
      },
      error => (this.error = error),
    );
  }
}
