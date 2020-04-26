const browserSync = require('browser-sync');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const httpProxy = require('http-proxy');
const imagemin = require('gulp-imagemin');
const liveServer = require('gulp-live-server');
const path = require('path');
const prettierplugin = require('gulp-prettier');
const replace = require('gulp-replace');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const through = require('through2');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackStream = require('webpack-stream');

/**
 * Production flag set to indicate whether we're building for
 * production or not
 */
let production = false;

/** Webpack config used to build the React app */
const webpackConfig = require('./webpack.config.js');

/** Initializes a server for hosting the node app */
const nodeServer = liveServer.new('server/server.js', 3005);

// ----------------------------------
//  Helpers
// ----------------------------------

/**
 * Gets the prefix (root dir) we are using for build output files.
 *
 *  /dist     For productions builds
 *  /www      For development builds
 *
 * @returns {string}
 */
function getDestPrefix() {
  return production ? 'dist' : 'www';
}

/**
 * Sets the global 'production' variables to true.
 */
function setProductionMode(done) {
  production = true;
  done();
}

/**
 * Sets the global 'production' variables to false.
 */
function setDevMode(done) {
  production = false;
  done();
}

// ----------------------------------
//  Copy Assets
// ----------------------------------

/**
 * Copies static server assets to the assets folder.
 */
function copyAssets(done) {
  const destPrefix = getDestPrefix();

  /* Copy server images */
  gulp
    .src('server/views/assets/img/**/*.{jpg,jpeg,png,gif,ico}')
    .pipe(gulp.dest(`${destPrefix}/assets/img`));

  /* Copy other assets */
  gulp
    .src(['server/views/assets/site.webmanifest'])
    .pipe(gulp.dest(`${destPrefix}/assets`));

  // done.
  done();
}

/**
 * Rewrite occurrences of versioned files in server PUG templates.
 */
function rewritePug() {
  const destPrefix = getDestPrefix();

  return gulp
    .src('server/views/**/*.pug')
    .pipe(
      revRewrite({
        manifest: gulp.src(`${destPrefix}/assets/rev-manifest.json`),
      }),
    )
    .pipe(gulp.dest('server/views/'));
}

/**
 * Revert occurrences of versioned files in server PUG templates to their generic
 * "un-versioned" form.
 */
function revertPug() {
  return gulp
    .src('server/views/**/*.pug')
    .pipe(replace(/(.*)\..{20}.(css|js)/g, '$1.$2'))
    .pipe(gulp.dest('server/views/'));
}

// ----------------------------------
//  Minify and Optimize
// ----------------------------------

/**
 * Minifies all images and replaces them in-place.
 */
function imgMin() {
  return gulp
    .src('dist/**/*.{jpg,jpeg,png,gif}')
    .pipe(imagemin())
    .pipe(gulp.dest((file) => file.base));
}

/**
 * Minifies all html files and replaces them in-place.
 */
function htmlMin() {
  return gulp
    .src('dist/**/*.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      }),
    )
    .pipe(gulp.dest((file) => file.base));
}

// ----------------------------------
//  Development Server
// ----------------------------------

/**
 * Reloads the browser-sync tabs.
 */
function reload(next) {
  browserSync.reload();
  next();
}

/**
 * Serves all static assets while also serving and building
 * the React app using Webpack.
 */
function serve(done) {
  const bundler = webpack(webpackConfig);
  const nodeServerProxy = httpProxy.createProxyServer({});

  browserSync({
    server: 'www/',
    middleware: [
      /**
       * Middleware function to handle redirecting certain
       * routes to the node server proxy.
       */
      function assetRedirect(req, res, next) {
        const { url } = req;

        // Redirect to node server for all requests that are not for '/assets'
        if (url.substring(0, 8) !== '/assets/') {
          nodeServerProxy.web(req, res, { target: 'http://localhost:3005' });
        } else {
          next();
        }
      },
      webpackDevMiddleware(bundler, {
        writeToDisk: true,
        logLevel: 'warn',
        logTime: true,
      }),
      webpackHotMiddleware(bundler),
    ],
  });

  gulp.watch(['client/**/*.{js,jsx,scss}', 'server/**/*.pug'], reload);
  gulp.watch(['server/assets/**/*'], gulp.series(copyAssets, reload));

  done();
}

/**
 * Completely restarts the Node.JS server.
 */
function restartServer(done) {
  nodeServer.stop();
  nodeServer.start();
  done();
}

/**
 * Starts a Node.JS server running the express.js app.
 */
function startServer(done) {
  nodeServer.start();
  gulp.watch(['server/**/*.js'], gulp.series(restartServer, reload));
  done();
}

// ----------------------------------
//  Build
// ----------------------------------

function webpackBuild() {
  const destPrefix = getDestPrefix();

  return gulp
    .src('client/containers/**/index.jsx')
    .pipe(
      webpackStream({
        ...webpackConfig,
        mode: 'production',
        output: {
          ...webpackConfig.output,
          path: path.join(__dirname, `${destPrefix}/assets/`)
        }
      }),
    )
    .pipe(gulp.dest(`${destPrefix}/assets`))
    .pipe(rev())
    .pipe(through.obj(function (file, enc, cb) {
      /*
       * Custom middleware so that the rev-manifest.json generates
       * correctly. Since Webpack and gulp-rev don't work together
       * this function is a bit of hack since it sets up rev to
       * essentially generate a manifest for the webpack hash file
       * names.
       *
       * Ie. The hash used by the rev() function is not used. Instead
       *     we generate the manifest file using the revision hash from
       *     webpack.
       */
      file.path = file.revOrigPath;
      const g = /^(.*)\.(.*)\.(.*)$/.exec(file.path);
      file.revOrigPath = `${g[1]}.${g[3]}`;
      cb(null, file)
    }))
    .pipe(
      rev.manifest(`${destPrefix}/assets/rev-manifest.json`, {
        base: path.join(__dirname, `${destPrefix}/assets/`),
        merge: true,
      }),
    )
    .pipe(gulp.dest(`${destPrefix}/assets`));
}

// ----------------------------------
//  Tasks
// ----------------------------------

/**
 * Removes all serve and build directories.
 */
function clean() {
  return del(['www/', 'dist/']);
}

/**
 * Using 'eslint' to lint the client's '.js' and '.jsx' Javascript
 * files. This gulp task will fail if there are linting
 * errors.
 */
function lint() {
  return gulp
    .src(['client/**/*.{jsx,js}', 'server/**/*.{js,pug}'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

/**
 * Prettifies all code within the client and server projects.
 */
function prettier() {
  const prettierConfig = fs.readFileSync('.prettierrc', 'utf8');

  return gulp
    .src('{server,client}/**/*.{scss,js,jsx,html}')
    .pipe(prettierplugin(prettierConfig))
    .pipe(gulp.dest((file) => file.base));
}

/**
 * Builds the React app and compiles assets for a
 * production build ready for deployment.
 */
const build = gulp.series(
  setProductionMode,
  clean,
  revertPug,
  copyAssets,
  webpackBuild,
  rewritePug,
  gulp.parallel(imgMin, htmlMin),
  setDevMode,
);

/**
 * Runs/builds the React app and express.js node application.
 * Watches the relevant files for changes and re-builds then
 * refreshes the browser as necessary.
 */
const watch = gulp.series(clean, revertPug, copyAssets, gulp.parallel(startServer, serve));

module.exports = {
  build,
  clean: gulp.series(clean, revertPug),
  lint,
  prettier,
  watch,
};
