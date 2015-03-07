module.exports = function(config) {
  config.set({
      basePath: '',
      autoWatch: true,
      frameworks: ['mocha'],
      plugins: [
          'karma-mocha',
          'karma-coverage',
          'karma-phantomjs-launcher'
      ],
      files: [
          '../node_modules/mocha/mocha.js',
          '../node_modules/expect.js/index.js',
          '../dist/riot/riot+compiler.js',
          'specs/compiler-browser.js',
          'specs/observable.js',
          'specs/tmpl.js',
          'specs/speed.js',
          'specs/route.js'
      ],
      browsers: ['PhantomJS'],

      reporters: ['progress', 'coverage'],
      preprocessors: {
          '../dist/riot/riot+compiler.js': ['coverage']
      },

      coverageReporter: {
          dir: '../coverage/'
      },

      singleRun: true
  })
}
