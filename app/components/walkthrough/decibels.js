import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class WalkthroughDecibelsComponent extends Component {
  @tracked maximumDecibels = 0;

  get max() {
    this.maximumDecibels = Math.max(
      this.maximumDecibels,
      this.args.provider.decibels || 0,
    );

    return this.maximumDecibels;
  }
}
