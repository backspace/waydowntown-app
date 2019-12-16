import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { bind } from '@ember/runloop';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/browser';

export default class GameActionButton extends Component {
  @service flashMessages;

  @task(function*() {
    try {
      yield bind(this.args.game, this.args.action)(this.args.data || {});
      return this.game;
    } catch (e) {
      this.flashMessages.danger('There was an error performing that action');
      console.log('Exception in game action button', e);
      Sentry.captureException(e);
    }
  })
  callAction;
}
