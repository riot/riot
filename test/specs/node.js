var glob = require('glob')

describe('Node/io.js', function() {

  it('require tags', function() {
    glob('../tag/*.tag', { cwd: __dirname }, function (err, tags) {
      expect(err).to.be(null)
      tags.forEach(function(tag) {
        expect(require(tag)).to.be.ok()
      })
    })
  })

})
