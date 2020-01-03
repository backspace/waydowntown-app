import Component from '@glimmer/component';

export default class WalkthroughDeviceComponent extends Component {
  get device() {
    // TODO setting in a getter is surely scandalous
    this.args.member.set('device', window.device || { uuid: 'browser' });
    return this.args.member.get('device').toJSON();
  }
}
