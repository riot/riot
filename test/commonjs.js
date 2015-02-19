var test = require('tape')

var riot = require('..').register()
var timer = require('./tag/timer.tag')

test('riot require extension test', function(t) {
  t.plan(4)
  t.equal(timer.name, 'timer', 'tag name should be ok')
  t.equal(timer.tmpl, '<p>Seconds Elapsed: { time }</p>', 'tag html should be ok')
  t.equal(timer.css, '', 'tag css should be empty')
  t.equal(typeof timer.fn, 'function', 'tag `fn` should be a function')
})