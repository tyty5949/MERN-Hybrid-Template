require('@babel/polyfill');
require('dotenv').config();

const ExpressSession = require('express-session');
const MongoStore = require('connect-mongo')(ExpressSession);
const Express = require('express');
const Passport = require('passport');
const helmet = require('helmet');
const path = require('path');
const db = require('./db');
const LocalStrategy = require('./util/auth').localStrategy;
const Routes = require('./routes');

/**
 * --------------------------------------
 *       Express initialization
 * --------------------------------------
 */
// Initialize express application
console.log('\x1b[33m%s\x1b[0m', 'Starting Node.js server...');
const app = Express();

/**
 * --------------------------------------
 *       Express configuration
 * --------------------------------------
 */
// Use PUG for templating
app.set('view engine', 'pug');
app.locals.basedir = path.join(__dirname, 'views');

// Use JSON parser
app.use(Express.json());

// Use body parser
app.use(Express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());

// Connect to MongoDB database
db.connect(function (err, clientInstance) {
  if (!err) {
    // Use express-session for session management
    app.use(
      ExpressSession({
        name: 'session.sid',
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
          // Session expires after 24hrs (given in milliseconds)
          maxAge: 24 * 3600 * 1000,
          httpOnly: true,
          // TODO: Set 'secure: true' once HTTPS is implemented on site
        },
        store: new MongoStore({
          client: clientInstance,
          dbName: 'serverkeeper',
          // Create TTL indexes on session collection
          autoRemove: 'native',
          // Only save rolling session cookie every 1 hour (given in seconds)
          touchAfter: 3600,
          stringify: false,
        }),
      }),
    );

    // Initialize passport and open a passport session
    app.use(Passport.initialize({}));
    app.use(Passport.session({}));

    // Use passport local authentication strategy
    Passport.use('local', LocalStrategy);

    // Serve all routes
    app.use(Routes);

    // Start Node.js app
    console.log('\x1b[33m%s\x1b[0m', 'Node.js server running!');
    app.listen(process.env.EXPRESS_PORT);
  }
});
