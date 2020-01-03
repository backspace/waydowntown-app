import Route from '@ember/routing/route';

export default class NeocapRoute extends Route {
  model() {
    return this.modelFor('member').member;
  }

  setupController(controller, model) {
    controller.set('member', model);
  }
}
