/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');

const Servico = mongoose.model('Servico');
const Categoria = mongoose.model('Categoria');
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
 * List Ajax
 */
exports.ajax = async(function* (req, res) {
  const servicos = yield Servico.list({ limit: 0 });
  res.json({ data: servicos });
});

/**
 * New servico
 */
exports.new = function (req, res){
  Categoria.list().then((categorias) => {
    res.render('servicos/new', {
      title: 'New servico',
      servico: new Servico(),
      categorias,
      device: req.device.type === 'phone' || req.device.type === 'tablet'
    });
  }).catch((err) => {
    console.log(err)
  });
};

/**
 * Create an servico
 * Upload an image
 */
exports.create = async(function* (req, res, next) {
  // console.log(req.body)
  // console.log('-----')
  // console.log(req.files)
  const servico = new Servico(only(req.body, 'title tags site'));
  var categorias = [];
  for (var i in req.body) {
    if (req.body[i] === 'on') {
      categorias.push(i)
    }
  }
  servico.categorias = categorias;
  servico.endereco.estado = req.body.estado;
  servico.endereco.cidade = req.body.cidade;
  if (req.body.rua !== '' && req.body.numero !== '' && req.body.complemento !== '') {
    servico.endereco.existe = true;
    servico.endereco.rua = req.body.rua;
    servico.endereco.numero = req.body.numero;
    servico.endereco.complemento = req.body.complemento;
  }
  console.log(req.files);
  for (var foto in req.files) {
    servico.fotos.push(req.files[foto].location);
  }
  // res.redirect('/servico/novo');
  // servico.user = req.user;
  try {
    yield servico.save();
    respondOrRedirect({ req, res }, `/servico/${servico.urlized}`, servico, {
      type: 'success',
      text: 'Successfully created servico!'
    });
  } catch (err) {
    respond(res, 'servicos/new', {
      title: servico.title || 'New servico',
      errors: [err.toString()],
      servico
    }, 422);
  }
});

/**
 * Edit an servico
 */
exports.edit = function (req, res) {
  Categoria.list().then((categorias) => {
    res.render('servicos/edit', {
      title: req.servico.title,
      servico: req.servico,
      categorias,
      device: req.device.type === 'phone' || req.device.type === 'tablet'
    });
  }).catch((err) => {
    console.log(err);
  });
};

/**
 * Update servico
 */
exports.update = async(function* (req, res) {
  const servico = req.servico;
  assign(servico, only(req.body, 'title tags site'));
  var categorias = [];
  for (var i in req.body) {
    if (req.body[i] === 'on') {
      categorias.push(i)
    }
  }
  servico.categorias = categorias;
  servico.endereco.estado = req.body.estado;
  servico.endereco.cidade = req.body.cidade;
  if (req.body.rua !== '' && req.body.numero !== '' && req.body.complemento !== '') {
    servico.endereco.existe = true;
    servico.endereco.rua = req.body.rua;
    servico.endereco.numero = req.body.numero;
    servico.endereco.complemento = req.body.complemento;
  }
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
  Categoria.list().then((categorias) => {
    res.render('servicos/show', {
      title: req.servico.title,
      servico: req.servico,
      categorias,
      device: req.device.type === 'phone' || req.device.type === 'tablet'
    });
  }).catch((err) => {
    console.log(err);
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
 * Delete Admin
 */
exports.delete = function (req, res) {
  Servico.remove({
    _id: req.params.id
  }, (err) => {
    if (err) {
      console.log(err);
    }
    respondOrRedirect({ res }, '/dashboard', {});
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

