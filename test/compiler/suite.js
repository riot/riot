
require('shelljs/global')

var compiler = require('../../lib/server/compiler'),
    expect = require('expect.js')

describe('All the tags get compiler as expected', function() {


  it('test html', function() {

    function test(str, resStr) {
      expect(compiler.html(str, {})).to.be(resStr)
    }

    function testParser(str, resStr) {
      expect(compiler.html(str, { parser: parser, expr: true })).to.be(resStr)
    }

    // custom javscript parser
    function parser(str) {
      return '@' + str
    }

    test('<p/>', '<p></p>')
    test('<a a={ a }>', '<a a="{ a }">')
    test("<a a='{ a }'>", '<a a="{ a }">')
    test('<a a={ a } b={ b }>', '<a a="{ a }" b="{ b }">')
    test('<a href="a?b={ c }">', '<a href="a?b={ c }">')
    test('<a id="{ a }b">', '<a id="{ a }b">')
    test('<input id={ a }/>', '<input id="{ a }">')
    test('<a id={ a }/>', '<a id="{ a }"></a>')
    test('<a><b/></a>', '<a><b></b></a>')

    test('{ a }<!-- c -->', '{ a }')
    test('<!-- c -->{ a }', '{ a }')
    test('<!-- c -->{ a }<!-- c --><p/><!-- c -->', '{ a }<p></p>')
    test('<a loop={ a } defer="{ b }" visible>', '<a __loop="{ a }" __defer="{ b }" visible>')

    test('{ "a" }', '{ \"a\" }')
    test('\\{ a \\}', '\\\\{ a \\\\}')

    testParser('<a href={ a }>', '<a href="{@a}">')
    testParser('<a>{ b }</a>', '<a>{@b}</a>')

  })

  it('test files', function() {

    this.timeout(10000)

    function test(name, opts) {

      var type = opts.type,
          dir = 'test/compiler',
          basename = name + (type ? '.' + type : ''),
          src = cat(dir + '/' + basename + '.tag'),
          should = cat(dir + '/js/' + basename + '.js')

      expect(compiler.compile(src, opts).trim()).to.be(should)
    }


    test('complex', {})
    test('test', { type: 'coffee', expr: true })
    test('test', { type: 'es6' })
    test('test.jade', { template: 'jade' })
    test('slide.jade', { template: 'jade' })
    test('style', {})
    test('brackets', { brackets: '${ }' })
  })
})





