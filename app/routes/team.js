import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';

export default class TeamRoute extends Route {
  @storageFor('token') tokenStorage;

  model() {
    const adapter = this.store.adapterFor('application');
    const host = adapter.host || '';

    return fetch(`${host}/auth`, {
      headers: new Headers({
        Authorization: `Bearer ${this.get('tokenStorage.token')}`,
      }),
      method: 'POST',
    }).then(response => response.json());
  }
}
