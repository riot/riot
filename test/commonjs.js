var test = require('tape')
var riot = require('..')

test('riot require extension test', function(t) {
  t.plan(1)
  t.ok(require('./tag/timer.tag'), 'requiring tag file')
})