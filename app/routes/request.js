import Route from '@ember/routing/route';

export default class RequestRoute extends Route {
  model() {
    const adapter = this.store.adapterFor('application');
    const host = adapter.host;

    return fetch(`${host}/games`, {
      method: 'POST',
    }).then(response => response.json());
  }
}
