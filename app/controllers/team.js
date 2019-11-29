import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import config from 'waydowntown/config/environment';

const host = config.APP.server || '';
const wsHost = host.replace('http', 'ws');

export default class ApplicationController extends Controller {
  @service cable;
  @service store;

  @storageFor('token') tokenStorage;

  @alias('tokenStorage.token') token;

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

      return participationForThisTeam && !participationForThisTeam.accepted;
    });
  }

  get acceptances() {
    return this.games.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      return (
        participationForThisTeam &&
        participationForThisTeam.accepted &&
        game.participations.any(
          participation =>
            participation !== participationForThisTeam &&
            !participation.accepted,
        )
      );
    });
  }

  get scheduleds() {
    return this.games.filter(game => {
      return game.participations.every(participation => participation.accepted);
    });
  }

  setupConsumer() {
    this.consumer = this.cable.createConsumer(
      `${wsHost}/cable?token=${this.token}`,
    );

    this.consumer.subscriptions.create('TeamChannel', {
      connected() {},
      received: message => {
        if (message.type === 'invitation') {
          this.store.push(message.content);
        }
      },
      disconnected() {},
    });
  }

  willDestroy() {
    this.consumer.destroy();
  }

  @task(function*() {
    const emptyGame = this.store.createRecord('game');

    const game = yield emptyGame.request();
    emptyGame.deleteRecord();
    return game;
  })
  requestGame;
}
