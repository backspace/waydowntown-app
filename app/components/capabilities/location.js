import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class CapabilitiesLocationComponent extends Component {
  @task(function*() {
    return yield new Promise((resolve, reject) => {
      try {
        if (!navigator.geolocation.getCurrentPosition) {
          throw 'Geolocation property not found';
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        });
      } catch (error) {
        if (
          window.GeolocationPositionError &&
          error instanceof window.GeolocationPositionError
        ) {
          const messages = {};

          messages[error.PERMISSION_DENIED] = 'Geolocation permissions denied';
          messages[error.POSITION_UNAVAILABLE] = 'Position unavailable';
          messages[error.TIMEOUT] = 'Geolocation timed out';
          messages[error.UNKNOWN_ERROR] = 'An unknown error occurred';

          return messages[error.code] || messages[error.UNKNOWN_ERROR];
        } else {
          throw error;
        }
      }
    });
  })
  request;
}
