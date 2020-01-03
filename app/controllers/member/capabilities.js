import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class CapabilitiesController extends Controller {
  queryParams = ['first', 'forced'];

  @tracked stepIndex = 0;

  @action previous() {
    this.stepIndex--;
  }

  @action next() {
    this.member.set(`capabilities.${this.step.property}`, true);
    this.stepIndex++;
  }

  @action skip() {
    this.member.set(`capabilities.${this.step.property}`, false);
    this.stepIndex++;
  }

  @action exit() {
    this.member.capabilities.rollbackAttributes();
    this.transitionToRoute('member');
  }

  @task(function*() {
    try {
      yield this.member.save();
      this.transitionToRoute('member');
    } catch (e) {
      this.set('error', 'Error saving capabilities: ' + e);
    }
  })
  save;

  get step() {
    return this.steps[this.stepIndex];
  }

  get progress() {
    return `${this.stepIndex + 1} of ${this.steps.length}`;
  }

  get last() {
    return this.stepIndex === this.steps.length - 1;
  }

  steps = [
    {
      property: 'introduction',
      title: 'Capabilities',
      description:
        'We will walk through required and optional permissions and preferences. There are a lot of steps but this helps ensure you won’t be invited to games your device doesn’t support or that aren’t accessible for you.',
      informational: true,
    },
    {
      property: 'device',
      title: 'Device details',
      description: 'We will store these characteristics about the device.',
      informational: true,
    },
    {
      property: 'location',
      title: 'Location',
      description:
        'We need to track your location to be able to connect you with nearby teams for games. This will only be used during the adventure and beta testing and no history is stored, only the most recent position.',
      required: true,
    },
    {
      property: 'notifications',
      title: 'Notifications',
      description:
        'We need to send push notifications to let you know about games if the app isn’t open. (This is currently broken.)',
      required: true,
    },
    {
      property: 'bluetooth',
      title: 'Bluetooth',
      description:
        'We use Bluetooth to look for nearby devices for some games.',
    },
    {
      property: 'camera',
      title: 'Camera',
      description: 'We use the camera for text recogintion. (more eventually?)',
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
    {
      property: 'devicemotion',
      title: 'Motion and orientation',
      description: 'We use motion and orientation events for some games.',
    },
    {
      property: 'ocr',
      title: 'Text recognition',
      description:
        'We use text recognition for many games. This will take a photo and attempt to recognise text within it.',
    },
    {
      property: 'physical',
      title: 'Physical capabilities',
      description:
        'Some games have a significant physical component or happen in places with accessibility particularities. Let us know what kinds of games and places you can or want to access.',
      informational: true,
    },
    {
      property: 'phone',
      title: 'Phone capabilities',
      description:
        'Games involve particular types of movements on the phone. Let us know which kinds of movements work for you.',
      informational: true,
    },
    {
      property: 'overview',
      title: 'Overview',
      description: 'Here is what we will store:',
      informational: true,
    },
  ];
}
