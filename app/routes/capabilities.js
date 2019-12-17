import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';

export default class CapabilitiesRoute extends Route {
  @storageFor('token') tokenStorage;

  model() {
    // FIXME should be nested under something that provides the member
    const adapter = this.store.adapterFor('application');
    const host = adapter.host || '';

    return fetch(`${host}/auth?include=team`, {
      headers: new Headers({
        Authorization: `Bearer ${this.get('tokenStorage.token')}`,
      }),
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Authentication failed');
        }
      })
      .then(json => {
        this.store.pushPayload(json);
        return this.store.peekRecord('member', json.data.id);
      });
  }

  setupController(controller, model) {
    controller.set('member', model);
  }
}
