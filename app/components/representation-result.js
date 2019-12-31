import Component from '@glimmer/component';

export default class RepresentationResultComponent extends Component {
  get nonmatches() {
    const result = this.args.representation.result;
    return result.values.length - result.matches.length;
  }
}
