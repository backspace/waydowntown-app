import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';

export default class MultipleChoice extends Component {
  @tracked questionIndex = 0;
  @tracked answers = [];

  @action
  answer(answer) {
    this.answers = [...this.answers, answer];
    this.questionIndex++;

    if (this.complete) {
      if (!getOwner(this).isDestroying) {
        this.args.game.report({ values: this.answers });
      }
    }
  }

  get questions() {
    return this.args.game.get('incarnation.questions');
  }

  get currentQuestion() {
    return this.questions[this.questionIndex];
  }

  get progress() {
    return this.questionIndex + 1;
  }

  get complete() {
    return this.questionIndex >= this.questions.length;
  }
}
