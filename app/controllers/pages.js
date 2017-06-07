/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('pages/home', {
    title: 'Home'
  });
};

/**
 * GET /
 * User page.
 */
exports.userShow = (req, res) => {
  res.render('pages/user', {
    title: `User ${req.params.id}`
  });
};

/**
 * GET /
 * Dasboard page.
 */
exports.dashboard = (req, res) => {
  res.render('pages/dashboard', {
    title: `User ${req.params.id}`
  });
};
