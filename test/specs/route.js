describe('route', function() {

  var counter = 0

  after(function() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  })

  it('it detecs the hash params', function() {

    riot.route(function(first, second, params) {
      counter++
      expect(~['mummypowder', '!'].indexOf(first)).to.not.be(false)
      expect(~['logo-and-key', 'user'].indexOf(second)).to.not.be(false)
      expect(~[undefined, 'activation?token=xyz'].indexOf(params)).to.not.be(false)
    })

    riot.route.exec(function(first, second, params) {
      counter++
      expect(~['', '!'].indexOf(first)).to.not.be(false)
      expect(~[undefined, 'user'].indexOf(second)).to.not.be(false)
      expect(~[undefined, 'activation?token=xyz'].indexOf(params)).to.not.be(false)
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