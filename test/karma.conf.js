const saucelabsBrowsers = require('./saucelabs-browsers').browsers,
  path = require('path'),
  browsers = ['PhantomJS'],
  RIOT_WITH_COMPILER_PATH = path.resolve(__dirname, '..', 'dist', 'riot', 'riot+compiler.es6.js'),
  RIOT_PATH = path.resolve(__dirname, '..', 'dist', 'riot', 'riot.es6.js'),
  entryFile = './specs/browser/**/*.spec.js',
  preprocessors = {}

// run the tests only on the saucelabs browsers
if (process.env.SAUCELABS) {
  browsers = Object.keys(saucelabsBrowsers)
}

if (!process.env.DEBUG && process.env.RIOT_COV) {
  preprocessors[RIOT_PATH] = ['coverage']
}

module.exports = function(opts) {

  preprocessors[opts.testFiles] = ['rollup']

  return {
    basePath: '',
    autoWatch: true,
    frameworks: ['mocha'],
    plugins: [
      'karma-mocha',
      'karma-coverage',
      'karma-rollup-preprocessor',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-sauce-launcher'
    ],
    proxies: {
      '/tag/': '/base/tag/'
    },
    files: [
      './helpers/polyfills.js',
      '../node_modules/chai/chai.js',
      '../node_modules/sinon/pkg/sinon.js',
      '../node_modules/sinon-chai/lib/sinon-chai.js',
      {
        pattern: 'tag/*.tag',
        served: true,
        included: false
      },
      opts.testFiles
    ],
    concurrency: 2,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      testName: 'riotjs',
      startConnect: true,
      recordVideo: false,
      recordScreenshots: false
    },
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,
    browserDisconnectTolerance: 2,
    customLaunchers: saucelabsBrowsers,
    browsers: browsers,

    reporters: ['progress', 'saucelabs', 'coverage'],
    preprocessors: preprocessors,

    rollupPreprocessor: {
      // use our default rollup plugins adding also the riot plugin
      // to import dinamically the tags
      rollup: {
        plugins: [
          require('rollup-plugin-alias')({
            compiler: RIOT_WITH_COMPILER_PATH,
            riot: RIOT_PATH
          }),
          require('rollup-plugin-riot')({
            riotPath: RIOT_PATH
          })
        ].concat(require('../config/defaults').plugins)
      },
      bundle: {
        format: 'umd'
        // sourceMap: 'inline' TODO: enable the sourcemaps in the compiler
      }
    },

    coverageReporter: {
      dir: '../coverage/browsers',
      reporters: [{
        type: 'lcov',
        subdir: 'report-lcov'
      }]
    },

    singleRun: true
  }
}
