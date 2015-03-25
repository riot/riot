describe('Route', function() {

  var counter = 0,
      ended = false

  after(function() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    ended = true
  })
  // TODO: refactor these tests
  // all the undefined must be removed
  it('it detecs the hash params', function() {

    riot.route(function(first, second, params) {
      if (ended) return
      counter++
      expect(['mummypowder', '!']).to.contain(first)
      expect(['logo-and-key', 'user', 'http%3A%2F%2Fxxx.yyy']).to.contain(second)
      expect([undefined, 'activation?token=xyz']).to.contain(params)
    })

    riot.route.exec(function(first, second, params) {
      if (ended) return
      counter++
      expect(['', '!']).to.contain(first)
      expect([undefined, 'user']).to.contain(second)
      expect([undefined, 'activation?token=xyz']).to.contain(params)
    })

    riot.route('mummypowder/logo-and-key')

    false && riot.route.parser(function(path) {
      var raw = path.slice(2).split('?'),
          uri = raw[0].split('/'),
          qs = raw[1],
          params = {}

      if (qs) {
        qs.split('&').forEach(function(v) {
          var c = v.split('=')
          params[c[0]] = c[1]
        })
      }

      uri.push(params)
      return uri
    })

    riot.route('!/user/activation?token=xyz')

    riot.route('mummypowder/http%3A%2F%2Fxxx.yyy')

    expect(counter).to.be(4)

  })
})
