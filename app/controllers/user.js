const bluebird = require('bluebird');
const mongoose = require('mongoose');
const crypto = bluebird.promisifyAll(require('crypto'));
const { respondOrRedirect } = require('../utils');
const nodemailer = require('nodemailer');
const passport = require('passport');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { wrap: async } = require('co');
const _ = require('underscore');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

const User = mongoose.model('User');
const Avaliacao = mongoose.model('Avaliacao');
const Update = mongoose.model('Update');

/**
 * Load
 */
exports.load = async(function* (req, res, next, id) {
  try {
    req.usuario = yield User.load(id);
    if (!req.usuario) return next(new Error('Usuário não encontrado'));
  } catch (err) {
    return next(err);
  }
  next();
});

exports.index = async(function* (req, res) {
  const users = yield User.list();
  res.json({ data: users });
});

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'O email fornecido não é válido').isEmail();
  req.assert('password', 'A senha não pode estar em branco').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/signup');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Sucesso! Você está logado.' });
      res.redirect('/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Criar Conta'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'O email fornecido não é válido').isEmail();
  req.assert('password', 'A senha precisa ter pelo menos 6 caracteres').len(6);
  req.assert('confirmPassword', 'As senhas não conferem').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  let aniversario;
  if (req.body.aniv_ano && req.body.aniv_mes && req.body.aniv_dia) {
    aniversario = moment(`${req.body.aniv_ano}-${req.body.aniv_mes}-${req.body.aniv_dia}`);
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile: {
      first_name: req.body.first_name,
      second_name: req.body.second_name,
      aniversario
    }
  });

  const sendVerificationEmail = (user, token) => {
    if (!user) { return; }
    const verificationOptions = {
      to: user.email,
      from: 'contato@jardim.in',
      subject: 'Verifique seu email',
      html: `Olá,<br><br>Isso é um email confirmação.<br><br> Para confirmar seu email clique no link: <a href="http://${req.hostname}${process.env.NODE_ENV === 'development' ? ':' + req.app.get('port') : '' }/verificacao/${token}" target="_blank">Link</a>`
    };
    return transporter.sendMail(verificationOptions)
      .then(() => {
        req.flash('success', { msg: 'Enviamos um email de verificação para seu email.' });
        res.redirect('/');
      });
  };

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Já existe uma conta cadastrada com esse email.' });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) { return next(err); }
      const token = jwt.sign(user, process.env.SESSION_SECRET);
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        sendVerificationEmail(user, token);
      });
    });
  });
};

/**
 * GET /verificacao/:verifToken
 * Verifica email.
 */
exports.verifyAccount = (req, res, next) => {
  const token = req.params.verifToken;

  jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
    if (decoded === undefined) {
      req.flash('errors', { msg: 'Erro na autenticação do token.' });
      return res.redirect('/');
    } else {
      User.findOne({ email: decoded.$__.scope.email }, (err, user) => {
        if (err) { return next(err); }
        if (!user) {
          req.flash('errors', { msg: 'Esse usuário não existe.' });
          return res.redirect('/');
        } else if (user.active) {
          req.flash('success', { msg: 'Sua conta já está confirmada.' });
          res.redirect('/');
        }
        user.active = true;
        user.save((err) => {
          if (err) { return next(err); }
          req.flash('success', { msg: 'Sua conta foi confirmada.' });
          res.redirect('/');
        });
      });
    }
  });
};

/**
 * Delete
 */
exports.delete = function (req, res) {
  if (req.user._id === req.params.user_id) {
    req.flash('errors', { msg: 'Você não pode deletar a própria conta.' });
    return res.redirect('/dash/users');
  } else {
    User.remove({
      _id: req.params.user_id
    }, (err) => {
      if (err) {
        console.log(err);
      }
      respondOrRedirect({ res }, '/dash/users', {});
    });
  }
};

/**
 * GET /user/:id/makeadmin
 * Make user admin.
 */
exports.makeAdmin = (req, res, next) => {
  User.findOne({ _id: req.params.user_id }, (err, user) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', { msg: 'Esse usuário não existe.' });
      return res.redirect('/');
    } else if (user.admin) {
      req.flash('success', { msg: 'Esse usuário já é admin.' });
      return res.redirect('/');
    }
    user.admin = true;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: `O usuário ${user.first_name} ${user.second_name} agora é admin.` });
      res.redirect('/');
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Manutenção de Perfil'
  });
};

/**
 * GET /user/:user_id
 * User page.
 */
exports.show = (req, res) => {
  Avaliacao.list({ user: req.params.user_id }).then((avaliacoes) => {
    Update.list({ user: req.params.user_id }).then((updates) => {
      const fotosUp = _.filter(updates, f => f.type === 'fotos');
      const pontos = _.filter(updates, p => p.type === 'ponto');
      const servicos = _.filter(updates, s => s.type === 'servico');
      const clipping = _.filter(updates, c => c.type === 'clipping');
      const fotos = [];
      for (let i = 0; i < fotosUp.length; i++) {
        for (let o = 0; o < fotosUp[i].fotos.length; o++) {
          fotos.push(fotosUp[i].fotos[o]);
        }
      }
      for (let i = 0; i < avaliacoes.length; i++) {
        for (let o = 0; o < avaliacoes[i].fotos.length; o++) {
          fotos.push(avaliacoes[i].fotos[o]);
        }
      }
      for (let i = 0; i < servicos.length; i++) {
        for (let o = 0; o < servicos[i].fotos.length; o++) {
          fotos.push(servicos[i].fotos[o]);
        }
      }
      res.render('user/show', {
        title: 'User show',
        usuario: req.usuario,
        fotos,
        pontos,
        servicos,
        clipping,
        avaliacoes
      });
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Por favor, forneça um endereço de email válido.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'Já existe uma conta cadastrada com esse email.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Informações de perfil atualizadas.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'A senha precisa ter pelo menos 6 caracteres').len(6);
  req.assert('confirmPassword', 'As senhas não conferem').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Sua senha foi alterada.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Sua conta foi deletada.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `Sua conta ${provider} foi desassociada.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Seu token que mudança de senha é invalido ou está expirado.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Mudar senha'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'A senha precisa ter pelo menos 6 caracteres.').len(4);
  req.assert('confirm', 'As senhas não conferem').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Seu token que mudança de senha é invalido ou está expirado.' });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    const mailOptions = {
      to: user.email,
      from: 'contato@jardim.in',
      subject: 'Sua senha em Node Template foi alterada',
      text: `Olá,\n\nIsso é uma confirmação que a senha da conta ${user.email} foi alterada.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', { msg: 'Sucesso! Sua senha foi alterada.' });
      });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Esqueceu Senha'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Por favor, forneça um email válido.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Não existe conta com esse email.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'contato@jardim.in',
      subject: 'Mude sua senha em Node Template',
      text: `Você está recebendo esse email por que você (ou outra pessoa) requisitou uma mudança de senha para sua conta.\n\n
        Clique no link abaixo, ou copie e cole em seu navegador para completar o processo:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        Se você não requisitou essa mudança, por favor ignore esse email e sua senha permanecerá a mesma.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', { msg: `Um email foi enviado para ${user.email} com mais instruções.` });
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};
