import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { storageFor } from 'ember-local-storage';

export default class ApplicationController extends Controller {
  @service debugLog;
  @storageFor('token') tokenStorage;

  @action
  url() {
    this.debugLog.log(window.location);
  }

  @action
  saveToken() {
    this.set('tokenStorage.token', this.tokenFieldValue);
    this.transitionToRoute('member');
  }
}
