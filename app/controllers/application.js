import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import config from 'waydowntown/config/environment';
import { tracked } from '@glimmer/tracking';
import { storageFor } from 'ember-local-storage';
import Ember from 'ember';

export default class ApplicationController extends Controller {
  @service debugLog;
  @service flashMessages;

  @storageFor('token') tokenStorage;

  @tracked showDiagnostics = false;
  @tracked api;
  @tracked url;

  @tracked showLogEntries = false;

  get testing() {
    return Ember.testing;
  }

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
