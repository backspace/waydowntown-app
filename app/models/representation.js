import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class RepresentationModel extends Model {
  @belongsTo() member;
  @belongsTo() participation;

  @attr('boolean', { allowNull: true }) representing;
  @attr('boolean') archived;
}
