const Passport = require('passport');
const LocalStrategy = require('passport-local');
const UserService = require('../services/userService');

/**
 * Configure serialization process for session users. We only
 * store the id of the user in the session to keep the session
 * data minimal.
 */
Passport.serializeUser((user, done) => {
  done(null, { id: user.id });
});

/**
 * Configure deserialization process for session users. We don't
 * actually deserialize the user from the database as much
 * as we simply pass on the user's id within an object.
 *
 * ex.
 *  req.user = { id: ObjectId('5e9b9999c656c6a32cff1fc3') }
 */
Passport.deserializeUser((id, done) => {
  done(null, { id });
});

/**
 * Defines local username/password strategy for passport.
 *
 * Will attempt to find User that matches specified email
 * and validate their password.
 * @see /models/user
 *
 * One such usage includes:
 *  @see /controllers/api/auth@authenticateUser
 */
const localStrategy = new LocalStrategy.Strategy(
  { usernameField: 'email', passwordField: 'password' },
  async function authenticate(email, password, done) {
    await UserService.validatePassword(email, password).then(function ({ success, err }) {
      return done(success ? null : err);
    });
  },
);

module.exports = {
  localStrategy,
};
