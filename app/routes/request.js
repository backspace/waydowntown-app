import Route from '@ember/routing/route';

export default class RequestRoute extends Route {
  model() {
    const emptyGame = this.store.createRecord('game');

    return emptyGame.request().then(game => {
      emptyGame.deleteRecord();
      return game;
    });
  }
}
