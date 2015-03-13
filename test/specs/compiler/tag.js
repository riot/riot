var fs = require('fs'),
    path = require('path')

describe('Compile Tag', function() {

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

  describe('compiles all files in `test/tag` dir', function() {
    var tagDir = path.join(__dirname, '..', '..', 'tag')
    fs.readdirSync(tagDir).map(function(filename) {

      it('tag/' + filename, function() {
        var src = fs.readFileSync(path.join(tagDir, filename)).toString()
        expect(render(src)).to.equal(cat('expect/tag', filename.replace(/\.tag$/, '.js')))
      })
    })
  })


  it('Mixed JS and Tags', function() {
    testFile('mixed-js')
  })

  it.only('Tag definition and usage on same file', function() {
    testFile('same')
  })

})
