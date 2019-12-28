import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { storageFor } from 'ember-local-storage';

export default class IndexController extends Controller {
  @service('ember-cordova/splash') splash;
  @storageFor('token') tokenStorage;

  queryParams = ['stop', 'token'];

  @tracked scanError;

  afterModel() {
    this.splash.hide();
  }

  @action
  saveToken() {
    this.transitionToRoute('member');
  }

  @action
  scan() {
    if (
      window.cordova &&
      window.cordova.plugins &&
      window.cordova.plugins.barcodeScanner
    ) {
      window.cordova.plugins.barcodeScanner.scan(
        results => {
          this.set('tokenStorage.token', results.text);
          this.transitionToRoute('member');
        },
        error => (this.scanError = error),
        { formats: 'QR_CODE', saveHistory: false },
      );
    } else {
      this.scanError = 'No access to scanner';
    }
  }
}
