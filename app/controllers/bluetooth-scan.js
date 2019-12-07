import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

export default class BluetoothScanController extends Controller {
  @tracked devices = [];
  @tracked status = 'unknown';

  deviceSet = new Set();

  @tracked error;

  @action
  search() {
    window.bluetoothle.initialize(result => {
      this.status = result.status;

      if (result.status === 'enabled') {
        window.bluetoothle.isScanning(({ isScanning }) => {
          if (isScanning) {
            this.error = 'Already scanning';
          } else {
            later(
              this,
              () => {
                window.bluetoothle.stopScan(
                  () => {},
                  () => {},
                );
              },
              5000,
            );

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
        });
      }
    });
  }
}
