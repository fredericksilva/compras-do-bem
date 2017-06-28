/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');

const Servico = mongoose.model('Servico');
const assign = Object.assign;

/**
 * Load
 */
exports.load = async(function* (req, res, next, urlized) {
  try {
    req.servico = yield Servico.load(urlized);
    if (!req.servico) return next(new Error('servico não encontrado'));
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

  const servicos = yield Servico.list(options);
  const count = yield Servico.count();

  respond(res, 'servicos/index', {
    title: 'servicos',
    servicos,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New servico
 */
exports.new = function (req, res){
  res.render('servicos/new', {
    title: 'New servico',
    servico: new Servico(),
    device: req.device.type === 'phone' || req.device.type === 'tablet'
  });
};

/**
 * Create an servico
 * Upload an image
 */
exports.create = async(function* (req, res) {
  console.log(req.body)
  res.render('servicos/new', {
    title: 'New servico',
    servico: new Servico()
  });
  // const servico = new Servico(only(req.body, 'title body tags'));
  // servico.user = req.user;
  // try {
  //   yield servico.save();
  //   respondOrRedirect({ req, res }, `/servico/${servico.urlized}`, servico, {
  //     type: 'success',
  //     text: 'Successfully created servico!'
  //   });
  // } catch (err) {
  //   respond(res, 'servicos/new', {
  //     title: servico.title || 'New servico',
  //     errors: [err.toString()],
  //     servico
  //   }, 422);
  // }
});

/**
 * Edit an servico
 */
exports.edit = function (req, res) {
  res.render('servicos/edit', {
    title: `Edit ${req.servico.title}`,
    servico: req.servico
  });
};

/**
 * Update servico
 */
exports.update = async(function* (req, res) {
  const servico = req.servico;
  assign(servico, only(req.body, 'title body tags'));
  try {
    yield servico.save();
    respondOrRedirect({ res }, `/servico/${servico.urlized}`, servico);
  } catch (err) {
    respond(res, 'servicos/edit', {
      title: `Edit ${servico.title}`,
      errors: [err.toString()],
      servico
    }, 422);
  }
});

/**
 * Show
 */
exports.show = function (req, res) {
  respond(res, 'servicos/show', {
    title: req.servico.title,
    servico: req.servico
  });
};

/**
 * Show Static
 */
exports.showStatic = function (req, res) {
  const servico = {
    title: 'Servico X',
    body: 'Nam quis nulla. Integer malesuada. In in enim a arcu imperdiet malesuada. Sed vel lectus. Donec odio urna, tempus molestie, porttitor ut, iaculis quis, sem. Phasellus rhoncus. Aenean id metus id velit ullamcorper pulvinar. Vestibulum fermentum tortor id mi. Pellentesque ipsum. Nulla',
    tags: ['tag1', 'tag2', 'tag3']
  };
  respond(res, 'servicos/show', {
    title: servico.title,
    servico
  });
};

/**
 * Delete an servico
 */
exports.destroy = async(function* (req, res) {
  yield req.servico.remove();
  respondOrRedirect({ req, res }, '/servico', {}, {
    type: 'info',
    text: 'Deleted successfully'
  });
});

