import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

export default class BluetoothCollector extends Component {
  devices = [];

  @action updateDevices(element, [devices]) {
    console.log('new devices', devices);
    this.devices = devices;
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      this.args.game.report({ value: this.devices.length });
    }
  }
}
