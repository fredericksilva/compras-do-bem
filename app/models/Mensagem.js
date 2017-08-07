const mongoose = require('mongoose');

const mensagem = new mongoose.Schema({
  de: { type: mongoose.Schema.ObjectId, ref: 'User' },
  para: { type: mongoose.Schema.ObjectId, ref: 'User' },
  msg: { type: String },
  visto: { type: Boolean, default: false }
}, { timestamps: true });


/**
 * Urlize title.
 */
mensagem.pre('save', function save(next) {
  next();
});

/**
 * Statics
 */

mensagem.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(urlized) {
    return this.findOne({ urlized })
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
    const criteria = options || {};
    return this.find(criteria)
      .sort({ createdAt: -1 })
      .populate('de', 'profile')
      .populate('para', 'profile')
      .exec();
  }
};


const Mensagem = mongoose.model('Mensagem', mensagem);

module.exports = Mensagem;
