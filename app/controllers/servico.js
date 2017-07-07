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
  const criteria = { active: true };
  const options = {
    criteria,
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
  const servico = new Servico(only(req.body, 'title tags body'));
  var categorias = [];
  for (var i in req.body) {
    if (req.body[i] === 'on' && i.split(' ').length === 1 && i.split('_').length === 1 && i.split('.').length === 1) {
      categorias.push(i);
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
  for (var foto in req.files) {
    servico.fotos.push(req.files[foto].location);
  }
  // res.redirect('/servico/novo');
  // servico.user = req.user;
  try {
    yield servico.save();
    const up = new Update();
    up.type = 'servico';
    up.body = servico.body;
    up.user = req.user._id;
    up.servico = servico._id;
    up.save();
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
    var categ = [];
    for (var i = 0; i < req.servico.categorias.length; i++) {
      categ.push(req.servico.categorias[i].title);
    }
    console.log('req.servico: ', req.servico);
    res.render('servicos/edit', {
      title: req.servico.title,
      servico: req.servico,
      categ,
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
  assign(servico, only(req.body, 'title tags site body telefone whatsapp email'));
  const categorias = [];
  for (const i in req.body) {
    if (req.body[i] === 'on' && i.split(' ').length === 1 && i.split('_').length === 1 && i.split('.').length === 1) {
      categorias.push(i);
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
  var horarios = req.servico.horarios;
  for (const dia in horarios) {
    if (horarios.hasOwnProperty(dia) && dia.length === 3 && dia[0] !== '_') {
      const abre = `${dia}_abre`;
      const fecha = `${dia}_fecha`;
      const aberto = `${dia}_aberto`;
      if (req.body[aberto] && req.body[aberto] === 'on') {
        req.servico.horarios[dia].aberto = true;
      } else {
        req.servico.horarios[dia].aberto = false;
      }
      req.servico.horarios[dia].hora_abre = req.body[abre].split(':')[0];
      req.servico.horarios[dia].min_abre = req.body[abre].split(':')[1];
      req.servico.horarios[dia].hora_fecha = req.body[fecha].split(':')[0];
      req.servico.horarios[dia].min_fecha = req.body[fecha].split(':')[1];
    }
  }
  try {
    yield servico.save();
    respondOrRedirect({ res }, `/servico/${servico.urlized}`, servico);
  } catch (err) {
    console.log('err: ', err);
    respond(res, 'servicos/edit', {
      title: `Edit ${servico.title}`,
      errors: [err.toString()],
      servico
    }, 422);
  }
});

/**
 * Upload servico
 */
exports.upload = async(function* (req, res) {
  const servico = req.servico;
  for (var foto in req.files) {
    servico.fotos.push(req.files[foto].location);
  }
  try {
    yield servico.save();
    const up = new Update();
    up.type = 'fotos';
    up.user = req.user._id;
    up.servico = servico._id;
    up.fotos = servico.fotos;
    up.save();
    req.flash('success', { msg: `${req.files.length} fotos enviadas` });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    req.flash('error', { msg: err });
    res.redirect(`/servico/${servico.urlized}`);
  }
});


/**
 * Upload avatar
 */
exports.avatar = async(function* (req, res) {
  const servico = req.servico;
  if (req.files.length > 0) {
    servico.avatar.img = req.files[0].location;
  }
  servico.avatar.offset = req.body.offset;
  try {
    yield servico.save();
    req.flash('success', { msg: 'Foto de capa atualizada' });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    req.flash('error', { msg: err });
    res.redirect(`/servico/${servico.urlized}`);
  }
});

/**
 * Criar a avaliacao
 */
exports.avaliar = async(function* (req, res, next) {
  const avaliacao = new Avaliacao(only(req.body, 'body'));
  console.log(req.body);
  const soc = req.body.avaliar_heart;
  const amb = req.body.avaliar_leaf;
  avaliacao.soc = soc;
  avaliacao.amb = amb;
  avaliacao.servico = req.servico._id;
  avaliacao.user = req.user._id;
  for (var foto in req.files) {
    avaliacao.fotos.push(req.files[foto].location);
  }
  try {
    yield avaliacao.save();
    const up = new Update();
    up.type = 'avaliacao';
    up.body = avaliacao.body;
    up.user = req.user._id;
    up.avaliacao = avaliacao._id;
    up.servico = req.servico._id;
    up.save();
    respondOrRedirect({ req, res }, `/servico/${req.servico.urlized}`, avaliacao, {
      type: 'success',
      text: 'Avaliação completa! Obrigado!'
    });
  } catch (err) {
    console.log(err);
    req.flash('error', { msg: err });
    res.redirect(`/servico/${req.servico.urlized}`);
  }
});

/**
 * Show
 */
exports.show = function (req, res) {
  Categoria.list().then((categorias) => {
    Avaliacao.list({ servico: req.servico._id }).then((avaliacoes) => {
      let amb = 0.0;
      let soc = 0.0;
      for (var i = 0; i < avaliacoes.length; i++) {
        amb += avaliacoes[i].amb;
        soc += avaliacoes[i].soc;
      }
      amb /= avaliacoes.length;
      soc /= avaliacoes.length;
      soc = parseFloat(soc).toFixed(1);
      amb = parseFloat(amb).toFixed(1);
      res.render('servicos/show', {
        title: req.servico.title,
        servico: req.servico,
        soc,
        amb,
        categorias,
        avaliacoes,
        device: req.device.type === 'phone' || req.device.type === 'tablet'
      });
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
};

/**
 * Fotos
 */
exports.fotos = function (req, res) {
  Avaliacao.list({ servico: req.servico._id }).then((avaliacoes) => {
    res.render('servicos/fotos', {
      title: req.servico.title,
      servico: req.servico,
      avaliacoes,
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

