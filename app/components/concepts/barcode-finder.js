import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';

export default class BarcodeFinder extends Component {
  @tracked barcodes = [];

  @action
  scan() {
    if (
      window.cordova &&
      window.cordova.plugins &&
      window.cordova.plugins.barcodeScanner
    ) {
      window.cordova.plugins.barcodeScanner.scan(({ cancelled, text }) => {
        if (!cancelled && !this.barcodes.includes(text)) {
          this.barcodes = [...this.barcodes, text];
        }
      });
    }
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      this.args.game.report({ values: this.barcodes });
    }
  }
}
