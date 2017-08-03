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
exports.load = async(function* (req, res, next, aval_id) {
  try {
    req.avaliacao = yield Avaliacao.load(aval_id);
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
  const avaliacoes = yield Avaliacao.list();
  res.json({ data: avaliacoes });
});

/**
 * Avaliacao avaliacao
 */
exports.update = async(function* (req, res) {
  const avaliacao = req.avaliacao;
  console.log('aval update');
  assign(avaliacao, only(req.body, 'body soc amb'));
  try {
    yield avaliacao.save();
    respondOrRedirect({ req, res }, `/servico/${avaliacao.servico.urlized}`, avaliacao, {
      type: 'success',
      text: 'Avaliação editada!'
    });
  } catch (err) {
    console.log('err: ', err);
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
    respondOrRedirect({ res }, '/dash/avaliacoes', {});
  });
};

