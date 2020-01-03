import Component from '@glimmer/component';

export default class WalkthroughOverviewComponent extends Component {
  get capabilities() {
    return this.args.member.get('capabilities').toJSON();
  }
}
