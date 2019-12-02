import Service from '@ember/service';
import { action } from '@ember/object';

export default class VibrationService extends Service {
  @action
  vibrate() {
    navigator.vibrate(100);
  }
}
