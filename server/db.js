const client = require('mongodb').MongoClient;
const log = require('./log');

/**
 * The shared db connection.
 *
 * @type MongoClient
 */
let _db;

/**
 * Callback from the connect function which indicates whether there
 * was an error as well as returning an active MongoClient object.
 *
 * @callback connectCallback
 * @param {MongoError} err  - The error object, if one
 * @param {MongoClient} db  - The active connection, if successful connect
 */

/**
 * Connects to a MongoDB database and stores the returned database
 * within the _db singleton in this file. The supplied callback
 * function is called on both connection success or failure.
 *
 * @param {connectCallback} callback
 */
function connect(callback) {
  if (_db) {
    log.warn('Trying to init DB again!');
    return callback(null, _db);
  }

  client.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, function (err, db) {
    if (err) {
      log.error(`Error connecting to MongoDB database: ${err}`);
      return callback(err, null);
    }
    _db = db;
    log.info('Successfully connected to MongoDB database!');
    return callback(null, _db);
  });
}

/**
 * Gets the active connection to the database. The connection must be
 * created first by calling the connect function in this file.
 *
 * @returns {MongoClient}
 */
function getConnection() {
  return _db;
}

/**
 * Access function which wraps getting a specific collection from
 * a specific database. To add further helpfulness, the 'database'
 * parameter is optional and the default can be set.
 *
 * @param {string} collection               - The collection to get
 * @param {string} [database=mydb]          - The database to use to get the collection
 *
 * @returns {Collection}
 */
function get(collection, database = 'mydb') {
  return _db.db(database).collection(collection);
}

module.exports = {
  connect,
  get,
  getConnection,
};
