import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { bind } from '@ember/runloop';

export default class GameActionButton extends Component {
  @task(function*() {
    yield bind(this.args.game, this.args.action)(this.args.data || {});
    return this.game;
  })
  callAction;
}
