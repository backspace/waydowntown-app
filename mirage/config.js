export default function() {
  this.post('/games/request', schema => {
    return schema.games.first();
  });
}
