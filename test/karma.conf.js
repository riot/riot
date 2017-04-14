const saucelabsBrowsers = require('./saucelabs-browsers').browsers,
  RIOT_WITH_COMPILER_PATH = '../dist/riot/riot+compiler.js',
  RIOT_PATH = '../dist/riot/riot.js',
  isDebug = process.env.DEBUG,
  // split the riot+compiler tests from the normal riot core tests
  testsSetup = './specs/browser/index.js',
  testFiles = `./specs/${process.env.TEST_FOLDER}/**/*.spec.js`,
  needsCompiler = /compiler/.test(process.env.TEST_FOLDER),
  preprocessors = {}

var browsers = ['PhantomJS'] // this is not a constant

// run the tests only on the saucelabs browsers
if (process.env.SAUCELABS) {
  browsers = Object.keys(saucelabsBrowsers)
}


module.exports = function(conf) {
  preprocessors[testFiles] = ['rollup']
  // enable the coverage for riot.js
  if (!needsCompiler && !isDebug) preprocessors[RIOT_PATH] = ['coverage']

  conf.set({
    basePath: '',
    autoWatch: true,
    frameworks: ['mocha'],
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
      needsCompiler ? RIOT_WITH_COMPILER_PATH : RIOT_PATH,
      testsSetup,
      testFiles
    ],
    // logLevel: conf.LOG_DEBUG,
    concurrency: 2,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      testName: `riotjs${ needsCompiler ? '+compiler' : ''}`,
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
      external: ['riot', 'external-helpers'],
      plugins: [
        require('rollup-plugin-riot')()
      ].concat(require('../config/defaults').plugins),
      globals: {
        riot: 'riot'
      },
      format: 'iife'
      // sourceMap: 'inline' TODO: enable the sourcemaps in the compiler
    },

    client: {
      mocha: {
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html'
      }
    },

    coverageReporter: {
      dir: '../coverage',
      reporters: [{
        type: 'lcov',
        subdir: 'report-lcov'
      }]
    },

    singleRun: true
  })
}
