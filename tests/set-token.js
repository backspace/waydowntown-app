import resetStorages from 'ember-local-storage/test-support/reset-storage';

export default function setToken(hooks) {
  hooks.beforeEach(function() {
    if (window.localStorage) {
      window.localStorage.clear();
    }

    resetStorages();

    const applicationController = this.owner.lookup('controller:application');
    applicationController.set('tokenStorage.token', 1);
  });
}
