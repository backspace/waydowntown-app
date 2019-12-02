import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

class MockClockService extends Service {
  @tracked date;

  constructor() {
    super(...arguments);
    this.date = new Date();
  }
}

export default function mockCable(hooks) {
  hooks.beforeEach(function() {
    this.owner.register('service:game-clock', MockClockService);

    this.setGameClock = date => {
      this.owner.lookup('service:game-clock').date = date;
    };
  });
}
