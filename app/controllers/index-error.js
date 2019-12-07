import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';

export default class IndexErrorController extends Controller {
  @service('ember-cordova/splash') splash;
  @storageFor('token') tokenStorage;

  afterModel() {
    this.splash.hide();
  }

  @action
  saveToken() {
    this.transitionToRoute('index');
  }
}
