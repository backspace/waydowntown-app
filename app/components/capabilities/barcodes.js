import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesMagnetometerComponent extends Component {
  @tracked barcodes = [];

  @task(function*() {
    return yield new Promise((resolve, reject) => {
      if (
        !window.cordova ||
        !window.cordova.plugins ||
        !window.cordova.plugins.barcodeScanner
      ) {
        throw 'Barcode scanner not found';
      }

      window.cordova.plugins.barcodeScanner.scan(({ cancelled, text }) => {
        if (!cancelled && !this.barcodes.includes(text)) {
          this.barcodes = [...this.barcodes, text];
        }

        resolve();
      }, reject);
    });
  })
  request;
}
