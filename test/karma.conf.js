const saucelabsBrowsers = require('./saucelabs-browsers').browsers,
  riotRollup = require('rollup-plugin-riot'),
  isSaucelabs = process.env.SAUCELABS,
  isTravis = !!process.env.TRAVIS_BUILD_NUMBER,
  TEST_FILES = './specs/**/*.spec.js',
  browsers = isSaucelabs ? Object.keys(saucelabsBrowsers) : ['ChromeHeadlessNoSandbox'],
  rollupConfig = require('../rollup.config')

// set the babel env in order to enable the babel istanbul plugin
process.env.BABEL_ENV= 'test'

module.exports = function(conf) {
  conf.set({
    basePath: '',
    autoWatch: true,
    frameworks: ['mocha'],
    proxies: {
      '/components/': '/base/components/'
    },
    files: [
      '../node_modules/chai/chai.js',
      '../node_modules/sinon/pkg/sinon.js',
      '../node_modules/sinon-chai/lib/sinon-chai.js',
      {
        pattern: 'components/*.riot',
        served: true,
        included: false
      },
      TEST_FILES
    ],
    sauceLabs: {
      build: `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      testName: 'riot'
    },
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,
    browserDisconnectTolerance: 2,
    customLaunchers: Object.assign(
      {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
        }
      },
      saucelabsBrowsers
    ),
    browsers: browsers,

    reporters: ['saucelabs']
      .concat(isSaucelabs ? [] : ['coverage'])
      .concat(isTravis ? [] : 'progress'),

    preprocessors: {
      [TEST_FILES]: ['rollup']
    },

    rollupPreprocessor: {
      ...rollupConfig,
      plugins: [
        riotRollup(),
        ...rollupConfig.plugins
      ],
      onwarn: () => {},
      external: ['chai', 'sinon'],
      output: {
        globals: {'chai': 'chai', 'sinon': 'sinon'},
        format: 'iife',
        sourcemap: 'inline'
      }
    },

    client: {
      mocha: {
        timeout: isSaucelabs ? 30000 : 3000, // saucelab tests can be really really slow
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html'
      }
    },

    coverageReporter: {
      dir: '../coverage',
      reporters: [{
        type: 'lcov',
        subdir: 'report-lcov'
      }, {
        type: 'text'
      }]
    },

    singleRun: true
  })
}
