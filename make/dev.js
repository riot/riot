#!/usr/bin/env node

// For Riot developers

require('shelljs/global')

var chokidar = require('chokidar'),
    cli = require('../lib/cli')


// watch and build riot.js
chokidar
  .watch('lib/tag/*.js', { ignoreInitial: true })
  .on('all', function() {
    (';(function(riot, is_browser) {' +
      cat('lib/observable.js', 'lib/tmpl.js', 'lib/tag/*') +
    '})(riot, this.top)').to('dist/riot.js')
  })


// watch and build tags.js for testing
// cli.watch({ from: 'test/tag', to: 'dist/tags.js' })
