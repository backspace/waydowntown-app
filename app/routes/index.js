import Route from '@ember/routing/route';
import { storageFor } from 'ember-local-storage';
import { hash } from 'rsvp';

export default class IndexRoute extends Route {
  @storageFor('token') tokenStorage;

  model() {
    const adapter = this.store.adapterFor('application');
    const host = adapter.host || '';

    if (this.get('tokenStorage.token')) {
      return fetch(`${host}/auth?include=team`, {
        headers: new Headers({
          Authorization: `Bearer ${this.get('tokenStorage.token')}`,
        }),
        method: 'POST',
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Authentication failed');
          }
        })
        .then(json => this.store.push(json))
        .then(member => {
          return hash({
            member,
            games: this.store.findAll('game', {
              include:
                'participations,participations.team,incarnation,incarnation.concept',
            }),
            teams: this.store.findAll('team', { include: 'members' }),
          });
        })
        .then(({ games, member, teams }) =>
          hash({
            games,
            member,
            team: member.get('team'),
            teams,
          }),
        );
    } else {
      throw new Error('No token');
    }
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
