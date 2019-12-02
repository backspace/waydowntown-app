import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class VibrationController extends Controller {
  @action
  vibrate() {
    navigator.vibrate(1000);
  }
}
