import Service from '@ember/service';
import { action } from '@ember/object';

class MockVibrationService extends Service {
  calls = 0;

  @action
  vibrate() {
    this.calls++;
  }
}

export default function mockVibration(hooks) {
  hooks.beforeEach(function() {
    this.owner.register('service:vibration', MockVibrationService);
    this.mockVibration = this.owner.lookup('service:vibration');
  });
}
