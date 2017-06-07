const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const slug = require('../../public/js/lib/makeslug');

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',');

const servicoSchema = new mongoose.Schema({
  title: { type: String, default: '', trim: true },
  body: { type: String, default: '', trim: true },
  urlized: { type: String, default: '', trim: true },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  tags: { type: [], get: getTags, set: setTags },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

/**
 * Validations
 */

servicoSchema.path('title').validate({
  isAsync: true,
  validator(title, fn) {
    const Servico = mongoose.model('Servico');

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('title')) {
      Servico.find({ title }).exec((err, servico) => {
        fn(!err && servico.length === 0);
      });
    } else fn(true);
  },
  message: 'Ja existe um servico com esse titulo.'
});

/**
 * Urlize title.
 */
servicoSchema.pre('save', function save(next) {
  const servico = this;
  if (!servico.isModified('title')) { return next(); }
  this.urlized = slug.format(this.title);
  next();
});

/**
 * Helper method for validating user's password.
 */
servicoSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
servicoSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

/**
 * Statics
 */

servicoSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(urlized) {
    return this.findOne({ urlized })
      .populate('user', 'name email username')
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
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};


const Servico = mongoose.model('Servico', servicoSchema);

module.exports = Servico;
