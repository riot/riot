describe('Compile HTML', function() {

  function render(str) {
    return compiler.html(str, {})
  }

  it('compiles void tag into separated: <x/> -> <x></x>', function() {
    expect(render('<p/>')).to.equal('<p></p>')
    expect(render('<a><b/></a>')).to.equal('<a><b></b></a>')
    expect(render('<my-tag value={ test }/>')).to.equal('<my-tag value="{ test }"></my-tag>')
  })
  it('adds prefix `riot-` to some attributes', function() {
    expect(render('<img src={ a }>')).to.equal('<img riot-src="{ a }">')
  })
  it('adds prefix __ to the BOOL_ATTR', function() {
    expect(render('<a loop={ a } defer="{ b }" visible>')).to.equal('<a __loop="{ a }" __defer="{ b }" visible>')
  })
  it('adds double quot to the value of attr', function() {
    expect(render('<a a={ a }>')).to.equal('<a a="{ a }">')
    expect(render("<a a='{ a }'>")).to.equal('<a a="{ a }">')
    expect(render('<a a={ a } b={ b }>')).to.equal('<a a="{ a }" b="{ b }">')
    expect(render('<a id={ a }/>')).to.equal('<a id="{ a }"></a>')
    expect(render('<input id={ a }/>')).to.equal('<input id="{ a }">')
  })
  it('keeps interpolations', function() {
    expect(render('<a href="a?b={ c }">')).to.equal('<a href="a?b={ c }">')
    expect(render('<a id="{ a }b">')).to.equal('<a id="{ a }b">')
  })
  it('skips HTML comments', function() {
    expect(render('{ a }<!-- c -->')).to.equal('{ a }')
    expect(render('<!-- c -->{ a }')).to.equal('{ a }')
    expect(render('<!-- c -->{ a }<!-- c --><p/><!-- c -->')).to.equal('{ a }<p></p>')
  })
  it('escapes some characters', function() {
    expect(render('{ "a" }')).to.equal('{ \"a\" }')
    expect(render('\\{ a \\}')).to.equal('\\\\{ a \\\\}')
  })

  // custom parser in expressions
  function parser(str) { return '@' + str }
  function testParser(str, resStr) {
    expect(compiler.html(str, { parser: parser, expr: true })).to.equal(resStr)
  }

  it('plays with the custom parser', function() {
    testParser('<a href={ a }>', '<a href="{@a}">')
    testParser('<a>{ b }</a>', '<a>{@b}</a>')
  })

})
