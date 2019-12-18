import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';

export default class IndexRoute extends Route {
  @storageFor('token') tokenStorage;

  model({ stop, token }) {
    if (token) {
      this.set('tokenStorage.token', token);
    }

    if (this.get('tokenStorage.token') && !stop) {
      this.transitionTo('member');
    }
  }
}
