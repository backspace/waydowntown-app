import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class MemberController extends Controller {
  @service flashMessages;
  @service gameClock;
  @service store;
  @service vibration;

  @storageFor('token') tokenStorage;

  @tracked games;

  consumer = null;

  get teamId() {
    return this.team.id;
  }

  get persistedGames() {
    return this.games.rejectBy('isNew');
  }

  get invitations() {
    return this.persistedGames.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      return (
        participationForThisTeam && participationForThisTeam.state === 'invited'
      );
    });
  }

  get acceptances() {
    return this.persistedGames.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      // FIXME does it make sense that one participation has to be not accepted?
      return (
        participationForThisTeam?.accepted &&
        game.participations.any(
          participation =>
            participation !== participationForThisTeam &&
            !participation.accepted,
        )
      );
    });
  }

  get convergings() {
    return this.persistedGames.filter(game => {
      return game.participations.any(
        participation => participation.state === 'converging',
      );
    });
  }

  get representings() {
    return this.persistedGames.filter(game => {
      return game.participations.any(
        participation => participation.state === 'representing',
      );
    });
  }

  get scheduleds() {
    return this.persistedGames.filter(game => {
      return (
        this.gameClock.date < game.beginsAt &&
        game.participations.every(
          participation => participation.state === 'scheduled',
        )
      );
    });
  }

  get activeGames() {
    const now = this.gameClock.date;
    return this.persistedGames.filter(game => {
      return game.beginsAt <= now && game.endsAt >= now;
    });
  }

  get finishedGames() {
    return this.persistedGames.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      const representation = participationForThisTeam.representations.find(
        representation => representation.get('member.id') === this.member.id,
      );

      return (
        participationForThisTeam.state === 'finished' &&
        (!representation || !representation.archived)
      );
    });
  }

  get cancelledGames() {
    return this.persistedGames.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      return participationForThisTeam?.state === 'cancelled';
    });
  }

  get scoringGames() {
    return this.persistedGames.filter(game => {
      const participationForThisTeam = game.participations.find(
        participation => participation.get('team.id') === this.teamId,
      );

      return participationForThisTeam?.state === 'scoring';
    });
  }

  @task(function*(conceptId, teamId) {
    const emptyGame = this.store.createRecord('game');

    const parameters = {};

    if (conceptId) {
      parameters.concept_id = conceptId;

      if (teamId) {
        parameters.team_id = teamId;
      }
    }

    try {
      const game = yield emptyGame.request(parameters);
      return game;
    } catch (e) {
      this.flashMessages.warning('There was an error requesting a game');
    } finally {
      emptyGame.deleteRecord();
    }
  })
  requestGame;

  concepts = [
    'bluetooth-collector',
    'magnetometer-magnitude',
    'tap',
    'word-collector',
  ];

  @task(function*() {
    yield this.store.findAll('game', { reload: true });
  })
  reloadGames;
}
