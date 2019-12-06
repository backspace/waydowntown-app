import Service from '@ember/service';

const cable = {};

class MockCableService extends Service {
  createConsumer() {
    return new MockConsumer();
  }
}

class MockConsumer {
  get subscriptions() {
    return {
      create(channel, handlers) {
        cable[channel] = { handlers };
      },
    };
  }

  destroy() {}
}

export default function mockCable(hooks) {
  hooks.beforeEach(function() {
    this.owner.register('service:cable', MockCableService);
    this.cable = cable;
  });
}
