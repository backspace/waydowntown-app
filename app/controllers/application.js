import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { storageFor } from 'ember-local-storage';
import { alias } from '@ember/object/computed';

export default class ApplicationController extends Controller {
  @service debugLog;
  @storageFor('token') tokenStorage;

  @alias('tokenStorage.token') token;

  @action
  url() {
    this.debugLog.log(window.location);
  }

  @action
  saveToken() {
    this.set('token', this.tokenFieldValue);
    this.transitionToRoute('team');
  }
}
