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
exports.load = async(function* (req, res, next) {
  try {
    req.categorias = yield Categoria.list();
    res.locals.categorias = req.categorias;
    if (!req.categorias) return next(new Error('categorias não encontradas'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */
exports.index = async(function* (req, res) {
  res.json({ data: req.categorias });
});

/**
 * Selo
 */
exports.selo = async(function* (req, res) {
  try {
    const categ = yield Categoria.findOne({ _id: req.params.id });
    res.json({ data: categ });
  } catch (err) {
    console.log(err);
  }
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
  if (req.body.mae !== '') {
    categoria.mae = req.body.mae;
  }
  if (req.body.selo === 'on') {
    categoria.selo = true;
  }
  // categoria.user = req.user;
  try {
    yield categoria.save();
    console.log('save');
    respondOrRedirect({ req, res }, '/dash/categorias', categoria, {
      type: 'success',
      text: 'Successfully created categoria!'
    });
  } catch (err) {
    console.log(err);
    respond(res, 'dashboard/categorias', {
      title: 'Categorias',
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
  Categoria.findOne({_id: req.params.id}, function (err, categoria) {
    if (err) return res.send(err);
    categoria.title = req.body.title;
    categoria.body = req.body.body;
    if (req.body.mae !== '') {
      categoria.mae = req.body.mae;
    }
    if (req.body.selo === 'on') {
      categoria.selo = true;
    }

    categoria.save(function(err) {
      if (err) return console.log(err);

      respondOrRedirect({ req, res }, '/dash/categorias', categoria, {
        type: 'success',
        title: 'Categoria atualizada!'
      });
    });
  });
});

/**
 * Upload icone
 */
exports.upload = async(function* (req, res) {
  Categoria.findOne({ _id: req.params.id }, function (err, categoria) {
    if (err) return res.send(err);
    if (req.files.length > 0) {
      categoria.img = req.files[0].location;
    }

    categoria.save(function(err) {
      if (err) return console.log(err);

      respondOrRedirect({ req, res }, '/dash/categorias', categoria, {
        type: 'success',
        title: 'Icone uploadeado!'
      });
    });
  });
});

/**
 * Show
 */
exports.delete = function (req, res) {
  Categoria.remove({
    _id: req.params.id
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

