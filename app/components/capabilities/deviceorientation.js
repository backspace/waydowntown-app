import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesDeviceorientationComponent extends Component {
  @tracked event;

  @task(function*() {
    let permissionPromise;
    if (
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      permissionPromise = DeviceOrientationEvent.requestPermission();
    } else {
      permissionPromise = Promise.resolve('granted');
    }

    return yield permissionPromise.then(state => {
      if (state === 'granted') {
        this.handler = event => {
          this.event = event;
        };
        window.addEventListener('deviceorientation', this.handler, true);
      } else {
        throw `Permission state: ${state}`;
      }
    });
  })
  request;

  willDestroy() {
    try {
      window.removeEventListener('deviceorientation', this.handler, true);
    } catch (e) {}
  }
}
