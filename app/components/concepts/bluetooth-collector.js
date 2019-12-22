import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default class BluetoothCollector extends Component {
  @service bluetooth;

  get bluetoothEnabled() {
    return this.bluetooth.status === 'enabled';
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      this.bluetooth.stop();
      this.args.game.report({ value: this.bluetooth.devices.length });
      this.bluetooth.clear();
    }
  }
}
