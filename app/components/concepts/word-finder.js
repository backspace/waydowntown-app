import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';

export default class WordFinder extends Component {
  @tracked words = [];

  @action
  recognise() {
    navigator.camera.getPicture(
      photoUrl => {
        this.photoUrl = photoUrl;

        window.textocr.recText(
          2,
          photoUrl,
          ({ words: { wordtext } }) => {
            wordtext.forEach(word => {
              if (!this.words.includes(word)) {
                this.words = [...this.words, word];
              }
            });
          },
          err => (this.error = err),
        );
      },
      error => (this.error = error),
      {
        correctOrientation: true,
      },
    );
  }

  willDestroy() {
    // TODO will this always call/complete? Extract some kind of game handler?
    if (!getOwner(this).isDestroying) {
      this.args.game.report({ values: this.words });
    }
  }
}
