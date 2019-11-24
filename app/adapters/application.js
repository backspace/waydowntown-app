import DS from 'ember-data';

export default class ApplicationAdapter extends DS.JSONAPIAdapter {
  get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }
}
