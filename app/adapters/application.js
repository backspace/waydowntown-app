import DS from 'ember-data';
import config from 'waydowntown/config/environment';

export default class ApplicationAdapter extends DS.JSONAPIAdapter {
  host = config.APP.server;

  get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }
}
