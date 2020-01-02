import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class WalkthroughMagnetometerComponent extends Component {
  @tracked maximumMagnitude = 0;

  get max() {
    this.maximumMagnitude = Math.max(
      this.maximumMagnitude,
      this.args.provider.reading?.magnitude || 0,
    );

    return this.maximumMagnitude;
  }
}
