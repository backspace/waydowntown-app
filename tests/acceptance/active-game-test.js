import { module, test } from 'qunit';
import { click, settled, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setToken from 'waydowntown/tests/helpers/set-token';
import mockCable from 'waydowntown/tests/helpers/mock-cable';
import mockGameClock from 'waydowntown/tests/helpers/mock-game-clock';
import mockVibration from 'waydowntown/tests/helpers/mock-vibration';

module('Acceptance | active game', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setToken(hooks);
  mockCable(hooks);
  mockGameClock(hooks);
  mockVibration(hooks);

  test('an active and representing game is displayed but not shown as scheduled and an inactive one is not', async function(assert) {
    const time = new Date().getTime();
    this.setGameClock(new Date(time));

    this.server.create('game', {
      conceptName: 'tap',
      state: 'scheduled',
      beginsAt: new Date(time - 1000 * 60),
      endsAt: new Date(time + 1000 * 60),
      representing: true,
      instructions: 'Tap tap tap',
      incarnationAttrs: {
        credit: 'Sara Ahmed',
      },
    });

    this.server.create('game', {
      conceptName: 'tap',
      state: 'scheduled',
      beginsAt: new Date(time - 1000 * 60),
      endsAt: new Date(time - 1000 * 59),
    });

    await visit('/');

    assert
      .dom('[data-test-active-game] [data-test-concept-name]')
      .hasText('tap');
    assert.dom('[data-test-time-remaining]').hasText('60 seconds remaining');

    assert.dom('[data-test-instructions]').hasText('Instructions: Tap tap tap');
    assert.dom('[data-test-credit]').hasText('Credit: Sara Ahmed');

    assert.dom('[data-test-active-game]').exists({ count: 1 });

    assert.dom('[data-test-scheduleds]').doesNotExist();
  });

  test('an active but not representing game is shown but cannot be played and does not cause vibration', async function(assert) {
    this.server.create('game', {
      conceptName: 'tap',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: false,
    });

    await visit('/');

    assert.dom('[data-test-taps]').doesNotExist();
    assert.dom('[data-test-tap-target]').doesNotExist();

    assert
      .dom('[data-test-active-game]')
      .includesText('You are not representing your team in this game');
    assert.equal(this.mockVibration.calls, 0);

    assert.dom('[data-test-credit]').doesNotExist();
  });

  test('a game can become active, causing vibration, and then inactive again as time passes', async function(assert) {
    this.server.create('game', {
      conceptName: 'tap',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
    });

    this.setGameClock(new Date(new Date().getTime() - 1000 * 60 * 2));

    await visit('/');

    assert.dom('[data-test-active-game]').doesNotExist();
    assert.equal(this.mockVibration.calls, 0);

    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));
    await settled();

    assert.dom('[data-test-active-game]').exists();
    assert.equal(this.mockVibration.calls, 1);

    this.setGameClock(new Date(new Date().getTime() + 1000 * 30 * 2));
    await settled();

    assert.dom('[data-test-active-game]').doesNotExist();
  });

  test('the tap game counts taps and reports back when it ends', async function(assert) {
    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));

    const game = this.server.create('game', {
      conceptName: 'tap',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
    });

    await visit('/');

    assert.dom('[data-test-active-game] [data-test-taps]').hasText('0');

    await click('[data-test-tap-target]');

    assert.dom('[data-test-active-game] [data-test-taps]').hasText('1');

    await click('[data-test-tap-target]');
    await click('[data-test-tap-target]');
    await click('[data-test-tap-target]');

    assert.dom('[data-test-active-game] [data-test-taps]').hasText('4');

    assert.dom('[data-test-archive]').doesNotExist();
    assert.dom('[data-test-results]').doesNotExist();

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, representations, games }, { requestBody }) => {
        const value = JSON.parse(requestBody).value;
        representations
          .findBy({ memberId: this.member.id })
          .update({ result: { value } });
        participations
          .findBy({ teamId: this.team.id })
          .update({ state: 'finished' });
        return games.find(game.id);
      },
    );

    this.setGameClock(new Date(new Date().getTime() + 1000 * 60 * 2));
    await settled();

    await settled(); // Twice because of the reporting action? 🧐

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-member-id='${this.member.id}'] [data-test-result]`,
      )
      .hasText('4');
    assert.dom('[data-test-archive]').exists();
  });

  test('the bluetooth-collector game counts Bluetooth devices and reports back when it ends', async function(assert) {
    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));

    const game = this.server.create('game', {
      conceptName: 'bluetooth-collector',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
    });

    let scanResultHandler;

    const mockBluetooth = {
      initialize(f) {
        f({ status: 'enabled' });
      },

      startScan(resultHandler) {
        scanResultHandler = resultHandler;
      },

      stopScan() {},
    };

    window.bluetoothle = mockBluetooth;

    await visit('/');

    assert.dom('[data-test-bluetooth-status]').hasText('enabled');

    assert.dom('[data-test-bluetooth-device]').doesNotExist();

    scanResultHandler({
      status: 'scanResult',
      name: 'A',
    });

    await settled();

    assert.dom('[data-test-bluetooth-count]').hasText('1');
    assert.dom('[data-test-bluetooth-device]').hasText('A');

    scanResultHandler({
      status: 'scanResult',
      name: 'B',
    });

    scanResultHandler({
      status: 'scanResult',
      name: 'A',
    });

    await settled();

    assert.dom('[data-test-bluetooth-count]').hasText('2');
    assert.dom('[data-test-bluetooth-device]:nth-child(2)').hasText('B');

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, representations, games }, { requestBody }) => {
        const value = JSON.parse(requestBody).value;
        representations
          .findBy({ memberId: this.member.id })
          .update({ result: { value } });
        participations
          .findBy({ teamId: this.team.id })
          .update({ score: '4', state: 'finished', winner: true });
        return games.find(game.id);
      },
    );

    this.setGameClock(new Date(new Date().getTime() + 1000 * 60 * 2));
    await settled();

    await settled(); // Twice because of the reporting action? 🧐

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-member-id='${this.member.id}'] [data-test-result]`,
      )
      .hasText('2');
    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-score]`,
      )
      .hasText('4');
    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-winner]`,
      )
      .exists();
  });

  test('the barcode-finder game scans barcodes', async function(assert) {
    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));

    const game = this.server.create('game', {
      conceptName: 'barcode-finder',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
    });

    let barcodeSuccessHandler;

    window.cordova = {
      plugins: {
        barcodeScanner: {
          scan(success) {
            barcodeSuccessHandler = success;
          },
        },
      },
    };

    await visit('/');

    assert.dom('[data-test-barcodes]').doesNotExist();
    await click('[data-test-scan]');

    barcodeSuccessHandler({
      text: '1312',
    });

    await settled();

    assert.dom('[data-test-barcodes]').includesText('1312');

    barcodeSuccessHandler({
      text: '1919',
    });

    barcodeSuccessHandler({
      text: '1312',
    });

    barcodeSuccessHandler({
      cancelled: 1,
      text: 'fake',
    });

    await settled();

    assert.dom('[data-test-barcodes]').includesText('1919');
    assert.dom('[data-test-barcodes] li').exists({ count: 2 });

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, representations, games }, { requestBody }) => {
        const values = JSON.parse(requestBody).values;
        representations
          .findBy({ memberId: this.member.id })
          .update({ result: { values } });
        participations
          .findBy({ teamId: this.team.id })
          .update({ state: 'finished', winner: false });
        return games.find(game.id);
      },
    );

    this.setGameClock(new Date(new Date().getTime() + 1000 * 60 * 2));
    await settled();

    await settled(); // Twice because of the reporting action? 🧐

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-member-id='${this.member.id}'] [data-test-result]`,
      )
      .hasText('1312,1919');
  });

  test('the magnetometer-magnitude game reports the highest magnitude', async function(assert) {
    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));

    const game = this.server.create('game', {
      conceptName: 'magnetometer-magnitude',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
    });

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

    await visit('/');

    assert.dom('[data-test-maximum]').hasText('0');
    assert.dom('[data-test-current]').hasText('0');

    magnetometerSuccessHandler({
      magnitude: 100,
    });

    await settled();

    assert.dom('[data-test-maximum]').hasText('100');
    assert.dom('[data-test-current]').hasText('100');

    magnetometerSuccessHandler({
      magnitude: 55,
    });

    magnetometerSuccessHandler({
      magnitude: 22,
    });

    await settled();

    assert.dom('[data-test-maximum]').hasText('100');
    assert.dom('[data-test-current]').hasText('22');
    assert.dom('meter').matchesSelector('[max="100"]');
    assert.dom('meter').matchesSelector('[value="22"]');

    magnetometerSuccessHandler({
      magnitude: 200,
    });

    magnetometerSuccessHandler({
      magnitude: 15,
    });

    await settled();

    assert.dom('[data-test-maximum]').hasText('200');
    assert.dom('[data-test-current]').hasText('15');

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, representations, games }, { requestBody }) => {
        const value = JSON.parse(requestBody).value;
        representations
          .findBy({ memberId: this.member.id })
          .update({ result: { value } });
        participations
          .findBy({ teamId: this.team.id })
          .update({ state: 'finished', winner: false });
        return games.find(game.id);
      },
    );

    this.setGameClock(new Date(new Date().getTime() + 1000 * 60 * 2));
    await settled();

    await settled(); // Twice because of the reporting action? 🧐

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-member-id='${this.member.id}'] [data-test-result]`,
      )
      .hasText('200');
  });

  test('the multiple-choice game asks questions', async function(assert) {
    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));

    const game = this.server.create('game', {
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
      incarnation: this.server.create('incarnation', {
        concept: this.server.create('concept', { id: 'multiple-choice' }),
        questions: [
          {
            text: 'A or B?',
            answers: ['A', 'B'],
          },
          {
            text: 'C, D, or E?',
            answers: ['C', 'D', 'E'],
          },
        ],
      }),
    });

    await visit('/');

    assert.dom('[data-test-progress]').hasText('Question 1 of 2');
    assert.dom('[data-test-question]').hasText('A or B?');
    assert.dom('[data-test-answer]').exists({ count: 2 });

    await click('[data-test-answer-value="A"]');

    assert.dom('[data-test-progress]').hasText('Question 2 of 2');
    assert.dom('[data-test-question]').hasText('C, D, or E?');
    assert.dom('[data-test-answer]').exists({ count: 3 });

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, representations, games }, { requestBody }) => {
        const values = JSON.parse(requestBody).values;
        representations
          .findBy({ memberId: this.member.id })
          .update({ result: { values } });
        participations
          .findBy({ teamId: this.team.id })
          .update({ state: 'finished', winner: false });
        return games.find(game.id);
      },
    );

    await click('[data-test-answer-value="D"]');

    assert.dom('[data-test-complete]').exists();

    await settled();

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-member-id='${this.member.id}'] [data-test-result]`,
      )
      .hasText('A,D');
  });

  test('the word-finder game finds words via OCR', async function(assert) {
    this.setGameClock(new Date(new Date().getTime() - 1000 * 30));

    const game = this.server.create('game', {
      conceptName: 'word-finder',
      state: 'scheduled',
      beginsAt: new Date(new Date().getTime() - 1000 * 60),
      endsAt: new Date(new Date().getTime() + 1000 * 60),
      representing: true,
    });

    let recTextHandler;

    navigator.camera = {
      getPicture(success) {
        success();
      },
    };

    window.textocr = {
      recText(sourceType, uri, success) {
        recTextHandler = success;
      },
    };

    await visit('/');

    assert.dom('[data-test-words]').doesNotExist();
    await click('[data-test-take-photo]');

    recTextHandler({
      words: {
        wordtext: ['Adjective'],
      },
    });

    await settled();

    assert.dom('[data-test-words]').includesText('Adjective');

    recTextHandler({
      words: {
        wordtext: ['Noun', 'Adjective'],
      },
    });

    await settled();

    assert.dom('[data-test-words]').includesText('Noun');
    assert.dom('[data-test-words] li').exists({ count: 2 });

    this.server.patch(
      `/games/${game.id}/report`,
      ({ participations, representations, games }, { requestBody }) => {
        const values = JSON.parse(requestBody).values;
        representations
          .findBy({ memberId: this.member.id })
          .update({ result: { values } });
        participations
          .findBy({ teamId: this.team.id })
          .update({ state: 'finished', winner: false });
        return games.find(game.id);
      },
    );

    this.setGameClock(new Date(new Date().getTime() + 1000 * 60 * 2));
    await settled();

    await settled(); // Twice because of the reporting action? 🧐

    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-member-id='${this.member.id}'] [data-test-result]`,
      )
      .hasText('Adjective,Noun');
    assert
      .dom(
        `[data-test-results] [data-test-team-id='${this.team.id}'] [data-test-winner]`,
      )
      .doesNotExist();
  });
});
