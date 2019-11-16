import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('battery');
  this.route('bluetooth-scan');
  this.route('location');
  this.route('motion');
  this.route('orientation');
});
