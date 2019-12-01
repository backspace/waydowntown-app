export default function() {
  this.post('/auth', ({ members }, { requestHeaders }) => {
    return members.find(requestHeaders.authorization.split(' ')[1]);
  });

  this.get('/games'); // FIXME filter based on requesting team

  this.patch('/games/:id/report', function({ games }, { params }) {
    return games.find(params.id);
  });
}
