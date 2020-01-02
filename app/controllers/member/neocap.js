import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NeocapController extends Controller {
  queryParams = ['first', 'forced'];

  @tracked stepIndex = 0;

  @action previous() {
    this.stepIndex--;
  }

  @action next() {
    // FIXME update capability with true
    this.stepIndex++;
  }

  @action skip() {
    // FIXME update capability with false
    this.stepIndex++;
  }

  @action exit() {
    // this.member.capabilities.rollbackAttributes();
    this.transitionToRoute('member');
  }

  get step() {
    return this.steps[this.stepIndex];
  }

  steps = [
    {
      property: 'location',
      title: 'Location',
      description:
        'We need to track your location to be able to connect you with nearby teams for games. This will only be used during the adventure and beta testing and no history is stored, only the most recent position.',
      required: true,
    },
    {
      property: 'decibels',
      title: 'Decibel meter',
      description:
        'We use a decibel meter for some games, which requires microphone permissions.',
    },
    {
      property: 'magnetometer',
      title: 'Magnetometer',
      description: 'We detect magnetic field magnitude for some games.',
    },
  ];
}
