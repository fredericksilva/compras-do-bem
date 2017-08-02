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
 * GET /dash
 * Dasboard.
 */
exports.index = (req, res) => {
  res.render('dashboard/index', {
    title: 'Dashboard'
  });
};

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
 * Dasboard categorias.
 */
exports.categorias = (req, res) => {
  res.render('dashboard/categorias', {
    title: 'Categorias'
  });
};

/**
 * GET /dash/servicos
 * Dasboard serviços.
 */
exports.servicos = (req, res) => {
  res.render('dashboard/servicos', {
    title: 'Serviços'
  });
};

/**
 * GET /dash/avaliacoes
 * Dasboard avaliações.
 */
exports.avaliacoes = (req, res) => {
  res.render('dashboard/avaliacoes', {
    title: 'Avaliações'
  });
};

/**
 * GET /dash/updates
 * Dasboard updates.
 */
exports.updates = (req, res) => {
  res.render('dashboard/updates', {
    title: 'Updates'
  });
};
