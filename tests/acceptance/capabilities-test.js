import { module, test } from 'qunit';
import {
  click,
  currentURL,
  visit,
  settled,
  setupOnerror,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
import setToken from 'waydowntown/tests/helpers/set-token';
import mockCable from 'waydowntown/tests/helpers/mock-cable';

module('Acceptance | capabilities', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);

  hooks.beforeEach(function() {
    window.device = {
      cordova: 'a',
      model: 'b',
      platform: 'c',
      uuid: 'uuid',
      version: 'e',
      manufacturer: 'f',
      isVirtual: 'g',
      serial: 'h',
    };

    this.oldGetCurrentPosition = navigator.geolocation.getCurrentPosition;

    navigator.geolocation.getCurrentPosition = (success, error) => {
      if (this.getCurrentPositionOverride) {
        this.getCurrentPositionOverride(success, error);
      } else {
        success();
      }
    };
  });

  hooks.afterEach(function() {
    delete window.device;
    navigator.geolocation.getCurrentPosition = this.oldGetCurrentPosition;
  });

  test('device and capabilities are requested and obtained in sequence and persisted', async function(assert) {
    this.member.attrs.capabilities = { stairs: true };
    this.member.save();

    const done = assert.async();
    const expectedCapabilities = {
      bluetooth: false,
      camera: true,
      decibels: false,
      devicemotion: true,
      location: true,
      magnetometer: true,
      notifications: true,
      ocr: true,

      exertion: true,
      height: true,
      scents: true,
      speed: true,
      stairs: false,

      fastNavigation: true,
    };

    let updateCalls = 0;

    this.server.patch(`/members/:id`, function({ members }, request) {
      const member = members.find(request.params.id);

      member.update(this.normalizedRequestAttrs());

      if (updateCalls == 2) {
        assert.deepEqual(member.attrs.device, window.device);
        assert.deepEqual(member.attrs.capabilities, expectedCapabilities);

        done();
      }

      updateCalls++;

      return member;
    });

    await visit('/member/capabilities');

    await click('[data-test-next]');

    assert.dom('h2').includesText('Device');

    Object.keys(window.device).forEach(key => {
      assert
        .dom(`[data-test-device='${key}'] [data-test-value]`)
        .hasText(window.device[key].toString());
    });

    await click('[data-test-next]');

    assert.dom('h2').includesText('Location');

    await click('[data-test-request]');

    window.PushNotification = {
      init() {
        return {
          on(event, handler) {
            if (event === 'registration') {
              handler({ registrationType: 'X', registrationId: 'Y' });
            }
          },
        };
      },
    };

    this.server.post(`/members/${this.member.id}/notify`, () => {
      return new Response(500, {}, {});
    });

    assert.dom('h2').includesText('Notifications');

    await click('[data-test-request]');
    await settled();
    await settled();

    assert.dom('[data-test-error]').exists();
    assert.dom('[data-test-request]').hasText('Try again');

    this.server.post(`/members/${this.member.id}/notify`, () => {
      return new Response(201, {}, {});
    });

    await click('[data-test-request]');
    await settled();
    await settled();

    assert.dom('[data-test-error]').doesNotExist();
    assert
      .dom('[data-test-validation]')
      .hasText('Did you receive a notification?');

    await click('[data-test-validate]');
    await settled();

    const mockBluetooth = {
      initialize(f) {
        f({ status: 'disabled' });
      },
    };

    window.bluetoothle = mockBluetooth;

    assert.dom('h2').includesText('Bluetooth');

    await click('[data-test-request]');
    await settled();

    assert
      .dom('[data-test-error]')
      .hasText('Failed to obtain access to Bluetooth');

    await click('[data-test-skip]');

    navigator.camera = {
      getPicture(success) {
        success();
      },
    };

    assert.dom('h2').includesText('Camera');
    await click('[data-test-request]');
    await settled();

    assert.dom('h2').includesText('Decibel meter');
    await click('[data-test-skip]');

    window.cordova = {
      plugins: {
        magnetometer: {
          getReading(success) {
            success();
          },
        },
      },
    };

    assert.dom('h2').includesText('Magnetometer');
    await click('[data-test-request]');

    window.DeviceMotionEvent = {
      requestPermission() {
        return new Promise(resolve => {
          resolve('granted');
        });
      },
    };

    assert.dom('h2').includesText('Motion and orientation');
    await click('[data-test-request]');
    await settled();

    window.textocr = {
      recText(sourceType, uri, success) {
        success();
      },
    };

    assert.dom('h2').includesText('Text recognition');
    await click('[data-test-request]');
    await settled();

    assert.dom('h2').includesText('Physical');
    await click('#exertion');
    await click('#height');
    await click('#scents');
    await click('#speed');
    await click('#stairs');
    await click('[data-test-next]');

    assert.dom('h2').includesText('Phone');
    await click('#fastNavigation');
    await click('[data-test-next]');

    assert.dom('h2').includesText('Summary');

    Object.keys(expectedCapabilities).forEach(capability => {
      assert
        .dom(`[data-test-capability='${capability}'] [data-test-value]`)
        .hasText(expectedCapabilities[capability].toString());
    });

    assert
      .dom('[data-test-capability]')
      .exists({ count: Object.keys(expectedCapabilities).length });

    await click('[data-test-save]');
  });

  test('a failure to obtain location permissions is displayed but cleared on the next step', async function(assert) {
    this.getCurrentPositionOverride = (success, error) => {
      error('error');
    };

    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-next]');
    await click('[data-test-request]');

    assert.dom('[data-test-error]').hasText('error');

    this.getCurrentPositionOverride = success => {
      success();
    };

    await click('[data-test-request]');

    assert.dom('[data-test-error]').doesNotExist();
  });

  test('exiting the process before anything has changed takes one step', async function(assert) {
    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-exit]');

    assert.equal(currentURL(), '/member');
  });

  test('exiting the process when something has changed takes two steps and reverts changes', async function(assert) {
    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-next]');
    await click('[data-test-request]');

    await click('[data-test-request-exit]');
    await click('[data-test-cancel-exit]');
    await click('[data-test-request-exit]');
    await click('[data-test-exit]');

    assert.equal(currentURL(), '/member');

    const memberRecord = this.owner
      .lookup('service:store')
      .peekRecord('member', this.member.id);
    assert.notOk(memberRecord.capabilities.hasDirtyAttributes);

    await visit('/member/capabilities');
    await click('[data-test-next]');
    await click('[data-test-next]');
    await click('[data-test-request]');
    assert.dom('[data-test-cancel-exit]').doesNotExist();
  });

  test('the walkthrough begins automatically when the device details are unknown', async function(assert) {
    window.device.available = true;
    this.member.attrs.device = {};
    this.member.save();

    await visit('/');

    assert.equal(currentURL(), '/member/capabilities?first=true');
    assert.dom('[data-test-exit]').doesNotExist();
  });

  test('the walkthrough begins automatically with an explanation when the device OS version changes', async function(assert) {
    window.device.available = true;
    this.member.attrs.device.version = '1312';
    this.member.save();

    await visit('/');

    assert.equal(currentURL(), '/member/capabilities?forced=true');
    assert.dom('[role=alert]').exists();
  });

  test('the new walkthrough adds a step to display and confirm capability values', async function(assert) {
    const done = assert.async();

    this.getCurrentPositionOverride = success => {
      success({
        coords: {
          latitude: 100,
          longitude: 100,
          accuracy: 1,
        },
      });
    };

    await visit('/member/neocap');

    assert.dom('h2').hasText('Capabilities');
    assert.dom('[data-test-request]').doesNotExist();

    await click('[data-test-next]');

    assert.dom('h2').includesText('Device');
    assert.dom('[data-test-request]').doesNotExist();

    Object.keys(window.device).forEach(key => {
      assert
        .dom(`[data-test-device='${key}'] [data-test-value]`)
        .hasText(window.device[key].toString());
    });

    await click('[data-test-next]');

    assert.dom('h2').hasText('Location');
    assert.dom('[data-test-progress]').hasText('3 of 9');
    assert
      .dom('.leaflet-tile-pane .leaflet-layer')
      .hasStyle({ opacity: '0.25' });
    assert.dom('.leaflet-overlay-pane path').doesNotExist();

    assert.dom('[data-test-previous]').isDisabled();
    assert.dom('[data-test-next]').isDisabled();

    await click('[data-test-request]');
    await settled();

    assert.dom('.leaflet-tile-pane .leaflet-layer').hasStyle({ opacity: '1' });
    assert.dom('.leaflet-overlay-pane path').exists();
    assert.dom('[data-test-next]').isNotDisabled();

    await click('[data-test-next]');

    assert.dom('h2').hasText('Bluetooth');

    const mockBluetooth = {
      initialize(f) {
        f({ status: 'disabled' });
      },
    };

    window.bluetoothle = mockBluetooth;

    setupOnerror(function(err) {
      assert.ok(err);
    });

    await click('[data-test-request]');
    await settled();

    await click('[data-test-skip]');

    assert.dom('h2').hasText('Camera');

    navigator.camera = {
      getPicture(success) {
        success();
      },
    };

    await click('[data-test-request]');
    await settled();

    await click('[data-test-next]');

    assert.dom('h2').includesText('Decibel meter');
    assert.dom('[data-test-progress]').hasText('6 of 9');
    // assert.dom('[data-test-previous]').isNotDisabled(); FIXME how to handle going backward, shouldn’t have to repeat request
    assert.dom('[data-test-next]').doesNotExist();
    assert.dom('[data-test-skip]').exists();

    let DBMeterHandler;

    window.DBMeter = {
      start(handler) {
        DBMeterHandler = handler;
      },
      stop() {},
    };

    await click('[data-test-request]');

    assert.dom('[data-test-request]').hasClass('loading:bg-region');
    assert.dom('[data-test-max]').hasText('0');

    DBMeterHandler(10);
    await settled();

    assert.dom('[data-test-current]').hasText('10');
    assert.dom('[data-test-max]').hasText('10');

    DBMeterHandler(5);
    await settled();

    assert.dom('[data-test-current]').hasText('5');
    assert.dom('[data-test-max]').hasText('10');

    let magnetometerSuccessHandler;

    window.cordova = {
      plugins: {
        magnetometer: {
          stop() {},
          watchReadings(success) {
            magnetometerSuccessHandler = success;
          },
        },
      },
    };

    await click('[data-test-next]');

    assert.dom('h2').includesText('Magnetometer');

    await click('[data-test-request]');

    magnetometerSuccessHandler({
      magnitude: '10',
    });
    await settled();

    assert.dom('[data-test-current]').hasText('10');
    assert.dom('[data-test-max]').hasText('10');

    magnetometerSuccessHandler({ magnitude: '5' });
    await settled();

    assert.dom('[data-test-current]').hasText('5');
    assert.dom('[data-test-max]').hasText('10');

    await click('[data-test-next]');

    assert.dom('h2').includesText('Motion and orientation');

    window.DeviceMotionEvent = {
      requestPermission() {
        return new Promise(resolve => {
          resolve('granted');
        });
      },
    };

    window.DeviceOrientationEvent = {
      requestPermission() {
        return new Promise(resolve => {
          resolve('granted');
        });
      },
    };

    await click('[data-test-request]');

    await settled();

    await click('[data-test-next]');

    assert.dom('h2').hasText('Overview');
    assert.dom('[data-test-request]').doesNotExist();

    const expectedCapabilities = {
      bluetooth: false,
      camera: true,
      decibels: true,
      devicemotion: true,
      location: true,
      magnetometer: true,
      // notifications: true,
      // ocr: true,

      // exertion: true,
      // height: true,
      // scents: true,
      // speed: true,
      // stairs: false,

      // fastNavigation: true,
    };

    // FIXME when new walkthrough is complete
    const expectedCapabilitiesServer = {
      bluetooth: false,
      camera: true,
      decibels: true,
      devicemotion: true,
      location: true,
      magnetometer: true,
      notifications: false,
      ocr: false,

      exertion: false,
      height: false,
      scents: false,
      speed: false,
      stairs: false,

      fastNavigation: false,
    };

    let updateCalls = 0;

    this.server.patch(`/members/:id`, function({ members }, request) {
      const member = members.find(request.params.id);

      member.update(this.normalizedRequestAttrs());

      if (updateCalls == 0) {
        assert.deepEqual(member.attrs.device, window.device);
        assert.deepEqual(member.attrs.capabilities, expectedCapabilitiesServer);

        done();
      }

      updateCalls++;

      return member;
    });

    Object.keys(expectedCapabilities).forEach(capability => {
      assert
        .dom(`[data-test-capability='${capability}'] [data-test-value]`)
        .hasText(expectedCapabilities[capability].toString());
    });

    assert
      .dom('[data-test-capability]')
      .exists({ count: Object.keys(expectedCapabilitiesServer).length });

    await click('[data-test-save]');
  });
});
