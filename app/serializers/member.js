import DS from 'ember-data';

export default class MemberSerializer extends DS.JSONAPISerializer {
  serializeAttribute(snapshot, json, key, attributes) {
    if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) {
      super.serializeAttribute(snapshot, json, key, attributes);
    }
  }
}
