const Passport = require('passport');
const UserService = require('../../services/userService');

/**
 * Verifies that the user is authenticated with an active session.
 * If not, the redirects to the /login route.
 *
 * This is useful for pages with a front-end as it will redirect to the login view.
 *
 * @param {e.Request & { isAuthenticated }} req
 * @param {e.Response}res
 * @param {NextFunction} next
 * @returns {NextFunction}
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

/**
 * Verifies that the user is NOT authenticated with an active session.
 * If they are, redirects to a top level route.
 *
 * This is useful in many cases, mainly to prevent multiple active sessions for each user.
 *
 * @param {e.Request & { isAuthenticated }} req
 * @param {e.Response} res
 * @param {NextFunction} next
 * @returns {NextFunction}
 */
function isNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
}

/**
 * Verifies that the user is authenticated with an active session.
 * If not, sends a 401 Unauthorized error.
 *
 * This is useful for API endpoints as they shouldn't have a redirect, only an error
 *
 * @module myMiddleware
 * @function
 * @param {e.Request & { isAuthenticated }} req
 * @param {e.Response} res
 * @param {NextFunction} next
 * @returns {NextFunction}
 */
function isApiAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(401);
  }
}

/**
 * Attempts to authenticate a user using our Passport LocalStrategy.
 *  @see /util/auth.js@localStrategy
 *
 * If the user is successfully authenticated then redirect to a
 * top level route. If the user is not successfully authenticated
 * then JSON with a message property is returned.
 *
 * @param {e.Request} req
 * @param {e.Response} res
 * @returns {e.NextFunction}
 */
function authenticateUser(req, res) {
  Passport.authenticate('local', {}, function (err) {
    if (!err) {
      res.redirect('/');
    } else {
      res.json({
        message: err,
      });
    }
  })(req, res);
}

/**
 *
 * @param {e.Request & { logout }} req
 * @param {e.Response} res
 * @returns {e.NextFunction}
 */
function logoutUser(req, res) {
  req.logout();
  res.redirect('/login');
}

function register(req, res) {
  UserService.findOne({ email: req.body.email }, {});
}

module.exports = {
  authenticateUser,
  logoutUser,
  isAuthenticated,
  isNotAuthenticated,
  isApiAuthenticated,
};
