describe('Route', function() {

  var counter = 0

  after(function() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  })
  // TODO: refactor these tests
  // all the undefined must be removed
  it('it detecs the hash params', function() {

    riot.route(function(first, second, params) {
      counter++
      expect(['mummypowder', '!']).to.contain(first)
      expect(['logo-and-key', 'user']).to.contain(second)
      expect([undefined, 'activation?token=xyz']).to.contain(params)
    })

    riot.route.exec(function(first, second, params) {
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

    expect(counter).to.be(3)

  })
})