var fs = require('fs'),
    path = require('path')

describe('riotjs', function() {

  function render(str) {
    return compiler.js(str, {}, '')
  }

  function cat(dir, filename) {
    return fs.readFileSync(path.join(__dirname, dir, filename)).toString()
  }

  it('converts Class method into v5 style', function() {
    var file = 'riotjs.method.js'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file))
  })
  it('skips comments', function() {
    var file = 'riotjs.comment.js'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file))
  })
  it('converts single line method into v5 style', function() {
    var file = 'riotjs.single-line-method.js'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file))
  })
  it('preserves the default object structure', function() {
    var file = 'riotjs.object.js'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file))
  })
  it('keeps try/catch as is #768', function() {
    var file = 'riotjs.try-catch.js'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file))
  })
  it('preserves non es6 methods #1043', function() {
    var file = 'riotjs.getter-setter.js'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file))
  })

})
