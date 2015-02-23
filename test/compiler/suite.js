
// node ./test/compiler/suite.js

require('shelljs/global')

// global.riot = {settings: { brackets: '{ }' } }

var compiler = require('../../lib/compiler')

function assert(str, resStr) {
  if (str === resStr) console.info('OK', str.replace(/\n/g, '').trim())
  else throw new Error(str + ' != ' + resStr)
}

// custom javscript parser
function parser(str) {
  return '@' + str
}

function testHTML() {

  function test(str, resStr) {
    assert(compiler.html(str, {}), resStr)
  }

  function testParser(str, resStr) {
    assert(compiler.html(str, { parser: parser, expr: true }), resStr)
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

}


function testFiles(opts) {

  function test(name, opts) {

    var type = opts.type,
        dir = 'test/compiler',
        basename = name + (type ? '.' + type : ''),
        src = cat(dir + '/' + basename + '.tag'),
        should = cat(dir + '/js/' + basename + '.js')

    assert(compiler.compile(src, opts).trim(), should)
  }


  test('complex', {})
  test('test', { type: 'cs', expr: true })
  test('test', { type: 'es6' })
  test('test.jade', { template: 'jade' })
  test('slide.jade', { template: 'jade' })
  test('style', {})
  test('brackets', { brackets: '${ }' })

}

testHTML()
testFiles()

