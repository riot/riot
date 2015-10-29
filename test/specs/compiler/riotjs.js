var fs = require('fs'),
  path = require('path')

describe('riotjs', function () {

  function render(str) {
    return compiler.js(str, {})
  }

  function cat(dir, filename) {
    return fs.readFileSync(path.join(__dirname, dir, filename), 'utf8')
  }

  function testFile(file, opts) {
    expect(render(cat('fixtures', file))).to.be(cat('expect', file))
  }

  it('converts Class method into v5 style', function () {
    testFile('riotjs.method.js')
  })

  it('converts Class methods into v5 style (alternate formats)', function () {
    testFile('riotjs.methods-alt.js')
  })

  it('skips comments', function () {
    testFile('riotjs.comment.js')
  })

  it('converts single line method into v5 style', function () {
    testFile('riotjs.single-line-method.js')
  })

  it('preserves the default object structure', function () {
    testFile('riotjs.object.js')
  })

  it('keeps try/catch as is #768', function () {
    testFile('riotjs.try-catch.js')
  })

  it('preserves non es6 methods #1043', function () {
    testFile('riotjs.getter-setter.js')
  })

})
