var analyzer = require('../../../lib/server/analyzer')
var fs = require('fs')
var path = require('path')

function cat(filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename)).toString()
}

describe('Syntax checker', function() {

  it('returns no error if the tag is valid', function() {
    var errors = analyzer(cat('valid.tag')).filter(function(r) { return r.error })
    expect(errors.length).to.equal(0)
  })
  it('returns an error if the tag is not closed', function() {
    var results = analyzer(cat('tag-not-closed.tag'))
    expect(results[3].error).to.equal('Last tag definition is not closed')
  })
  it('returns an error if there are unmatched closing tags', function() {
    var results = analyzer(cat('tag-unmatch.tag'))
    expect(results[3].error).to.equal('Closing tag unmatch')
    expect(results[5].error).to.equal('Last tag definition is not closed')
  })
  it('returns an error if there are no indentations within tag', function() {
    var results = analyzer(cat('without-indent.tag'))
    expect(results[1].error).to.equal('Indentation needed within tag definition')
    expect(results[2].error).to.equal('Indentation needed within tag definition')
  })
  it('returns an error if there are invalid tag flagments', function() {
    var results = analyzer(cat('invalid.tag'))
    expect(results[5].error).to.equal('Indentation needed within tag definition')
    expect(results[10].error).to.equal('Invalid tag flagment')
    expect(results[16].error).to.equal('Invalid tag flagment')
  })

})
