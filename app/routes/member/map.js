import Route from '@ember/routing/route';

export default class MemberMapRoute extends Route {
  model() {
    return this.modelFor('member').teams;
  }

  setupController(controller, teams) {
    controller.set('teams', teams);
  }
}
