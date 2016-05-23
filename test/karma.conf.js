module.exports = function(config) {

  const saucelabsBrowsers = require('./saucelabs-browsers').browsers,
    browsers = ['PhantomJS'],
    entryFile = './specs/browser/index.js',
    preprocessors = {
      [entryFile]: ['rollup']
    }

  // run the tests only on the saucelabs browsers
  if (process.env.SAUCELABS) {
    browsers = Object.keys(saucelabsBrowsers)
  }

  if (!process.env.DEBUG) {
    preprocessors['../dist/riot/riot.js'] = ['coverage']
  }

  config.set({
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
      './helpers/bind.js',
      '../node_modules/chai/chai.js',
      '../node_modules/sinon/pkg/sinon.js',
      '../node_modules/sinon-chai/lib/sinon-chai.js',
      {
        pattern: 'tag/*.tag',
        served: true,
        included: false
      },
      '../dist/riot/riot.js',
      '../dist/tags.js',
      entryFile
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
      rollup: {
        plugins: [
          require('rollup-plugin-npm')({
            jsnext: true,
            main: true
          }),
          require('rollup-plugin-commonjs')({
            include: 'node_modules/**'
          }),
          require('rollup-plugin-babel')({
            exclude: 'node_modules/riot-tmpl/**'
          })
        ]
      },
      bundle: {
        format: 'umd',
        sourceMap: 'inline'
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
  })
}
