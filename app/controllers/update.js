/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respondOrRedirect } = require('../utils');

const Update = mongoose.model('Update');

/**
 * List Ajax
 */
exports.list = async(function* (req, res) {
  const updates = yield Update.list({ limit: 0 });
  res.json({ data: updates });
});

/**
 * Delete Update
 */
exports.delete = function (req, res) {
  Update.remove({
    _id: req.params.id
  }, (err) => {
    if (err) {
      console.log(err);
    }
    respondOrRedirect({ res }, '/dashboard', {});
  });
};

