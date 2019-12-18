import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  device() {
    return {
      uuid: 'uuid',
    };
  },
});
