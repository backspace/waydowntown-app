import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesDecibelsComponent extends Component {
  @tracked decibels;

  @task(function*() {
    return yield new Promise((resolve, reject) => {
      window.DBMeter.start(db => {
        this.decibels = db;
        resolve();
      }, reject);
    });
  })
  request;

  willDestroy() {
    try {
      window.DBMeter.stop();
    } catch (e) {}
  }
}
