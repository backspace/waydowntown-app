import Route from '@ember/routing/route';

export default class MemberRoute extends Route {
  model() {
    return this.modelFor('member');
  }

  afterModel({ member }) {
    const device = window.device || { available: false, uuid: 'browser' };

    // This happens in a browser when serving with Cordova
    if (!device.available) {
      return;
    }

    if (!member.get('device.uuid')) {
      this.transitionTo('member.neocap', {
        queryParams: { first: true },
      });
    } else if (device.version !== member.get('device.version')) {
      this.transitionTo('member.neocap', {
        queryParams: { forced: true },
      });
    }
  }

  setupController(controller, { games, member, team, teams }) {
    controller.setProperties({ games, member, team, teams });
  }
}
