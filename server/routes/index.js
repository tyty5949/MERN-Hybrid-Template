const router = require('express').Router();

/* View routes */
router.use(require('./view'));

/* Auth routes */
router.use('/auth', require('./auth'));

/* API Routes */
router.use('/api', require('./api'));

// Reject non-registered routes
router.all('/**', (req, res) => {
  res.sendStatus(404);
});

module.exports = router;
