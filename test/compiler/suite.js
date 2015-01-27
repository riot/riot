
var compiler = require('../../compiler/compiler')

function assert(test, should) {
  if (test === should) console.info('OK', test)
  else throw new Error(test + ' != ' + should)
}

// custom javscript parser
function parser(str) {
  return '@' + str
}

function testHTML() {

  function test(test, should) {
    assert(compiler.html(test, {}), should)
  }

  function testParser(test, should) {
    assert(compiler.html(test, { parser: parser, expr: true }), should)
  }

  test('<p/>', '<p></p>')
  test('<a a={ a }>', '<a a="{ a }">')
  test("<a a='{ a }'>", '<a a="{ a }">')
  test('<a a={ a } b={ b }>', '<a a="{ a }" b="{ b }">')
  test('<a href="a?b={ c }">', '<a href="a?b={ c }">')
  test('<a id="{ a }b">', '<a id="{ a }b">')
  test('<a loop={ a } defer="{ b }" visible>', '<a __loop="{ a }" __defer="{ b }" visible>')

  test('{ a }<!-- c -->', '{ a }')
  test('<!-- c -->{ a }', '{ a }')
  test('<!-- c -->{ a }<!-- c --><p/><!-- c -->', '{ a }<p></p>')

  test("{ 'a' }", "{ \\'a\\' }")
  test("\\{ a \\}", "\\\\{ a \\\\}")

  testParser('<a href={ a }>', '<a href="{@a}">')
  testParser('<a>{ b }</a>', '<a>{@b}</a>')

}

testHTML()