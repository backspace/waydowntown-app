import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('member', function() {
    this.route('archived');
    this.route('capabilities');
    this.route('map');
  });

  this.route('barcode');
  this.route('battery');
  this.route('bluetooth-scan');
  this.route('brightness');
  this.route('compass');
  this.route('db-meter');
  this.route('location');
  this.route('motion');
  this.route('ocr');
  this.route('orientation');
  this.route('palette');
  this.route('sim');
  this.route('vibration');
  this.route('volume');
});
