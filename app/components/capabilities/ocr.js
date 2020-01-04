import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesOcrComponent extends Component {
  @tracked imageUrl;

  @task(function*() {
    window.ocrComponent = this;
    return yield new Promise((resolve, reject) => {
      if (!navigator.camera || !navigator.camera.getPicture) {
        throw 'Camera not found';
      }

      navigator.camera.getPicture(
        imageUrl => {
          this.imageUrl = imageUrl;

          window.textocr.recText(2, imageUrl, resolve, error => {
            reject(error);
          });
        },
        error => {
          reject(error);
        },
        {
          correctOrientation: true,
        },
      );
    });
  })
  request;
}
