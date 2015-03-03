var fs = require('fs'),
    path = require('path')

describe('Compile Tag', function() {

  function render(str) {
    return compiler.compile(str, {})
  }

  function cat(dir, filename) {
    return fs.readFileSync(path.join(__dirname, dir, filename)).toString()
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

})
