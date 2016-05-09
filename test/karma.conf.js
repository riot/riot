module.exports = function(config) {

  var saucelabsBrowsers = require('./saucelabs-browsers').browsers,
    browsers = ['PhantomJS'],
    preprocessors = {
      'specs/**/*.js': ['babel']
    }

  // run the tests only on the saucelabs browsers
  if (process.env.SAUCELABS) {
    browsers = Object.keys(saucelabsBrowsers)
  }

  if (!process.env.DEBUG) {
    preprocessors['../dist/riot/riot+compiler.js'] = ['coverage']
  }

  config.set({
    basePath: '',
    autoWatch: true,
    frameworks: ['mocha'],
    plugins: [
      'karma-mocha',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-sauce-launcher',
      'karma-babel-preprocessor'
    ],
    proxies: {
      '/tag/': '/base/tag/'
    },
    files: [
      'helpers/bind.js',
      '../node_modules/mocha/mocha.js',
      '../node_modules/expect.js/index.js',
      '../dist/riot/riot+compiler.js',
      'helpers/index.js',
      {
        pattern: 'tag/*.tag',
        served: true,
        included: false
      },
      'specs/browser/tags-bootstrap.js',
      'specs/browser/compiler.js',
      'specs/mixin.js'
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

    coverageReporter: {
      dir: '../coverage/browsers',
      reporters: [{
        type: 'lcov',
        subdir: 'report-lcov'
      }]
    },

    babelPreprocessor: {
      options: {
        plugins: ['transform-es2015-template-literals']
      }
    },

    singleRun: true
  })
}
