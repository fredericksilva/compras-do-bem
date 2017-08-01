/**
 * Module dependencies.
 */
// const _ = require('underscore');
// const moment = require('moment');
// const mongoose = require('mongoose');
// const { wrap: async } = require('co');
// const only = require('only');
// const { respond, respondOrRedirect } = require('../utils');

// const Servico = mongoose.model('Servico');
// const Categoria = mongoose.model('Categoria');
// const Avaliacao = mongoose.model('Avaliacao');
// const Update = mongoose.model('Update');
// const assign = Object.assign;
// const scrape = require('html-metadata');

/**
 * GET /dash/users
 * Dasboard users.
 */
exports.users = (req, res) => {
  res.render('dashboard/users', {
    title: 'Users'
  });
};

/**
 * GET /dash/categorias
 * Dasboard users.
 */
exports.categorias = (req, res) => {
  res.render('dashboard/categorias', {
    title: 'Categorias'
  });
};
