import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';
import { hash } from 'rsvp';

export default class TeamRoute extends Route {
  @storageFor('token') tokenStorage;

  model() {
    const adapter = this.store.adapterFor('application');
    const host = adapter.host || '';

    return hash({
      member: fetch(`${host}/auth?include=team`, {
        headers: new Headers({
          Authorization: `Bearer ${this.get('tokenStorage.token')}`,
        }),
        method: 'POST',
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error();
          }
        })
        .then(json => this.store.push(json))
        .catch(() => {
          this.tokenStorage.reset();
          this.controllerFor('application').set('error', 'Invalid token');
          this.transitionTo('application');
        }),
      games: this.store.findAll('game', {
        include:
          'participations,participations.team,incarnation,incarnation.concept',
      }),
      teams: this.store.findAll('team'),
    }).then(({ games, member, teams }) =>
      hash({
        games,
        member,
        team: member.get('team'),
        teams,
      }),
    );
  }

  setupController(controller, { games, member, team, teams }) {
    // TODO is this the best place for this?
    if (window.PushNotification) {
      const push = window.PushNotification.init({
        ios: {
          alert: true,
          badge: true,
          clearBadge: true,
        },
      });

      push.on('registration', ({ registrationId, registrationType }) => {
        member.setProperties({ registrationId, registrationType });
        member.save();
      });
    }

    controller.setProperties({ games, member, team, teams });
  }
}
