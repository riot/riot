const saucelabsBrowsers = require('./saucelabs-browsers').browsers,
  path = require('path'),
  RIOT_WITH_COMPILER_PATH = '../dist/riot/riot+compiler.js',
  RIOT_PATH = '../dist/riot/riot.js',
  // split the riot+compiler tests from the normal riot core tests
  testFiles = `./specs/${process.env.TEST_FOLDER}/**/*.spec.js`,
  needsCompiler = process.env.TEST_FOLDER === 'compiler',
  preprocessors = {}

var browsers = ['PhantomJS'] // this is not a constant

// run the tests only on the saucelabs browsers
if (process.env.SAUCELABS) {
  browsers = Object.keys(saucelabsBrowsers)
}


module.exports = function(conf) {

  preprocessors[testFiles] = ['rollup']

  conf.set({
    basePath: '',
    autoWatch: true,
    frameworks: ['mocha'],
    proxies: {
      '/tag/': '/base/tag/'
    },
    files: [
      '../node_modules/chai/chai.js',
      '../node_modules/sinon/pkg/sinon.js',
      '../node_modules/sinon-chai/lib/sinon-chai.js',
      {
        pattern: 'tag/*.tag',
        served: true,
        included: false
      },
      needsCompiler ? RIOT_WITH_COMPILER_PATH : RIOT_PATH,
      testFiles
    ],
    // logLevel: conf.LOG_DEBUG,
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
        external: ['riot'],
        plugins: [
          require('rollup-plugin-riot')()
        ].concat(require('../config/defaults').plugins)
      },
      bundle: {
        globals: {
          riot: 'riot'
        },
        format: 'iife'
        // sourceMap: 'inline' TODO: enable the sourcemaps in the compiler
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
