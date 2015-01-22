var riot = require('./make'),
    fs = require('fs'),
    exec = require('child_process').exec,
    assert = require('assert'),
    dist = 'dist/make.js'


// Use as a Node module

fs.existsSync(dist) && fs.unlinkSync(dist)
riot.make({ from: '.', to: dist })
assert.ok(fs.existsSync(dist))


// Use as a CLI tool

fs.unlinkSync(dist)
exec('riot . '+dist, function(e, res) {
  assert.ok(fs.existsSync(dist))
  assert.ok(~res.indexOf('.tag'))
})