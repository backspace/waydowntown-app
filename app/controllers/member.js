import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { get, set } from '@ember/object';

import Ember from 'ember';

import config from 'waydowntown/config/environment';

const host = config.APP.server || '';
const wsHost = host.replace('http', 'ws');

export default class ApplicationController extends Controller {
  @service cable;
  @service gameClock;
  @service store;
  @service vibration;

  @storageFor('token') tokenStorage;

  @tracked games;

  consumer = null;

  constructor() {
    super(...arguments);

    this.setupConsumer();
  }

  get teamId() {
    return this.team.id;
  }

  get invitations() {
    return this.games.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      return (
        participationForThisTeam && participationForThisTeam.state === 'invited'
      );
    });
  }

  get acceptances() {
    return this.games.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      return (
        participationForThisTeam?.accepted &&
        game.participations.any(
          participation =>
            participation !== participationForThisTeam &&
            !participation.accepted,
        )
      );
    });
  }

  get convergings() {
    return this.games.filter(game => {
      return game.participations.any(
        participation => participation.state === 'converging',
      );
    });
  }

  get scheduleds() {
    return this.games.filter(game => {
      return game.participations.every(
        participation => participation.state === 'scheduled',
      );
    });
  }

  get activeGames() {
    const now = this.gameClock.date;
    return this.games.filter(game => {
      return game.beginsAt <= now && game.endsAt >= now;
    });
  }

  get finishedGames() {
    return this.games.filter(game => {
      return game.participations.any(
        participation => participation.state === 'finished',
      );
    });
  }

  setupConsumer() {
    this.consumer = this.cable.createConsumer(
      `${wsHost}/cable?token=${this.get('tokenStorage.token')}`,
    );

    this.consumer.subscriptions.create('TeamChannel', {
      connected() {},
      received: message => {
        if (message.type === 'changes') {
          // FIXME why does this massaging need to happen AND why the push/pushPayload dichotomy?
          const data = get(message, 'content.data');
          let dataArray;

          if (data?.length) {
            dataArray = data;
          } else if (data) {
            dataArray = [data];
          }

          if (dataArray) {
            dataArray.filterBy('type', 'game').forEach(model => {
              set(
                model,
                'attributes.beginsAt',
                get(model, 'attributes.begins-at'),
              );
              set(model, 'attributes.endsAt', get(model, 'attributes.ends-at'));
            });
          }

          if (Ember.testing) {
            this.store.push(message.content);
          } else {
            this.store.pushPayload(message.content);
          }
        }
      },
      disconnected() {},
    });

    this.consumer.subscriptions.create('PresenceChannel', {
      connected() {},
      received: message => {
        if (message.type === 'changes') {
          // FIXME why does this massaging need to happen AND why the push/pushPayload dichotomy?
          const data = get(message, 'content.data');
          let dataArray;

          if (data?.length) {
            dataArray = data;
          } else if (data) {
            dataArray = [data];
          }

          if (dataArray) {
            dataArray.filterBy('type', 'member').forEach(model => {
              set(
                model,
                'attributes.lastUnsubscribed',
                get(model, 'attributes.last-unsubscribed'),
              );
              set(
                model,
                'attributes.lastSubscribed',
                get(model, 'attributes.last-subscribed'),
              );
            });
          }

          if (Ember.testing) {
            this.store.push(message.content);
          } else {
            this.store.pushPayload(message.content);
          }
        }
      },
      disconnected() {},
    });
  }

  willDestroy() {
    this.consumer.destroy();
  }

  @task(function*(conceptId, teamId) {
    const emptyGame = this.store.createRecord('game');

    const parameters = {};

    if (conceptId && teamId) {
      parameters.concept_id = conceptId;
      parameters.team_id = teamId;
    }

    const game = yield emptyGame.request(parameters);
    emptyGame.deleteRecord();
    return game;
  })
  requestGame;

  concepts = ['bluetooth-collector', 'tap'];
}
