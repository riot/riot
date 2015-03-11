var fs = require('fs'),
    path = require('path')

describe('Compile Tag', function() {

  function render(str) {
    return compiler.compile(str, {})
  }

  function cat(dir, filename) {
    return fs.readFileSync(path.join(__dirname, dir, filename)).toString()
  }

  function tag2js(filename) {
    return filename.replace(/\.tag$/, '.js')
  }

  it('changes brackets', function() {
    riot.settings.brackets = '${ }' // set custom brackets
    var file = 'brackets.tag'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', tag2js(file)))
    riot.settings.brackets = '' // set back to default
  })

  it('allows single line custom tag', function() {
    expect(render('<my-tag><p>TEST</p></my-tag>'))
        .to.equal('riot.tag(\'my-tag\', \'<p>TEST</p>\', function(opts) {\n});')
    expect(render('<my-tag>TEST</my-tag>'))
        .to.equal('riot.tag(\'my-tag\', \'TEST\', function(opts) {\n});')
  })

  it('style scoped', function() {
    var file = 'style-scoped.tag'
    expect(render(cat('fixtures', file))).to.equal(cat('expect', tag2js(file)))
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
