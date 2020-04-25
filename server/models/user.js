const bcrypt = require('bcrypt');

/**
 * Constructs a new User DTO for users' accounts that they use to sign up
 * and login within the app.
 *
 * @class User
 * @param {object} data         - Data to initialize the User with
 * @param {ObjectId} [data._id] - The _id from MongoDB queried objects
 * @param {string} [data.email]
 * @param {string} [data.passwordHash]
 */
function User(data) {
  /**
   * The unique identifier for each user.
   * <br/>
   * <i>NOTE: This property is not written to the database.</i>
   *
   * @name User#id
   * @type ObjectId
   */
  this.id = data._id;

  /**
   * The email associated with the user's account.
   *
   * @name User#email
   * @type {string}
   */
  this.email = data.email;

  /**
   * The password hash associated with the user's account.
   *
   * @name User#passwordHash
   * @type {string}
   */
  this.passwordHash = data.passwordHash;
}

/**
 * @callback updatePasswordHashCallback
 * @param err
 */

/**
 * Setter function for users which set the user's `passwordHash`
 * by hashing the given plaintext password.
 *
 * @param {string} password                   - The user's plaintext password
 * @param {updatePasswordHashCallback} [cb]   - Callback function which indicated if there was an error.
 */
User.prototype.updatePasswordHash = function (password, cb) {
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      console.error(`Error hashing user's (id=${this.id}) password!`);
      cb(err);
    } else {
      this.passwordHash = hash;
      cb(null);
    }
  });
};

module.exports = {
  User,
};
