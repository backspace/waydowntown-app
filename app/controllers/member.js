import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { get, set } from '@ember/object';
import { action } from '@ember/object';

import Ember from 'ember';

import config from 'waydowntown/config/environment';

const host = config.APP.server || '';
const wsHost = host.replace('http', 'ws');

export default class MemberController extends Controller {
  @service cable;
  @service debugLog;
  @service flashMessages;
  @service gameClock;
  @service store;
  @service vibration;

  @storageFor('token') tokenStorage;

  @action
  setupConsumer() {
    const token = this.get('tokenStorage.token');

    if (!token) {
      return;
    }

    this.consumer = this.cable.createConsumer(`${wsHost}/cable?token=${token}`);

    this.consumer.subscriptions.create('TeamChannel', {
      connected() {},
      received: message => {
        if (message.type === 'changes') {
          this.debugLog.log('TeamChannel received');
          this.debugLog.log(JSON.stringify(message, null, 2));

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
        this.debugLog.log('PresenceChannel received');
        this.debugLog.log(JSON.stringify(message, null, 2));

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
    this.consumer?.destroy();
  }
}
