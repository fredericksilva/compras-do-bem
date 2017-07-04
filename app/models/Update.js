const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  type: { type: String, default: '', trim: true },
  body: { type: String, default: '', trim: true },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  avaliacao: { type: mongoose.Schema.ObjectId, ref: 'Update' },
  servico: { type: mongoose.Schema.ObjectId, ref: 'Servico' },
  fotos: [String]
}, { timestamps: true });


/**
 * Urlize title.
 */
updateSchema.pre('save', function save(next) {
  next();
});

/**
 * Statics
 */

updateSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(urlized) {
    return this.findOne({ urlized })
      .populate('user', 'profile')
      .populate('avaliacao')
      .populate('servico', 'title body fotos urlized')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list() {
    const criteria = {};
    return this.find(criteria)
      .sort({ createdAt: -1 })
      .populate('user', 'profile')
      .populate('avaliacao')
      .populate('servico', 'title body fotos urlized')
      .exec();
  }
};


const Update = mongoose.model('Update', updateSchema);

module.exports = Update;
