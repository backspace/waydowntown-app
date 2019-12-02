import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('battery');
  this.route('bluetooth-scan');
  this.route('brightness');
  this.route('compass');
  this.route('db-meter');
  this.route('location');
  this.route('motion');
  this.route('orientation');
  this.route('sim');
  this.route('vibration');
  this.route('volume');

  this.route('member');

  this.route('teams');
});
