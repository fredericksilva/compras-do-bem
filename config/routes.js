
/**
 * Module dependencies.
 */
// const path = require('path');
// const multer = require('multer');

/**
 * Controllers (route handlers).
 */
const pagesController = require('../app/controllers/pages');
const categoriaController = require('../app/controllers/categoria');
const userController = require('../app/controllers/user');
// const apiController = require('../app/controllers/api');
const servicoController = require('../app/controllers/servico');
const contactController = require('../app/controllers/contact');
const updateController = require('../app/controllers/update');
const avaliacaoController = require('../app/controllers/avaliacao');

// const upload = multer({ dest: path.join(__dirname, '../public/uploads') });

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    acl: 'public-read',
    cacheControl: 'max-age=31536000',
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '_' + file.originalname)
    }
  })
});

/**
 * Expose
 */

module.exports = (app, passportConfig, passport) => {
  app.use(categoriaController.load);
  /**
   * Pages routes.
   */
  app.get('/', pagesController.index);
  app.get('/user/:id', pagesController.userShow);
  app.get('/servico', servicoController.index);
  app.get('/dashboard', passportConfig.isAuthenticated, passportConfig.isAdmin, pagesController.dashboard);
  app.get('/categorias', categoriaController.index);
  app.get('/users', userController.index);
  app.get('/servicos', servicoController.ajax);
  app.get('/avaliacoes', avaliacaoController.ajax);

  /**
   * Updates routes.
   */
  app.get('/updates', updateController.list);
  app.get('/update/:id/delete', passportConfig.isAuthenticated, passportConfig.isAdmin, updateController.delete);

  /**
   * Avaliacao routes.
   */
  app.get('/avaliacao/:id/delete', passportConfig.isAuthenticated, passportConfig.isAdmin, avaliacaoController.delete);

  /**
   * Servico routes.
   */
  app.param('urlized', servicoController.load);
  app.get('/servico/novo', passportConfig.isAuthenticated, servicoController.new);
  app.get('/servico/:urlized', servicoController.show);
  app.get('/servico/:urlized/edit', passportConfig.isAuthenticated, servicoController.edit);
  app.get('/servico/:urlized/fotos', servicoController.fotos);
  app.get('/servico/:id/delete', passportConfig.isAuthenticated, passportConfig.isAdmin, servicoController.delete);
  app.post('/servico', passportConfig.isAuthenticated, upload.array('photos', 5), servicoController.create);
  app.post('/servico/:urlized/put', passportConfig.isAuthenticated, servicoController.update);
  app.post('/servico/:urlized/upload', passportConfig.isAuthenticated, upload.array('photos', 5), servicoController.upload);
  app.post('/servico/:urlized/avatar/upload', passportConfig.isAuthenticated, upload.array('photos', 1), servicoController.avatar);
  app.post('/servico/:urlized/avaliar', passportConfig.isAuthenticated, upload.array('photos', 5), servicoController.avaliar);

    /**
   * Categoria routes.
   */
  app.post('/categoria/nova', passportConfig.isAuthenticated, passportConfig.isAdmin, categoriaController.create);
  app.post('/categoria/:id/edit', passportConfig.isAuthenticated, passportConfig.isAdmin, categoriaController.update);
  app.get('/categoria/:id/delete', passportConfig.isAuthenticated, passportConfig.isAdmin, categoriaController.delete);
  app.post('/categoria/:id/upload', passportConfig.isAuthenticated, passportConfig.isAdmin, upload.array('photos', 1), categoriaController.upload);

  /**
   * User routes.
   */
  app.get('/login', userController.getLogin);
  app.post('/login', userController.postLogin);
  app.get('/logout', userController.logout);
  app.get('/forgot', userController.getForgot);
  app.post('/forgot', userController.postForgot);
  app.get('/reset/:token', userController.getReset);
  app.post('/reset/:token', userController.postReset);
  app.get('/signup', userController.getSignup);
  app.post('/signup', userController.postSignup);
  app.get('/verificacao/:verifToken', userController.verifyAccount);
  // app.get('/contact', contactController.getContact);
  app.post('/contact', contactController.postContact);
  app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
  app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
  app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
  app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
  app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
  app.get('/user/:id/makeadmin', passportConfig.isAuthenticated, passportConfig.isAdmin, userController.makeAdmin);
  app.get('/user/:id/delete', passportConfig.isAuthenticated, passportConfig.isAdmin, userController.delete);

  /**
   * OAuth authentication routes. (Sign in)
   */
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    console.log(req.session);
    res.redirect(req.session.returnTo || '/');
  });
  app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
  });
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
  });

};
