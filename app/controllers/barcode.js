import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BarcodeController extends Controller {
  @tracked barcodes = [];

  @tracked error;

  @action
  scan() {
    if (
      window.cordova &&
      window.cordova.plugins &&
      window.cordova.plugins.barcodeScanner
    ) {
      window.cordova.plugins.barcodeScanner.scan(
        results => {
          this.barcodes = [...this.barcodes, JSON.stringify(results, null, 2)];
        },
        error => (this.error = error),
      );
    } else {
      this.error = 'No access to scanner';
    }
  }
}
