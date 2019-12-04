export default class {
  constructor() {
    this.ids = new Set();
  }

  fetch(data) {
    return data.name || 'generic-concept';
  }

  set(id) {
    if (this.ids.has(id)) {
      throw new Error(`Concept id ${id} has already been used.`);
    }

    this.ids.add(id);
  }

  reset() {
    this.ids.clear();
  }
}
