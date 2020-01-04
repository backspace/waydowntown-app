import Component from '@glimmer/component';
import L from 'leaflet';
import ENV from 'waydowntown/config/environment';
import Ember from 'ember';
import { task } from 'ember-concurrency';
import { getOwner } from '@ember/application';

export default class Map extends Component {
  lat = 49.8913444;
  lon = -97.1429387;
  zoom = 15;

  bounds = L.latLngBounds(
    L.latLng(49.885707, -97.152909),
    L.latLng(49.897725, -97.134089),
  );

  mapTileUrl = ENV.MAP_TILE_URL;

  get testing() {
    return Ember.testing;
  }

  @task(function*(incarnation) {
    const store = getOwner(this).lookup('service:store');
    const emptyGame = store.createRecord('game');

    const parameters = {
      incarnation_id: incarnation.id,
    };

    try {
      const game = yield emptyGame.request(parameters);
      return game;
    } catch (e) {
      this.flashMessages.warning('There was an error requesting a game');
    } finally {
      emptyGame.deleteRecord();
    }
  })
  requestGame;
}
