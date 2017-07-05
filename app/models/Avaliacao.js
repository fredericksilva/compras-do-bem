const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema({
  body: { type: String, default: '', trim: true },
  soc: { type: Number, default: 3, min: 0, max: 5 },
  amb: { type: Number, default: 3, min: 0, max: 5 },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  feedback: {
    status: { type: Number, default: 2, min: 0, max: 5 },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' }
  },
  servico: { type: mongoose.Schema.ObjectId, ref: 'Servico' },
  fotos: [String]
}, { timestamps: true });


/**
 * Urlize title.
 */
avaliacaoSchema.pre('save', function save(next) {
  next();
});

/**
 * Statics
 */

avaliacaoSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(urlized) {
    return this.findOne({ urlized })
      .populate('user', 'profile')
      .populate('servico', 'urlized title')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list(options) {
    const criteria = options || {};
    return this.find(criteria)
      .sort({ createdAt: -1 })
      .populate('user', 'profile')
      .populate('servico', 'urlized title')
      .exec();
  }
};


const Avaliacao = mongoose.model('Avaliacao', avaliacaoSchema);

module.exports = Avaliacao;
