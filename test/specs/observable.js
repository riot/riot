describe('Observable', function() {
  var el = riot.observable(),
      counter = 0

  beforeEach(function() {
    counter = 0
  })

  afterEach(function() {
    el.off('*')
  })

  it('single listener', function() {

    el.on('a', function(arg) {
      expect(arg).to.be(true)
    })
    el.trigger('a', true)

  })

  it('multiple listeners with special chars', function() {

    el.on('b/4 c-d d:x', function(e) {
      if (++counter == 3) expect(e).to.be('d:x')
    })

    el.one('d:x', function(arg) {
      expect(arg).to.be(true)
    })

    el.trigger('b/4').trigger('c-d').trigger('d:x', true)

  })

  it('one', function() {

    el.one('g', function() {
      expect(++counter).to.be(1)
    })

    el.trigger('g').trigger('g')

  })

  it('one & on', function() {

    el.one('y', function() {
      counter++
    }).on('y', function() {
      counter++
    }).trigger('y').trigger('y')

    expect(counter).to.be(3)

  })

  it('one & on sharing the same handler', function() {
    var handler1 = function() { counter++ },
        handler2 = function() { counter++ }

    el.one('foo', handler1)
      .on('foo', handler2)
      .one('foo2', handler2)
      .on('foo2', handler1)

    el
      .trigger('foo')
      .trigger('foo')
      .trigger('foo')
      .trigger('foo2')
      .trigger('foo2')

    expect(counter).to.be(7)

  })

  it('Remove listeners', function() {

    function r() {
      expect(++counter).to.be(1)
    }

    el.on('r', r).on('s', r).off('s', r).trigger('r').trigger('s')

  })

  it('Remove multiple listeners', function() {

    function fn() {
      counter++
    }

    el.on('a1 b1', fn).on('c1', fn).off('a1 b1').off('c1').trigger('a1').trigger('b1').trigger('c1')

    expect(counter).to.be(0)

  })

  it('Removes duplicate callbacks on off for specific handler', function() {

    function func() {
      counter++
    }

    el.on('a1', func).on('a1', func).trigger('a1').off('a1', func).trigger('a1')

    expect(counter).to.be(2)

  })

  describe('does not call trigger infinitely', function() {

    var otherEl = riot.observable()

    it('2 calls are enough to know the test failed', function() {

      el.on('update', function(value) {
        if (counter++ < 1) {
          otherEl.trigger('update', value)
        }
      })

      otherEl.on('update', function(value) {
        el.trigger('update', value)
      })

      el.trigger('update', 'foo')

      expect(counter).to.be(1)

    })

  })

  it('is able to trigger events inside a listener', function() {

    var e2 = false

    el.on('e1', function() { this.trigger('e2') })
    el.on('e1', function() { e2 = true })

    el.trigger('e1')

    expect(e2).to.be(true)

  })

  it('listen all the events', function() {

    function func() {
      if (!counter) {
        expect(arguments[0]).to.be('a')
        expect(arguments[1]).to.be('foo')
        expect(arguments[2]).to.be('bar')
      } else {
        expect(['b', 'c']).to.contain(arguments[0])
      }
      counter++
    }

    el.on('all', func)

    el.trigger('a', 'foo', 'bar')
    el.trigger('b')
    el.trigger('c')

    expect(counter).to.be(3)

  })

  it('listen all the events only once', function() {

    function func() {
      if (!counter) {
        expect(arguments[0]).to.be('a')
        expect(arguments[1]).to.be('foo')
        expect(arguments[2]).to.be('bar')
      }
      counter++
    }

    el.one('all', func)

    el.trigger('a', 'foo', 'bar')
    el.trigger('b')
    el.trigger('c')

    expect(counter).to.be(1)

  })

  it('Multiple arguments', function() {

    el.on('j', function(a, b) {
      expect(a).to.be(1)
      expect(b[0]).to.be(2)
    })

    el.trigger('j', 1, [2])

  })

  it('Remove all listeners', function() {

    function fn() {
      counter++
    }

    el.on('aa', fn).on('aa', fn).on('bb', fn)
    el.off('*')

    el.trigger('aa').trigger('bb')

    expect(counter).to.be(0)

  })

  it('Remove specific listener', function() {

    var one = 0,
      two = 0

    function fn() {
      one++
    }

    el.on('bb', fn).on('bb', function() {
      two++
    })

    el.trigger('bb')
    el.off('bb', fn)
    el.trigger('bb')

    expect(one).to.be(1)
    expect(two).to.be(2)

  })

  it('should not throw internal error', function() {

    el.off('non-existing', function() {})

  })

  it('multi off', function() {
    var fn = function() { counter++ }

    el.on('foo', fn).on('bar', fn)
    el.off('foo bar', fn)
    el.trigger('foo').trigger('bar')
    expect(counter).to.be(0)
  })

  it('remove handler while triggering', function() {

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

    expect(counter).to.be(2)

  })

})

