const mongoose = require('mongoose');

const notificacao = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  de: { type: mongoose.Schema.ObjectId, ref: 'User' },
  servico: { type: mongoose.Schema.ObjectId, ref: 'Servico' },
  type: { type: String },
  visto: { type: Boolean, default: false }
}, { timestamps: true });


/**
 * Urlize title.
 */
notificacao.pre('save', function save(next) {
  next();
});

/**
 * Statics
 */

notificacao.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(options) {
    return this.findOne(options)
      .populate('de', 'profile')
      .populate('para', 'profile')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list(options) {
    const criteria = options.criteria || {};
    return this.find(criteria)
      .sort({ createdAt: -1 })
      .populate('de', 'profile')
      .populate('para', 'profile')
      .exec();
  }
};


const Notificacao = mongoose.model('Notificacao', notificacao);

module.exports = Notificacao;
