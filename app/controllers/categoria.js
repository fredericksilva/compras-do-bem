/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');

const Categoria = mongoose.model('Categoria');
const assign = Object.assign;

/**
 * Load
 */
exports.load = async(function* (req, res, next, urlized) {
  try {
    req.categoria = yield Categoria.load(urlized);
    if (!req.categoria) return next(new Error('categoria não encontrado'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */
exports.index = async(function* (req, res) {
  const categorias = yield Categoria.list();
  res.json({ data: categorias });
});

/**
 * New categoria
 */
exports.new = function (req, res){
  res.render('categorias/new', {
    title: 'New categoria',
    categoria: new Categoria(),
    device: req.device.type === 'phone' || req.device.type === 'tablet'
  });
};

/**
 * Create an categoria
 * Upload an image
 */
exports.create = async(function* (req, res) {
  const categoria = new Categoria({ title: req.body.title, body: req.body.body });

  // categoria.user = req.user;
  try {
    yield categoria.save();
    console.log('save');
    respondOrRedirect({ req, res }, '/dashboard', categoria, {
      type: 'success',
      text: 'Successfully created categoria!'
    });
  } catch (err) {
    console.log(err);
    respond(res, 'pages/dashboard', {
      title: 'Dashboard',
      errors: [err.toString()],
      categoria
    }, 422);
  }
});

/**
 * Edit an categoria
 */
exports.edit = function (req, res) {
  res.render('categorias/edit', {
    title: `Edit ${req.categoria.title}`,
    categoria: req.categoria
  });
};

/**
 * Update categoria
 */
exports.update = async(function* (req, res) {
  const categoria = req.categoria;
  assign(categoria, only(req.body, 'title body'));
  try {
    yield categoria.save();
    respondOrRedirect({ res }, '/dashboard', categoria);
  } catch (err) {
    respond(res, 'pages/dashboard', {
      title: `Edit ${categoria.title}`,
      errors: [err.toString()],
      categoria
    }, 422);
  }
});

/**
 * Show
 */
exports.delete = function (req, res) {
  Categoria.remove({
    urlized: req.params.urlized
  }, (err) => {
    if (err) {
      console.log(err);
    }
    respondOrRedirect({ res }, '/dashboard', {});
  });
};

/**
 * Delete an categoria
 */
exports.destroy = async(function* (req, res) {
  yield req.categoria.remove();
  respondOrRedirect({ req, res }, '/categoria', {}, {
    type: 'info',
    text: 'Deleted successfully'
  });
});

