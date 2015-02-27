describe('Compiler CLI', function() {

  function parser(str) {
    return '@' + str
  }
  function render(str, resStr) {
    return compiler.html(str, {})
  }
  // custom javscript parser
  function testParser(str, resStr) {
    expect(compiler.html(str, { parser: parser, expr: true })).to.equal(resStr)
  }

  it('strings', function() {

    expect(render('<p/>')).to.equal('<p></p>')
    expect(render('<img src={ a }>')).to.equal('<img riot-src="{ a }">')
    expect(render('<a a={ a }>')).to.equal('<a a="{ a }">')
    expect(render("<a a='{ a }'>")).to.equal('<a a="{ a }">')
    expect(render('<a a={ a } b={ b }>')).to.equal('<a a="{ a }" b="{ b }">')
    expect(render('<a href="a?b={ c }">')).to.equal('<a href="a?b={ c }">')
    expect(render('<a id="{ a }b">')).to.equal('<a id="{ a }b">')
    expect(render('<input id={ a }/>')).to.equal('<input id="{ a }">')
    expect(render('<a id={ a }/>')).to.equal('<a id="{ a }"></a>')
    expect(render('<a><b/></a>')).to.equal('<a><b></b></a>')

    expect(render('<a loop={ a } defer="{ b }" visible>')).to.equal('<a __loop="{ a }" __defer="{ b }" visible>')

    expect(render('{ a }<!-- c -->')).to.equal('{ a }')
    expect(render('<!-- c -->{ a }')).to.equal('{ a }')
    expect(render('<!-- c -->{ a }<!-- c --><p/><!-- c -->')).to.equal('{ a }<p></p>')

    expect(render('{ "a" }')).to.equal('{ \"a\" }')
    expect(render('\\{ a \\}')).to.equal('\\\\{ a \\\\}')

    testParser('<a href={ a }>', '<a href="{@a}">')
    testParser('<a>{ b }</a>', '<a>{@b}</a>')

  })
/*

  TODO: fix these tests
  // they depend on the dependecies installed on the local machine

  it('files', function() {

    function test (name, opts) {

      var type = opts.type,
          dir = 'test/compiler',
          basename = name + (type ? '.' + type : ''),
          src = cat(dir + '/' + basename + '.tag'),
          should = cat(dir + '/js/' + basename + '.js')

      expect(compiler.compile(src, opts).trim()).to.be.equal(should)

    }

    test('complex', {})
    test('test', { type: 'cs', expr: true })
    test('test', { type: 'es6' })
    test('test.jade', { template: 'jade' })
    test('slide.jade', { template: 'jade' })
    test('style', {})
    test('brackets', { brackets: '${ }' })

  })
*/
})
