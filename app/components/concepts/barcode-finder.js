import Component from '@glimmer/component';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';

export default class BarcodeFinder extends Component {
  barcodes = [];

  @action updateBarcodes(element, [barcodes]) {
    this.barcodes = barcodes;
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      this.args.game.report({ values: this.barcodes });
    }
  }
}
