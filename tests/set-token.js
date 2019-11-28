import resetStorages from 'ember-local-storage/test-support/reset-storage';

export default function setToken(hooks) {
  hooks.beforeEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();

    const team = this.server.create('team', { name: 'our team' });
    this.team = team;

    const applicationController = this.owner.lookup('controller:application');
    applicationController.set('tokenStorage.token', team.id);
  });

  hooks.afterEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();
  });
}
