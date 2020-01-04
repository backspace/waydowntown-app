import Component from '@glimmer/component';
import L from 'leaflet';
import ENV from 'waydowntown/config/environment';
import Ember from 'ember';

export default class Map extends Component {
  lat = 49.8913444;
  lon = -97.1429387;
  zoom = 15;

  bounds = L.latLngBounds(
    L.latLng(49.885707, -97.152909),
    L.latLng(49.897725, -97.134089),
  );

  mapTileUrl = ENV.MAP_TILE_URL;
  testing = Ember.testing;
}
