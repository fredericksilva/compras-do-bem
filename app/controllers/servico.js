/**
 * Module dependencies.
 */
const _ = require('underscore');
const moment = require('moment');
const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');

const Servico = mongoose.model('Servico');
const Categoria = mongoose.model('Categoria');
const Avaliacao = mongoose.model('Avaliacao');
const Update = mongoose.model('Update');
const Notificacao = mongoose.model('Notificacao');
const assign = Object.assign;
const scrape = require('html-metadata');

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
 * Busca
 */
exports.busca = async(function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const limit = 30;
  let criteria = {};
  if (req.body.cidade && req.body.cidade !== '') {
    const c = req.body.cidade.split(' - ');
    criteria['endereco.cidade'] = c[0];
  }
  if (req.body.categoria && req.body.categoria !== '') {
    console.log(req.body.categoria);
    const cats = req.body.categoria.split(',');
    criteria.categorias = { $all: cats };
    const catCriteria = yield Categoria.list({ _id: { $in: cats } });
    res.locals.cat_criteria = catCriteria;
  }
  if (req.body.text && req.body.text !== '') {
    criteria.$text = { $search: req.body.text };
  }
  const options = {
    criteria,
    limit,
    page
  };

  const servicos = yield Servico.list(options);
  const count = yield Servico.count();
  respond(res, 'servicos/index', {
    title: 'servicos',
    servicos,
    criteria,
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
    up.fotos = servico.fotos;
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
  const selos = _.filter(req.servico.categorias, c => c.selo);
  for (const i in req.body) {
    if (req.body[i] === 'on' && i.split(' ').length === 1 && i.split('_').length === 1 && i.split('.').length === 1) {
      categorias.push(i);
    }
  }
  servico.categorias = _.union(categorias, selos);
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
  const fotos = [];
  for (var foto in req.files) {
    servico.fotos.push(req.files[foto].location);
    fotos.push(req.files[foto].location);
  }
  try {
    yield servico.save();
    const up = new Update();
    up.type = 'fotos';
    up.user = req.user._id;
    up.servico = servico._id;
    up.fotos = fotos;
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
 * Remove clipping
 */
exports.removeclip = async(function* (req, res) {
  const servico = req.servico;
  servico.clipping.splice(req.params.index, 1);
  try {
    yield servico.save();
    req.flash('success', { msg: 'Clipping removido' });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    console.log(err);
    req.flash('error', { msg: err.ValidationError });
    res.redirect(`/servico/${servico.urlized}`);
  }
});

/**
 * Remove categoria
 */
exports.removecat = async(function* (req, res) {
  const servico = req.servico;
  console.log(servico);
  servico.categorias.splice(req.params.index, 1);
  try {
    yield servico.save();
    req.flash('success', { msg: 'Categoria removida' });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    console.log(err);
    req.flash('error', { msg: err.ValidationError });
    res.redirect(`/servico/${servico.urlized}`);
  }
});

/**
 * Novo Ponto de Venda
 */
exports.ponto = async(function* (req, res, next) {
  const servico = req.servico;
  const ponto = {
    title: req.body.title,
    estado: req.body.estado,
    cidade: req.body.cidade,
    rua: req.body.rua,
    numero: req.body.numero,
    complemento: req.body.complemento
  };
  servico.pontos.push(ponto);
  try {
    yield servico.save();
    const up = new Update();
    up.type = 'ponto';
    up.user = req.user._id;
    up.servico = servico._id;
    up.clip = ponto;
    up.save();
    req.flash('success', { msg: 'Ponto de venda adicionado' });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    req.flash('error', { msg: err });
    res.redirect(`/servico/${servico.urlized}`);
  }
});

/**
 * Scrape
 */
exports.scrape = async(function* (req, res, next) {
  let link = req.body.link;
  if (link.split('http').length === 1) {
    link = `http://${link}`;
  }
  scrape(link).then((metadata) => {
    req.selo = metadata;
    next();
  }).catch((error) => {
    console.log(error);
    req.flash('error', { msg: 'Erro de URL' });
    res.redirect(`/servico/${servico.urlized}`);
  });
});

/**
 * Create clipping
 */
exports.clipping = async(function* (req, res) {
  const servico = req.servico;
  let clip = {
    type: 'clip',
    title: 'Título',
    desc: 'Descrição',
    site: '',
    img: '',
    user: req.user._id,
    data: Date.now(),
    selos: [],
    link: ''
  };
  for (var key in req.body) {
    if (req.body[key] === 'true') {
      clip.selos.push();
      const has = _.find(servico.categorias, function(cat) {
        return cat._id.toString() === key;
      });
      if (has === undefined) {
        servico.categorias.push(key);
      }
      clip.selos.push(key);
    }
  }
  if (req.selo.openGraph) {
    clip.title = req.selo.openGraph.title || clip.title;
    clip.desc = req.selo.openGraph.description || clip.desc;
    clip.link = req.selo.openGraph.url || req.body.link;
    clip.site = req.selo.openGraph.sitename || clip.site;
    if (req.selo.openGraph.image) {
      clip.img = req.selo.openGraph.image.url || clip.img;
    }
    if (moment(req.selo.openGraph.published_time).isValid()) {
      clip.data = moment(req.selo.openGraph.published_time).toDate() || clip.data;
    }
  } else if (req.selo.general) {
    clip.title = req.selo.general.title || clip.title;
    clip.desc = req.selo.general.description || clip.desc;
    clip.link = req.selo.general.canonical || req.body.link;
    clip.site = req.selo.general.sitename || clip.site;
    clip.img = req.selo.general.image || clip.img;
    clip.data = req.selo.general.published_time || clip.data;
  }
  servico.clipping.push(clip);
  try {
    yield servico.save();
    const up = new Update();
    up.type = 'clipping';
    up.body = clip.desc;
    up.user = req.user._id;
    up.servico = servico._id;
    if (clip.img !== '') {
      up.fotos.push(clip.img);
    }
    up.clip = clip;
    up.save();
    req.flash('success', { msg: 'Selo adicionado' });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    console.log('err: ', err);
    req.flash('error', { msg: err });
    res.redirect(`/servico/${servico.urlized}`);
  }
});

/**
 * Create clipping
 */
exports.selo = async(function* (req, res) {
  const servico = req.servico;
  let clip = {
    type: 'aval',
    title: 'Título',
    desc: req.body.body,
    site: '',
    img: '',
    user: req.user._id,
    data: Date.now(),
    selos: [],
    link: ''
  };
  for (var key in req.body) {
    if (req.body[key] === 'true') {
      clip.selos.push();
      const has = _.find(servico.categorias, function(cat) {
        return cat._id.toString() === key;
      });
      if (has === undefined) {
        servico.categorias.push(key);
      }
      clip.selos.push(key);
    }
  }
  servico.clipping.push(clip);
  try {
    yield servico.save();
    const up = new Update();
    up.type = 'clipping';
    up.body = clip.desc;
    up.user = req.user._id;
    up.servico = servico._id;
    if (clip.img !== '') {
      up.fotos.push(clip.img);
    }
    up.clip = clip;
    up.save();
    req.flash('success', { msg: 'Selo adicionado' });
    res.redirect(`/servico/${servico.urlized}`);
  } catch (err) {
    console.log('err: ', err);
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
      let aval = null;
      let favorito = null;
      const endereco = JSON.stringify(req.servico.endereco);
      const pontos = JSON.stringify(req.servico.pontos);
      const url = req.protocol + '://' + req.hostname + req.path;
      for (let i = 0; i < avaliacoes.length; i++) {
        amb += avaliacoes[i].amb;
        soc += avaliacoes[i].soc;
      }
      amb /= avaliacoes.length;
      soc /= avaliacoes.length;
      soc = parseFloat(soc).toFixed(1);
      amb = parseFloat(amb).toFixed(1);
      if (req.user) {
        aval = _.find(avaliacoes, a => JSON.stringify(a.user._id) === JSON.stringify(req.user._id));
        favorito = _.find(req.user.favoritos, a => JSON.stringify(a) === JSON.stringify(req.servico._id));
      }
      res.render('servicos/show', {
        title: req.servico.title,
        servico: req.servico,
        soc,
        amb,
        endereco,
        pontos,
        categorias,
        avaliacoes,
        aval,
        favorito,
        url,
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
 * Reivindicar Servico
 */
exports.reivindicar = async(function* (req, res) {
  if (req.servico.proprietario) {
    req.flash('error', { msg: 'Esse serviço já foi reivindicado.' });
    res.redirect(`/servico/${req.servico.urlized}`);
  }
  const user = req.user;
  const serv = req.servico;
  user.telefone = req.body.telefone;
  try {
    yield user.save();
    serv.proprietario = req.user._id;
    try {
      yield serv.save();
      req.flash('success', { msg: 'Aguarde. Entraremos em contato.' });
      res.redirect(`/servico/${req.servico.urlized}`);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * Negar reinvidicação Servico
 */
exports.reinvNegar = async(function* (req, res) {
  const serv = req.servico;
  serv.proprietario = undefined;
  try {
    yield serv.save();
    req.flash('success', { msg: 'Reivindicação negada.' });
    res.redirect('/dash');
  } catch (err) {
    console.log(err);
  }
});

/**
 * Autorizar reinvidicação Servico
 */
exports.reinvAuth = async(function* (req, res) {
  const serv = req.servico;
  serv.proAuth = true;
  try {
    yield serv.save();
    req.flash('success', { msg: 'Reivindicação autorizada.' });
    res.redirect('/dash');
  } catch (err) {
    console.log(err);
  }
});

/**
 * Desassociar Proprietario do Servico
 */
exports.desassociar = async(function* (req, res) {
  const serv = req.servico;
  serv.proprietario = undefined;
  serv.proAuth = false;
  try {
    yield serv.save();
    req.flash('success', { msg: 'Serviço desassociado.' });
    res.redirect('/dash/servicos');
  } catch (err) {
    console.log(err);
  }
});

/**
 * Favoritar Servico
 */
exports.favoritar = async(function* (req, res) {
  const serv = req.servico;
  const user = req.user;
  user.favoritos.push(serv._id);
  try {
    yield user.save();
    const not = new Notificacao();
    not.de = user._id;
    if (serv.proAuth) {
      not.user = serv.proprietario._id;
    }
    not.servico = serv._id;
    not.type = 'favoritado';
    try {
      yield not.save();
      req.flash('success', { msg: 'Adicionado aos favoritos.' });
      res.redirect(`/servico/${serv.urlized}`);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * Favoritar Servico
 */
exports.desfavoritar = async(function* (req, res) {
  const serv = req.servico;
  const user = req.user;
  user.favoritos.pull(serv._id);
  try {
    yield user.save();
    if (serv.proAuth) {
      Notificacao.remove({
        servico: serv._id,
        de: user._id,
        type: 'favoritado'
      }, (err) => {
        if (err) {
          console.log(err);
        }
        req.flash('success', { msg: 'Removido dos favoritos.' });
        res.redirect(`/servico/${serv.urlized}`);
      });
    } else {
      req.flash('success', { msg: 'Removido dos favoritos.' });
      res.redirect(`/servico/${serv.urlized}`);
    }
  } catch (err) {
    console.log(err);
  }
});

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
    respondOrRedirect({ res }, '/dash/servicos', {});
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

