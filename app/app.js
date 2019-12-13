import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

if (config.environment !== 'test') {
  Sentry.init({
    dsn: 'https://33f2ad0ebe0b4daaa89ac7996cb003ef@sentry.io/1848896',
    integrations: [new Integrations.Ember()],
  });
}
