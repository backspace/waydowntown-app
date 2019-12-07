import Controller from '@ember/controller';
import { action } from '@ember/object';
import { storageFor } from 'ember-local-storage';

export default class IndexErrorController extends Controller {
  @storageFor('token') tokenStorage;

  @action
  saveToken() {
    this.set('tokenStorage.token', this.tokenFieldValue);
    this.transitionToRoute('index');
  }
}
