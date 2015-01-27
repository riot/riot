#!/usr/bin/env node

// For developers of Riot

require('shelljs/global')

var chokidar = require('chokidar'),
    riot = require('../compiler')


// watch and build riot.js
chokidar
  .watch('lib/*.js', { ignoreInitial: true })
  .on('all', function() { exec('make riot') })


// watch and build tags.js for testing
riot.watch({ from: 'test/tag', to: 'dist/tags.js' })
