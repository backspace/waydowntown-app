import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class TapGame extends Component {
  @tracked taps = 0;

  @action
  incrementTaps() {
    this.taps += 1;
  }

  @task(function*() {
    yield this.args.game.report({ result: this.taps });
    return this.game;
  })
  report;
}
