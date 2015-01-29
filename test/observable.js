
global.riot = {}

require('../lib/observable')

var el = riot.observable(),
  total = 12,
  count = 0,
  counter

function echo(msg) {
  console.info(msg)
}

function assert(test, should) {
  if (test !== should) throw new Error(test + ' != ' + should)
}


echo('single listener')
el.on('a', function(arg) {
  assert(arg, true)
  count++
})

el.trigger('a', true)


echo('multiple listeners with special chars')
counter = 0

el.on('b/4 c-d d:x', function(e) {
  if (++counter == 3) assert(e, 'd:x')
  count++
})

el.one('d:x', function(a) {
  assert(a, true)
  count++
})

el.trigger('b/4').trigger('c-d').trigger('d:x', true)



echo('one')
counter = 0

el.one('g', function() {
  assert(++counter, 1)
  count++
})

el.trigger('g').trigger('g')

echo('one & on')
counter = 0



el.one('y', function() {
  count++
  counter++

}).on('y', function() {
  count++
  counter++

}).trigger('y').trigger('y')

assert(counter, 3)



echo('Remove listeners')
counter = 0

function r() {
  assert(++counter, 1)
  count++
}

el.on('r', r).on('s', r).off('s', r).trigger('r').trigger('s')


echo('Remove multiple listeners')
counter = 0

function fn() {
  counter++
}

el.on('a1 b1', fn).on('c1', fn).off('a1 b1').off('c1').trigger('a1').trigger('b1').trigger('c1')

assert(counter, 0)


echo('Removes duplicate callbacks on off for specific handler')
counter = 0

function func() {
  counter++
}

el.on('a1', func).on('a1', func).trigger('a1').off('a1', func).trigger('a1')


assert(counter, 2)


echo('does not call trigger infinitely')
var counter = 0,
  otherEl = riot.observable()

echo('2 calls are enough to know the test failed')
el.on('update', function(value) {
  if (counter++ < 1) {
    otherEl.trigger('update', value)
  }
})

otherEl.on('update', function(value) {
  el.trigger('update', value)
})

el.trigger('update', 'foo')

assert(1, counter)


echo('is able to trigger events inside a listener')
var e2 = false

el.on('e1', function() { this.trigger('e2') })
el.on('e1', function() { e2 = true })

el.trigger('e1')


assert(e2, true)


echo('Multiple arguments')

el.on('j', function(a, b) {
  assert(a, 1)
  assert(b[0], 2)
  count++
})

el.trigger('j', 1, [2])


echo('Remove all listeners')

counter = 0

function fn() {
  counter++
}

el.on('aa', fn).on('aa', fn).on('bb', fn)
el.off('*')

el.trigger('aa').trigger('bb')

assert(counter, 0)


echo('Remove specific listener')
var one = 0,
  two = 0

function fn() {
  count++
  one++
}

el.on('bb', fn).on('bb', function() {
  two++
})

el.trigger('bb')
el.off('bb', fn)
el.trigger('bb')

assert(one, 1)
assert(two, 2)

echo('should not throw internal error')
el.off('non-existing', fn)


assert(total, count)


echo('remove handler while triggering')
counter = 0

function handler() {
  el.off('rem', handler)
}

el.on('rem', handler)

el.on('rem', function() {
  counter++
})

el.on('rem', function() {
  counter++
})

el.trigger('rem')

assert(counter, 2)

return
