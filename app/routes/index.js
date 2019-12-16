import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { hash } from 'rsvp';

export default class IndexRoute extends Route {
  @service('ember-cordova/splash') splash;
  @storageFor('token') tokenStorage;

  model({ token }) {
    const adapter = this.store.adapterFor('application');
    const host = adapter.host || '';

    if (token) {
      this.set('tokenStorage.token', token);
    }

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
        .then(json => {
          this.store.pushPayload(json);
          const member = this.store.peekRecord('member', json.data.id);

          return hash({
            member,
            games: this.store.findAll('game', {
              include:
                'participations,participations.team,participations.team.members,participations.representations,participations.representations.member,incarnation,incarnation.concept',
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

  afterModel() {
    this.splash.hide();
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

        if (member.hasDirtyAttributes) {
          member.save();
        }
      });
    }

    controller.setProperties({ games, member, team, teams });
  }
}
