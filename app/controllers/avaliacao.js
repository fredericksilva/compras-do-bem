/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');

const Avaliacao = mongoose.model('Avaliacao');
const assign = Object.assign;

/**
 * Load
 */
exports.load = async(function* (req, res, next, urlized) {
  try {
    req.avaliacao = yield Avaliacao.load(urlized);
    if (!req.avaliacao) return next(new Error('avaliacao não encontrado'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */
exports.index = async(function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 30;
  const options = {
    limit,
    page
  };

  if (_id) options.criteria = { _id };

  const avaliacoes = yield Avaliacao.list(options);
  const count = yield Avaliacao.count();

  respond(res, 'avaliacoes/index', {
    title: 'avaliacoes',
    avaliacoes,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * List Ajax
 */
exports.ajax = async(function* (req, res) {
  const avaliacoes = yield Avaliacao.list({ limit: 0 });
  res.json({ data: avaliacoes });
});

/**
 * Create an avaliacao
 * Upload an image
 */
exports.create = async(function* (req, res, next) {
  const avaliacao = new Avaliacao(only(req.body, 'title tags body'));
  try {
    yield avaliacao.save();
    const up = new Avaliacao();
    up.type = 'avaliacao';
    up.body = avaliacao.body;
    up.user = req.user._id;
    up.avaliacao = avaliacao._id;
    up.save();
    respondOrRedirect({ req, res }, `/avaliacao/${avaliacao.urlized}`, avaliacao, {
      type: 'success',
      text: 'Successfully created avaliacao!'
    });
  } catch (err) {
    respond(res, 'avaliacoes/new', {
      title: avaliacao.title || 'New avaliacao',
      errors: [err.toString()],
      avaliacao
    }, 422);
  }
});

/**
 * Avaliacao avaliacao
 */
exports.update = async(function* (req, res) {
  const avaliacao = req.avaliacao;
  assign(avaliacao, only(req.body, 'title tags site body telefone whatsapp email'));
  try {
    yield avaliacao.save();
    respondOrRedirect({ res }, `/avaliacao/${avaliacao.urlized}`, avaliacao);
  } catch (err) {
    console.log('err: ', err);
    respond(res, 'avaliacoes/edit', {
      title: `Edit ${avaliacao.title}`,
      errors: [err.toString()],
      avaliacao
    }, 422);
  }
});

/**
 * Delete Avaliacao
 */
exports.delete = function (req, res) {
  Avaliacao.remove({
    _id: req.params.id
  }, (err) => {
    if (err) {
      console.log(err);
    }
    respondOrRedirect({ res }, '/dashboard', {});
  });
};

