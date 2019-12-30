import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { storageFor } from 'ember-local-storage';
import { hash } from 'rsvp';

export default class MemberRoute extends Route {
  @service debugLog;
  @storageFor('token') tokenStorage;

  model() {
    const adapter = this.store.adapterFor('application');
    const host = adapter.host || '';

    if (!this.get('tokenStorage.token')) {
      this.transitionTo('index');
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

  @action
  error(error) {
    this.controllerFor('index').set('error', error);
    this.replaceWith('index', { queryParams: { stop: true } });
  }

  setupController(controller, { games, member, team, teams }) {
    // TODO is this the best place for this?
    if (window.PushNotification && member.get('capabilities.notifications')) {
      const push = window.PushNotification.init({
        android: {},
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

      push.on('notification', data => {
        this.debugLog.log('Push received');
        this.debugLog.log(JSON.stringify(data));
      });

      push.on('error', error =>
        this.debugLog.log('Push notification registration error!', error),
      );
    }

    if (navigator.geolocation && member.get('capabilities.location')) {
      navigator.geolocation.watchPosition(
        ({ coords: { latitude, longitude } }) => {
          member.setProperties({
            lat: latitude,
            lon: longitude,
          });

          if (member.hasDirtyAttributes) {
            member.save();
          }
        },
        error => {
          this.debugLog.log('Geolocation error');
          this.debugLog.log(JSON.stringify(error));
        },
      );
    }

    controller.setProperties({ games, member, team, teams });
  }
}
