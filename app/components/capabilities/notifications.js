import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import Ember from 'ember';

export default class CapabilitiesNotificationsComponent extends Component {
  @task(function*() {
    return yield new Promise((resolve, reject) => {
      try {
        const member = this.args.member;
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
          member
            .save()
            .then(m => m.notify())
            .then(resolve)
            .catch(reject);
        });

        push.on('error', error => {
          reject(error);
        });

        if (!Ember.testing) {
          timeout(5000).then(() => {
            reject('Timeout waiting for notification registration');
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  })
  request;
}
