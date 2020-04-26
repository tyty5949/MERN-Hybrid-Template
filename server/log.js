const winston = require('winston');
const expressWinston = require('express-winston');
const S3StreamLogger = require('s3-streamlogger').S3StreamLogger;

let _consoleTransport;
let _s3Transport;
let _transports;
let _logger;

/**
 * Helper constant to produce a readable output
 * for winston console logs.
 */
const readableFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

/**
 * Initialize the winston transports and loggers. Utilizes two
 * transports:
 *  1. Console
 *  2. AWS S3 Log Files (only used in production)
 */
function initialize() {
  // Initialize transports
  if (!_consoleTransport) {
    // Initialize console transport
    _consoleTransport = new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        readableFormat,
      ),
    });
  }

  if (!_s3Transport && process.env.NODE_ENV === 'production') {
    _s3Transport = new winston.transports.Stream({
      stream: new S3StreamLogger({
        bucket: process.env.WINSTON_S3_BUCKET,
        folder: process.env.WINSTON_S3_FOLDER,
        access_key_id: process.env.WINSTON_S3_ACCESS_KEY_ID,
        secret_access_key: process.env.WINSTON_S3_SECRET,
      }),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    });
    _s3Transport.on('error', function (err) {
      // eslint-disable-next-line no-console
      console.error('S3 logging transport error', err);
    });
  }

  // Set transports to use
  _transports = [_consoleTransport];
  if (process.env.NODE_ENV === 'production') {
    _transports.push(_s3Transport);
  }

  // Initialize logger
  if (!_logger) {
    _logger = winston.createLogger({
      transports: _transports,
    });
  }
}

/**
 * Adds middleware to express which logs all requests
 * that hit the server.
 *
 * @param app
 */
function addRequestMiddleware(app) {
  app.use(
    expressWinston.logger({
      transports: _transports,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true,
      colorize: false,
      statusLevels: true,
      bodyBlacklist: ['password'],
      headerBlacklist: ['cookie', 'accept', 'accept-encoding'],
      skip(req, res) {
        // Log all requests that have an error code
        if (res.statusCode >= 400) {
          return false;
        }
        // Ignore successful /assets routes
        return req.url.startsWith('/assets');
      },
    }),
  );
}

/**
 * Add middleware to request which logs uncaught errors which
 * occur during the execution of requests.
 *
 * @param app
 */
function addErrorMiddleware(app) {
  app.use(
    expressWinston.errorLogger({
      transports: _transports,
    }),
  );
}

/**
 * Logs a message with the info level.
 *
 * @param msg       - The log message
 * @param [meta={}] - Optional meta information to be passed into log.
 */
function info(msg, meta = {}) {
  _logger.log({
    level: 'info',
    message: msg,
    meta,
  });
}

/**
 * Logs a message with the warn level.
 *
 * @param msg       - The log message
 * @param [meta={}] - Optional meta information to be passed into log.
 */
function warn(msg, meta = {}) {
  _logger.log({
    level: 'warn',
    message: msg,
    meta,
  });
}

/**
 * Logs a message with error level.
 *
 * @param msg       - The log message
 * @param [meta={}] - Optional meta information to be passed into log.
 */
function error(msg, meta = {}) {
  _logger.log({
    level: 'error',
    message: msg,
    meta,
  });
}

module.exports = {
  initialize,
  info,
  warn,
  error,
  addRequestMiddleware,
  addErrorMiddleware,
};
