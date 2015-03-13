var fs = require('fs'),
    path = require('path')

describe('Compile tags', function() {

  function render(str) {
    return compiler.compile(str, {})
  }

  function cat(dir, filename) {
    return fs.readFileSync(path.join(__dirname, dir, filename)).toString()
  }

  function testFile(name, debug) {
    var src = cat('fixtures', name + '.tag'),
        js = render(src)

    if (debug) console.info(js)
    expect(js).to.equal(cat('expect', name + '.js'))
  }

  it('Timetable tag', function() {
    testFile('timetable')
  })

  it('Mixed JS and Tags', function() {
    testFile('mixed-js')
  })

  it('Tag definition and usage on same file', function() {
    testFile('same')
  })

  it('Quotes before ending HTML bracket', function() {
    testFile('input-last')
  })

})
