import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

import config from 'waydowntown/config/environment';

const host = config.APP.server || '';
const wsHost = host.replace('http', 'ws');

export default class ApplicationController extends Controller {
  @service cable;
  @service store;

  @storageFor('token') tokenStorage;

  @alias('tokenStorage.token') token;

  consumer = null;
  @tracked invitation = null;

  constructor() {
    super(...arguments);

    this.setupConsumer();
  }

  setupConsumer() {
    this.consumer = this.cable.createConsumer(
      `${wsHost}/cable?token=${this.token}`,
    );

    this.consumer.subscriptions.create('TeamChannel', {
      connected() {},
      received: message => {
        if (message.type === 'invitation') {
          const game = this.store.push(message.content);
          this.invitation = game;
        }
      },
      disconnected() {},
    });
  }

  willDestroy() {
    this.consumer.destroy();
  }
}
