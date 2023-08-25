import { saucelabsBrowsers } from './saucelabs-browsers.js'
import rollupConfig from '../rollup.config.js'
import istanbul from 'rollup-plugin-istanbul'
import riotRollup from 'rollup-plugin-riot'

const isSaucelabs = process.env.SAUCELABS,
  isTravis = !!process.env.TRAVIS_BUILD_NUMBER,
  TEST_FILES = './specs/**/*.spec.js',
  browsers = isSaucelabs
    ? Object.keys(saucelabsBrowsers)
    : ['ChromeHeadlessNoSandbox']

export default function (conf) {
  conf.set({
    basePath: '',
    autoWatch: true,
    frameworks: ['mocha'],
    proxies: {
      '/components/': '/base/components/',
    },
    files: [
      '../node_modules/chai/chai.js',
      '../node_modules/sinon/pkg/sinon.js',
      '../node_modules/sinon-chai/lib/sinon-chai.js',
      {
        pattern: 'components/*.riot',
        served: true,
        included: false,
      },
      TEST_FILES,
    ],
    sauceLabs: {
      build: `GITHUB_RUN_NUMBER #${process.env.GITHUB_RUN_NUMBER} (${process.env.GITHUB_RUN_NUMBER})`,
      tunnelIdentifier: process.env.GITHUB_RUN_ID,
      testName: 'riot',
    },
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,
    browserDisconnectTolerance: 2,
    customLaunchers: Object.assign(
      {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox'],
        },
      },
      saucelabsBrowsers,
    ),
    browsers: browsers,

    reporters: ['saucelabs']
      .concat(isSaucelabs ? [] : ['coverage'])
      .concat(isTravis ? [] : 'progress'),

    preprocessors: {
      [TEST_FILES]: ['rollup'],
    },

    rollupPreprocessor: {
      ...rollupConfig,
      plugins: [
        riotRollup(),
        istanbul({
          exclude: ['./test/**/*', './node_modules/**/*'],
        }),
        ...rollupConfig.plugins,
      ],
      onwarn: () => {},
      external: ['chai', 'sinon'],
      output: {
        globals: { chai: 'chai', sinon: 'sinon' },
        format: 'iife',
        sourcemap: 'inline',
      },
    },

    client: {
      mocha: {
        timeout: isSaucelabs ? 30000 : 3000, // saucelab tests can be really really slow
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html',
      },
    },

    coverageReporter: {
      dir: '../coverage',
      reporters: [
        {
          type: 'lcov',
          subdir: 'report-lcov',
        },
        {
          type: 'text',
        },
      ],
    },

    singleRun: true,
  })
}
