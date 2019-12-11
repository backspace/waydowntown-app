import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import config from 'waydowntown/config/environment';
import { tracked } from '@glimmer/tracking';
import { storageFor } from 'ember-local-storage';

export default class ApplicationController extends Controller {
  @service debugLog;
  @storageFor('token') tokenStorage;

  @tracked showDiagnostics = false;
  @tracked api;
  @tracked url;

  @tracked showLogEntries = false;

  @action
  toggleDiagnostics() {
    this.url = window.location;
    this.api = config.APP.server;

    this.showDiagnostics = !this.showDiagnostics;
  }

  @action
  toggleLogEntries() {
    this.showLogEntries = !this.showLogEntries;
  }
}
