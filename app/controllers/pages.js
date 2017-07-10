/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');

const Servico = mongoose.model('Servico');
const Categoria = mongoose.model('Categoria');
const Avaliacao = mongoose.model('Avaliacao');
const Update = mongoose.model('Update');
const assign = Object.assign;

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const limit = 30;
  const options = {
    limit,
    page
  };

  const count = Update.count();

  Update.list(options).then((updates) => {
    const up = JSON.stringify(updates);
    res.render('pages/home', {
      title: 'Home',
      updates,
      up,
      device: req.device.type === 'phone' || req.device.type === 'tablet',
      page: page + 1,
      pages: Math.ceil(count / limit)
    });
  }).catch((err) => {
    console.log(err);
  });
};

/**
 * GET /
 * User page.
 */
exports.userShow = (req, res) => {
  res.render('pages/user', {
    title: `User ${req.params.id}`
  });
};

/**
 * GET /
 * Dasboard page.
 */
exports.dashboard = (req, res) => {
  res.render('pages/dashboard', {
    title: `User ${req.params.id}`
  });
};
