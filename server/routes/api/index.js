const router = require('express').Router();
const compose = require('compose-middleware').compose;
const AuthController = require('../../controllers/api/auth');

/**
 * For all /api routes, use middleware that requires
 * users to be authenticated.
 */
router.use(compose([AuthController.isApiAuthenticated]));

module.exports = router;
