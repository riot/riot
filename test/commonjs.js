var assert = require('assert')

var riot = require('..')

assert.ok(require('./tag/timer.tag'))
assert.equal(riot.render('timer', { start: 10 }), '<p>Seconds Elapsed: 10</p>')