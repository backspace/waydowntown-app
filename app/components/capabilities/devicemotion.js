import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesDevicemotionComponent extends Component {
  @tracked event;

  @task(function*() {
    let permissionPromise;
    if (
      window.DeviceMotionEvent &&
      typeof window.DeviceMotionEvent.requestPermission === 'function'
    ) {
      permissionPromise = DeviceMotionEvent.requestPermission();
    } else {
      permissionPromise = Promise.resolve('granted');
    }

    return yield permissionPromise.then(state => {
      if (state === 'granted') {
        this.handler = event => {
          this.event = event;
        };
        window.addEventListener('devicemotion', this.handler, true);
      } else {
        throw `Permission state: ${state}`;
      }
    });
  })
  request;

  willDestroy() {
    try {
      window.removeEventListener('devicemotion', this.handler, true);
    } catch (e) {}
  }
}
