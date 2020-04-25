const router = require('express').Router();
const compose = require('compose-middleware').compose;
const AuthController = require('../controllers/api/auth');

/**
 * Route which attempts to execute a user login. If the login is
 * a success, express creates a session, redirects to a top level
 * route, and sends a cookie. If login is a failure, sends a 401
 * Unauthorized status.
 *
 * NOTE: This route is only accessible to users who do not have an active session open.
 */
const loginMiddleware = compose([
  AuthController.isNotAuthenticated,
  AuthController.authenticateUser,
]);
router.post('/login', loginMiddleware);

/**
 * Route which attempts to execute a user logout. After the
 * logout is executed, redirects to a login route.
 *
 * NOTE: This route is only accessible to users who have an active session open.
 */
const logoutMiddleware = compose([AuthController.isAuthenticated, AuthController.logoutUser]);
router.get('/logout', logoutMiddleware);

module.exports = router;
