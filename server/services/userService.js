const bcrypt = require('bcrypt');
const db = require('../db');
const User = require('../models/user').User;
const verifyEmailAddress = require('../util/email').verifyEmailAddress;

/**
 * Finds a single user based upon a query and optional projection.
 *
 * @async
 * @param {object} query
 * @param {object} [projection={}]
 * @returns {Promise<User>}
 */
async function findOne(query, projection = {}) {
  return new Promise(function (resolve) {
    db.get('users')
      .findOne(query, { projection })
      .then(function (data) {
        const user = data ? new User(data) : null;
        resolve(user);
      })
      .catch(function (err) {
        // TODO: Logging
        resolve(null);
      });
  });
}

/**
 * @typedef ValidatePasswordResponse
 * @property {boolean} success    - Whether or not the user is validated
 * @property {string} err         - An error message as to why the user is was not validated
 */

/**
 * Checks a user's login by looking up the user based upon their
 * email and checking their password.
 *
 * @param {string} email      - The email of the user to check the password against
 * @param {string} password   - Plaintext password to check against the user
 * @returns {ValidatePasswordResponse}
 */
async function validatePassword(email, password) {
  // Don't bother querying for user if the email is malformed
  if (!verifyEmailAddress(email)) {
    return { success: false, err: 'Malformed email address!' };
  }

  // Attempt to find user to compare password to. Returns results.
  try {
    const user = await findOne({ email: email.toLowerCase() });

    if (!user) {
      return { success: false, err: 'Invalid email/password!' };
    }

    const success = await bcrypt.compare(password, user.passwordHash);
    return { success, err: success ? null : 'Invalid email/password!' };
  } catch (err) {
    // TODO: Logging
    return { success: false, err: 'Internal error!' };
  }
}

module.exports = {
  findOne,
  validatePassword,
};
