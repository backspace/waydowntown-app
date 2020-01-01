import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class CapabilitiesController extends Controller {
  @tracked error;

  queryParams = ['first', 'forced'];

  get capabilities() {
    return this.get('member.capabilities').toJSON();
  }

  get device() {
    this.set('member.device', window.device || { uuid: 'browser' });
    return this.get('member.device').toJSON();
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
  requestCamera() {
    try {
      navigator.camera.getPicture(
        () => {
          this.set('member.capabilities.camera', true);
          this.transitionToNextStep();
        },
        () => {
          throw new Error('Failed to take a picture');
        },
      );
    } catch (e) {
      this.set('member.capabilities.camera', false);
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

  @action
  requestMagnetometer() {
    try {
      window.cordova.plugins.magnetometer.getReading(
        () => {
          this.set('member.capabilities.magnetometer', true);
          this.transitionToNextStep();
        },
        () => {
          throw new Error('Failed to get magnetometer reading');
        },
      );
    } catch (e) {
      this.set('member.capabilities.magnetometer', false);
      this.set('error', e.message);
    }
  }

  @action
  requestMotion() {
    if (
      window.DeviceMotionEvent &&
      typeof window.DeviceMotionEvent.requestPermission === 'function'
    ) {
      DeviceMotionEvent.requestPermission().then(state => {
        if (state === 'granted') {
          this.set('member.capabilities.devicemotion', true);
          this.transitionToNextStep();
        } else {
          super.willClearElement(...arguments);
          this.error = `Permission state: ${state}`;
        }
      });
    } else {
      this.set('member.capabilities.devicemotion', true);
      this.transitionToNextStep();
    }
  }

  @action
  requestNotifications() {
    this.set('error', undefined);

    try {
      const member = this.get('member');
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
          .then(() => {
            this.set('member.capabilities.notifications', true);
            this.validatingNotifications = true;
          })
          .catch(e => {
            this.set('member.capabilities.notifications', false);
            this.set('error', e.message);
            this.validatingNotifications = false;
          });

        // if (member.hasDirtyAttributes) {
        //   this.set('member.capabilities.notifications', true);
        //   this.transitionToNextStep();
        // }
      });

      push.on('error', error => {
        throw error;
      });
    } catch (e) {
      this.set('member.capabilities.notifications', false);
      this.set('error', e.message);
    }
  }

  @action
  requestOCR() {
    try {
      navigator.camera.getPicture(
        photoUrl => {
          this.photoUrl = photoUrl;

          window.textocr.recText(
            2,
            photoUrl,
            () => {
              this.set('member.capabilities.ocr', true);
              this.transitionToNextStep();
            },
            error => {
              throw error;
            },
          );
        },
        error => {
          throw error;
        },
        {
          correctOrientation: true,
        },
      );
    } catch (e) {
      this.set('member.capabilities.ocr', false);
      this.set('error', e.message);
    }
  }

  @action exit() {
    this.member.capabilities.rollbackAttributes();
    this.transitionToRoute('member');
  }

  @action transitionToNextStep() {
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
      label: 'Notifications',
      description:
        'We need to send push notifications to let you know about games if the app isn’t open.',
      action: this.requestNotifications,
      required: true,
      validationMessage: 'Did you receive a notification?',
    },
    {
      label: 'Bluetooth',
      description:
        'We use Bluetooth to look for nearby devices for some games.',
      action: this.requestBluetooth,
    },
    {
      label: 'Camera',
      description: 'We use the camera for text recogintion. (more eventually?)',
      action: this.requestCamera,
    },
    {
      label: 'Decibel meter',
      description:
        'We use a decibel meter for some games, which requires microphone permissions.',
      action: this.requestDecibels,
    },
    {
      label: 'Magnetometer',
      description: 'We detect magnetic field magnitude for some games.',
      action: this.requestMagnetometer,
    },
    {
      label: 'Motion and orientation',
      description: 'We use motion and orientation events for some games.',
      action: this.requestMotion,
    },
    {
      label: 'Text recognition',
      description:
        'We use text recognition for some games. This will take a photo and attempt to recognise text within it.',
      action: this.requestOCR,
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
      id: 'height',
      label: 'Height',
      description:
        'I can see and reach toward things that are around 2m or 6.5′ from the ground.',
    },
    {
      id: 'scents',
      label: 'Scents',
      description:
        'I can be in spaces that have strong scents, such as those of cleaning products.',
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
      id: 'fastNavigation',
      label: 'Fast navigation',
      description:
        'I am open to playing games where being able to navigate the app interface quickly is an advantage.',
    },
  ];

  @tracked validatingNotifications;

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
