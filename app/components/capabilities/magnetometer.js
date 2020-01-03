import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesMagnetometerComponent extends Component {
  @tracked reading;

  @task(function*() {
    return yield new Promise((resolve, reject) => {
      window.cordova.plugins.magnetometer.watchReadings(
        ({ x, y, z, magnitude }) => {
          this.reading = {
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z),
            magnitude: parseFloat(magnitude),
          };
          resolve();
        },
        reject,
      );
    });
  })
  request;

  willDestroy() {
    try {
      window.cordova.plugins.magnetometer.stop();
    } catch (e) {}
  }
}
