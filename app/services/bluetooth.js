import Service from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BluetoothService extends Service {
  @tracked devices = [];
  @tracked status = 'unknown';

  deviceSet = new Set();

  @tracked error;

  @action
  check() {
    window.bluetoothle.initialize(result => {
      this.status = result.status;
    });
  }

  @action
  clear() {
    this.deviceSet.clear();
    this.devices = [];
  }

  @action
  start() {
    window.bluetoothle.startScan(
      result => {
        if (result.status === 'scanResult') {
          this.deviceSet.add(result.name);
          this.devices = Array.from(this.deviceSet);
        }
      },
      error => {
        this.error = JSON.stringify(error);
      },
      { services: [] },
    );
  }

  @action
  stop() {
    window.bluetoothle.stopScan(
      () => {},
      () => {},
    );
  }
}
