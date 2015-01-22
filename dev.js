#!/usr/bin/env node

// For developers of Riot

require('shelljs/global')

var gaze = require('gaze'),
    compile = require('./compiler')


// watch and build riot.js
gaze('lib/*.js', function() {
  this.on('changed', function() {
    exec('make riot')
  })
})


// watch and build tags.js for testing
var tags = 'test/tag/*.tag'

gaze(tags, function() {
  this.on('changed', function() {
    compile(cat(tags)).to('dist/tags.js')
  })
})
