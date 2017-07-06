const mongoose = require('mongoose');
const slug = require('../../public/js/lib/makeslug');

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',');

const servicoSchema = new mongoose.Schema({
  title: { type: String, default: '', trim: true },
  avatar: {
    offset: { type: String, default: '', trim: true },
    img: { type: String, default: '', trim: true }
  },
  body: { type: String, default: '', trim: true },
  urlized: { type: String, default: '', trim: true },
  telefone: { type: String, default: '', trim: true },
  whatsapp: { type: String, default: '', trim: true },
  email: { type: String, default: '', trim: true },
  site: { type: String, default: '', trim: true },
  categorias: [{ type: mongoose.Schema.ObjectId, ref: 'Categoria' }],
  avaliacoes: [{ type: mongoose.Schema.ObjectId, ref: 'Avaliacao' }],
  soc_med: {type: Number, default: 0, min: 0, max: 5 },
  amb_med: {type: Number, default: 0, min: 0, max: 5 },
  fotos: [String],
  proprietario: { type: mongoose.Schema.ObjectId, ref: 'User' },
  proAuth: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  tags: { type: [], get: getTags, set: setTags },
  createdAt: { type: Date, default: Date.now },
  horarios: {
    seg: {
      aberto: { type: Boolean, default: true },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '00' },
      hora_fecha: { type: String, default: '18' },
      min_fecha: { type: String, default: '00' }
    },
    ter: {
      aberto: { type: Boolean, default: true },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '00' },
      hora_fecha: { type: String, default: '18' },
      min_fecha: { type: String, default: '00' }
    },
    qua: {
      aberto: { type: Boolean, default: true },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '00' },
      hora_fecha: { type: String, default: '18' },
      min_fecha: { type: String, default: '00' }
    },
    qui: {
      aberto: { type: Boolean, default: true },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '00' },
      hora_fecha: { type: String, default: '18' },
      min_fecha: { type: String, default: '00' }
    },
    sex: {
      aberto: { type: Boolean, default: true },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '00' },
      hora_fecha: { type: String, default: '18' },
      min_fecha: { type: String, default: '00' }
    },
    sab: {
      aberto: { type: Boolean, default: false },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '08' },
      hora_fecha: { type: String, default: '08' },
      min_fecha: { type: String, default: '08' }
    },
    dom: {
      aberto: { type: Boolean, default: false },
      hora_abre: { type: String, default: '08' },
      min_abre: { type: String, default: '08' },
      hora_fecha: { type: String, default: '08' },
      min_fecha: { type: String, default: '08' }
    }
  },
  endereco: {
    existe: { type: Boolean, default: false },
    estado: { type: String, default: '', trim: true },
    cidade: { type: String, default: '', trim: true },
    rua: { type: String, default: '', trim: true },
    numero: { type: String, default: '', trim: true },
    complemento: { type: String, default: '', trim: true },
    cep: { type: String, default: '', trim: true }
  },
  clipping: [{
    title: { type: String },
    img: { type: String },
    data: { type: Date },
    link: { type: String }
  }]
}, { timestamps: true });

/**
 * Validations
 */

servicoSchema.path('title').validate({
  isAsync: true,
  validator(title, fn) {
    const Servico = mongoose.model('Servico');

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('title')) {
      Servico.find({ title }).exec((err, servico) => {
        fn(!err && servico.length === 0);
      });
    } else fn(true);
  },
  message: 'Ja existe um servico com esse titulo.'
});

/**
 * Urlize title.
 */
servicoSchema.pre('save', function save(next) {
  const servico = this;
  if (!servico.isModified('title')) { return next(); }
  this.urlized = slug.format(this.title);
  next();
});

/**
 * Statics
 */

servicoSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load(urlized) {
    return this.findOne({ urlized })
      .populate('categorias', 'title body img _id')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('proprietario', 'profile email')
      .populate('categorias', 'title body img _id')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};


const Servico = mongoose.model('Servico', servicoSchema);

module.exports = Servico;
