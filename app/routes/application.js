import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';

export default class ApplicationRoute extends Route {
  @storageFor('token') tokenStorage;

  model() {
    if (this.get('tokenStorage.token')) {
      this.transitionTo('team');
    }
  }
}
