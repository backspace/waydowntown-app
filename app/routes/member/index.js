import Route from '@ember/routing/route';

export default class MemberRoute extends Route {
  model() {
    return this.modelFor('member');
  }

  setupController(controller, { games, member, team, teams }) {
    controller.setProperties({ games, member, team, teams });
  }
}
