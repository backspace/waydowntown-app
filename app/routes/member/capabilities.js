import Route from '@ember/routing/route';

export default class CapabilitiesRoute extends Route {
  model() {
    return this.modelFor('member').member;
  }

  setupController(controller, model) {
    controller.set('member', model);
  }
}
