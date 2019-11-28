export default function() {
  this.post('/games/request', schema => {
    return schema.games.first();
  });

  this.post('/auth', ({ teams }, { requestHeaders }) => {
    return teams.find(requestHeaders.authorization.split(' ')[1]);
  });

  this.get('/games'); // FIXME filter based on requesting team
}
