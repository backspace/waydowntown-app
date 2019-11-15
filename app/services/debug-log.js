import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DebugLogService extends Service {
  @tracked entries = [];

  log(entry) {
    this.entries = [...this.entries, entry];
  }
}
