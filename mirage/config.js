export default function() {
  this.post('/games/request', schema => {
    return schema.games.first();
  });

  this.post('/auth', ({ teams }, { requestHeaders }) => {
    return teams.find(requestHeaders.authorization.split(' ')[1]);
  });
}
