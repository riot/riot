var fs = require('fs'),
    path = require('path')

describe('Compile Tag', function() {

  function render(str) {
    return compiler.compile(str, {})
  }

  function cat(dir, filename) {
    return fs.readFileSync(path.join(__dirname, dir, filename)).toString()
  }

  it('changes brackets', function() {
    riot.settings.brackets = '${ }' // set custom brackets
    var file = 'brackets.tag'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', file.replace(/\.tag$/, '.js')))
    riot.settings.brackets = '' // set back to default
  })

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
