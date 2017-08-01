const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: String,
  twitter: String,
  google: String,
  tokens: Array,
  admin: { type: Boolean, default: false },
  active: { type: Boolean, default: false },

  profile: {
    first_name: String,
    second_name: String,
    gender: String,
    location: String,
    website: String,
    picture: String,
    aniversario: Date
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

userSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(id) {
    return this.findOne({ _id: id })
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

const User = mongoose.model('User', userSchema);

module.exports = User;
