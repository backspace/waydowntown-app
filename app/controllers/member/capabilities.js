import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class CapabilitiesController extends Controller {
  @tracked error;

  get capabilities() {
    return this.get('member.capabilities').toJSON();
  }

  @action
  requestLocation() {
    navigator.geolocation.getCurrentPosition(
      () => {
        this.set('member.capabilities.location', true);
        this.transitionToNextStep();
      },
      error => {
        this.error = error;
      },
    );
  }

  @action
  requestBluetooth() {
    try {
      window.bluetoothle.initialize(({ status }) => {
        if (status === 'enabled') {
          this.set('member.capabilities.bluetooth', true);
          this.transitionToNextStep();
        } else {
          throw new Error('Failed to obtain access to Bluetooth');
        }
      });
    } catch (e) {
      this.set('member.capabilities.bluetooth', false);
      this.set('error', e.message);
    }
  }

  @action
  requestDecibels() {
    let succeeded = false;

    try {
      window.DBMeter.start(
        dB => {
          if (!succeeded) {
            succeeded = true;

            window.DBMeter.stop(
              () => {
                this.set('member.capabilities.decibels', true);
                this.transitionToNextStep();
              },
              error => {
                throw error;
              },
            );
          } else if (!dB) {
            throw new Error('Failed to obtain decibels');
          }
        },
        error => {
          throw error;
        },
      );
    } catch (e) {
      this.set('member.capabilities.decibels', false);
      this.set('error', e.message);
    }
  }

  @action exit() {
    this.member.capabilities.rollbackAttributes();
    this.transitionToRoute('member');
  }

  transitionToNextStep() {
    this.error = undefined;
    this.stepManager['transition-to-next']();
  }

  hardwareCapabilities = [
    {
      label: 'Location',
      description:
        'We need to track your location to be able to connect you with nearby teams for games. This will only be used during the adventure and beta testing.',
      action: this.requestLocation,
      required: true,
    },
    {
      label: 'Bluetooth',
      description:
        'We use Bluetooth to look for nearby devices for some games.',
      action: this.requestBluetooth,
    },
    {
      label: 'Decibel meter',
      description: 'We use a decibel meter for some games.',
      action: this.requestDecibels,
    },
  ];

  physicalCapabilities = [
    {
      id: 'exertion',
      label: 'Exertion',
      description:
        'I can sustain physical exertion for a medium-term period, such as climbing two flights of stairs (? how to ask this without presuming stairs access)',
    },
    {
      id: 'speed',
      label: 'Speed',
      description:
        'I am open to playing games where moving quickly around a space is an advantage.',
    },
    {
      id: 'stairs',
      label: 'Stairs',
      description: 'I can travel up or down stairs to access spaces.',
    },
  ];

  phoneCapabilities = [
    {
      id: 'fastTapping',
      name: 'Fast tapping (???)',
      description:
        'I am open to playing games where being able to tap the phone screen quickly is an advantage.',
    },
  ];

  @task(function*() {
    try {
      yield this.member.save();
      this.transitionToRoute('member');
    } catch (e) {
      this.set('error', 'Error saving capabilities: ' + e);
    }
  })
  save;
}
