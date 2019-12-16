import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(game, server) {
    server.schema.teams.all().models.forEach(team => {
      const participation = game.createParticipation({
        team,
        state: game.state,
      });

      if (game.state === 'representing' || game.state === 'scheduled') {
        (team.members || { models: [] }).models.forEach(member => {
          let representation = { member };
          if (Object.prototype.hasOwnProperty.call(game, 'representing')) {
            representation.representing = game.representing;
          }

          participation.createRepresentation(representation);
        });
      }
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
