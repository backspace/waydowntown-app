import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesMagnetometerComponent extends Component {
  @tracked reading;

  @task(function*() {
    return yield new Promise((resolve, reject) => {
      window.cordova.plugins.magnetometer.watchReadings(reading => {
        this.reading = reading;
        resolve();
      }, reject);
    });
  })
  request;

  willDestroy() {
    try {
      window.cordova.plugins.magnetometer.stop();
    } catch (e) {}
  }
}
