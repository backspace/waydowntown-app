import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CapabilitiesBluetoothComponent extends Component {
  @tracked devices = [];
  @tracked status = 'unknown';

  @task(function*() {
    return yield new Promise((resolve, reject) => {
      if (!window.bluetoothle) {
        return reject('Bluetooth is missing');
      }

      return new Promise(initResolve => {
        window.bluetoothle.initialize(({ status }) => {
          this.status = status;

          if (status === 'enabled') {
            initResolve(status);
          } else {
            reject('Bluetooth is disabled');
          }
        });
      }).then(() => {
        window.bluetoothle.startScan(
          ({ status, name }) => {
            if (status === 'scanResult') {
              if (name && !this.devices.includes(name)) {
                this.devices = [...this.devices, name];
              }
            }
            resolve();
          },
          reject,
          { services: [] },
        );
      });
    });
  })
  request;

  willDestroy() {
    try {
      window.bluetoothle.stopScan();
    } catch (e) {}
  }
}
