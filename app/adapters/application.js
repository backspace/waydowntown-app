import DS from 'ember-data';
import config from 'waydowntown/config/environment';
import { storageFor } from 'ember-local-storage';

export default class ApplicationAdapter extends DS.JSONAPIAdapter {
  host = config.APP.server;

  @storageFor('token') tokenStorage;

  get headers() {
    return {
      Authorization: `Bearer ${this.get('tokenStorage.token')}`,
    };
  }
}
