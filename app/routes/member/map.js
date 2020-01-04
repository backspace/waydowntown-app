import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class MemberMapRoute extends Route {
  model() {
    return hash({
      teams: this.modelFor('member').teams,
      incarnations: this.store.findAll('incarnation'),
    });
  }

  setupController(controller, { incarnations, teams }) {
    controller.setProperties({ incarnations, teams });
  }
}
