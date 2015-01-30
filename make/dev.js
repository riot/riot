#!/usr/bin/env node

// For developers of Riot

require('shelljs/global')

var chokidar = require('chokidar'),
    cli = require('../lib/cli')


// watch and build riot.js
chokidar
  .watch('lib/*.js', { ignoreInitial: true })
  .on('all', function() { exec('make riot') })


// watch and build tags.js for testing
cli.watch({ from: 'test/tag', to: 'dist/tags.js' })
