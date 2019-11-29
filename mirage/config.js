export default function() {
  this.post('/games/request', schema => {
    return schema.games.first();
  });

  this.post('/auth', ({ members }, { requestHeaders }) => {
    return members.find(requestHeaders.authorization.split(' ')[1]);
  });

  this.get('/games'); // FIXME filter based on requesting team
}
