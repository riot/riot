var glob = require('glob')
var expect = require('expect.js')

var riot = require('..')

describe('node/io.js tests', function() {

  it('require tags', function() {
    glob('./tag/*.tag', { cwd: __dirname }, function (err, tags) {
      expect(err).to.be(null)
      tags.forEach(function(tag) {
        expect(require(tag)).to.be.ok()
      })
    })
  })

})