import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(game, server) {
    server.schema.teams.all().models.forEach(team => {
      game.createParticipation({
        team,
        state: game.state,
      });
    });

    if (game.attrs.state) {
      delete game.attrs.state;
    }

    if (game.conceptName) {
      const incarnation = game.createIncarnation();
      incarnation.createConcept({
        name: game.conceptName,
      });

      delete game.attrs.conceptName;
    }
  },
});
