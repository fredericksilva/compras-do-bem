
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

// const upload = multer({ dest: path.join(__dirname, '../public/uploads') });

/**
 * Expose
 */

module.exports = (app, passportConfig, passport) => {
  /**
   * Pages routes.
   */
  app.get('/', pagesController.index);
  app.get('/user/:id', pagesController.userShow);
  app.get('/servico', servicoController.index);
  app.param('urlized', servicoController.load);
  app.get('/servico/novo', passportConfig.isAuthenticated, servicoController.new);
  app.get('/servico/servico', servicoController.showStatic);
  app.get('/servico/:urlized', servicoController.show);
  app.get('/servico/:urlized/edit', passportConfig.isAuthenticated, servicoController.edit);
  app.get('/dashboard', passportConfig.isAuthenticated, passportConfig.isAdmin, pagesController.dashboard);
  app.get('/categorias', categoriaController.index);

  /**
   * Servico routes.
   */
  app.post('/servico', passportConfig.isAuthenticated, servicoController.create);
  app.put('/servico/:urlized', passportConfig.isAuthenticated, servicoController.update);

    /**
   * Categoria routes.
   */
  app.post('/categoria/nova', passportConfig.isAuthenticated, passportConfig.isAdmin, categoriaController.create);
  app.post('/categoria/:id/edit', passportConfig.isAuthenticated, passportConfig.isAdmin, categoriaController.update);
  app.delete('/categoria/:id', passportConfig.isAuthenticated, passportConfig.isAdmin, categoriaController.delete);

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
  app.get('/user/:id/makeadmin', passportConfig.isAuthenticated, userController.makeAdmin)

  /**
   * API examples routes.
   */
  // app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
  // app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
  // app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
  // app.get('/api/paypal', apiController.getPayPal);
  // app.get('/api/paypal/success', apiController.getPayPalSuccess);
  // app.get('/api/paypal/cancel', apiController.getPayPalCancel);
  // app.get('/api/upload', apiController.getFileUpload);
  // app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
  // app.get('/api/google-maps', apiController.getGoogleMaps);

  /**
   * OAuth authentication routes. (Sign in)
   */
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
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
