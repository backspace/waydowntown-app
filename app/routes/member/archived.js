import Route from '@ember/routing/route';

export default class ArchivedRoute extends Route {
  model() {
    return this.store.query('game', { archived: true });
  }
}
