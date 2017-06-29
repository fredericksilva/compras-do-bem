const mongoose = require('mongoose');
const slug = require('../../public/js/lib/makeslug');

const categoriaSchema = new mongoose.Schema({
  title: { type: String, default: '', trim: true },
  body: { type: String, default: '', trim: true },
  urlized: { type: String, default: '', trim: true }
}, { timestamps: true });

/**
 * Validations
 */

categoriaSchema.path('title').validate({
  isAsync: true,
  validator(title, fn) {
    const Categoria = mongoose.model('Categoria');

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('title')) {
      Categoria.find({ title }).exec((err, categoria) => {
        fn(!err && categoria.length === 0);
      });
    } else fn(true);
  },
  message: 'Ja existe uma categoria com esse titulo.'
});

/**
 * Urlize title.
 */
categoriaSchema.pre('save', function save(next) {
  const categoria = this;
  if (!categoria.isModified('title')) { return next(); }
  this.urlized = slug.format(this.title);
  next();
});

/**
 * Statics
 */

categoriaSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(urlized) {
    return this.findOne({ urlized })
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
      .exec();
  }
};


const Categoria = mongoose.model('Categoria', categoriaSchema);

module.exports = Categoria;
