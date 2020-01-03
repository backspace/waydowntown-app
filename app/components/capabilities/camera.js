import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class CapabilitiesCameraComponent extends Component {
  @task(function*() {
    return yield new Promise((resolve, reject) => {
      if (!navigator.camera || !navigator.camera.getPicture) {
        throw 'Camera not found';
      }

      navigator.camera.getPicture(resolve, reject);
    });
  })
  request;
}
