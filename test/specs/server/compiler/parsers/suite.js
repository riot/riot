//
// Parsers Suite
//
/*eslint-env node, mocha */
var
  path = require('path'),
  fs = require('fs')
var
  basedir = __dirname,
  compiler = require('riot-compiler'),
  jsdir = path.join(basedir, 'js')

function have(mod, req) {
  if (compiler.parsers._req(mod, req))
    return true
  console.error('\tnot installed locally: ' + (req || mod) + ' alias "' + mod + '"')
  return false
}

function cat(dir, filename) {
  return fs.readFileSync(path.join(dir, filename), 'utf8')
}

function normalize(str) {
  var
    n = str.search(/[^\n]/)
  if (n < 0) return ''
  if (n > 0) str = str.slice(n)
  n = str.search(/\n+$/)
  return ~n ? str.slice(0, n) : str
}

function testParser(name, opts) {
  var
    file = name + (opts.type ? '.' + opts.type : ''),
    str1 = cat(basedir, file + '.tag'),
    str2 = cat(jsdir, file + '.js')

  expect(normalize(compiler.compile(str1, opts || {}))).to.be(normalize(str2))
}

describe('HTML parsers', function () {

  this.timeout(12000)

  function testStr(str, resStr, opts) {
    expect(compiler.html(str, opts || {})).to.be(resStr)
  }

  // test.jade.tag & slide.jade.tag
  it('jade', function () {
    if (have('jade') && have('coffee')) {
      testParser('test.jade', { template: 'jade' })
      testParser('slide.jade', { template: 'jade' })
    }
  })

  describe('Custom parser in expressions', function () {
    var opts = {
      parser: function (str) { return '@' + str },
      expr: true
    }

    it('don\'t touch format before run parser, compact & trim after (2.3.0)', function () {
      testStr('<a href={\na\r\n}>', '<a href="{@ a}">', opts)
      testStr('<a>{\tb\n }</a>', '<a>{@\tb}</a>', opts)
    })

    it('plays with the custom parser', function () {
      testStr('<a href={a}>', '<a href="{@a}">', opts)
      testStr('<a>{ b }</a>', '<a>{@ b}</a>', opts)
    })

    /*
    it('plays with quoted values', function () {
      testStr('<a href={ "a" }>', '<a href="{@ "a"}">', opts)
      testStr('<a>{"b"}</a>', '<a>{@"b"}</a>', opts)
    })
    */

    it('remove the last semi-colon', function () {
      testStr('<a href={ a; }>', '<a href="{@ a}">', opts)
      testStr('<a>{ b ;}</a>', '<a>{@ b}</a>', opts)
    })

    it('prefixing the expression with "^" prevents the parser (2.3.0)', function () {
      testStr('<a href={^ a }>', '<a href="{a}">', opts)
      testStr('<a>{^ b }</a>', '<a>{b}</a>', opts)
    })

  })

})


describe('JavaScript parsers', function () {

  this.timeout(20000) // first call to babel-core is slooooow!

  // complex.tag
  it('complex tag structure', function () {
    if (have('none')) {   // testing none, for coverage too
      testParser('complex', {})
    }
    else expect().fail('parsers.js must have a "none" property')
  })

  // testParser.tag
  it('javascript (root container)', function () {
    testParser('test', { expr: true })
  })

  // testParser-alt.tag
  it('javascript (comment hack)', function () {
    testParser('test-alt', { expr: true })
  })

  it('mixed riotjs and javascript types', function () {
    if (have('javascript')) {   // for js, for coverage too
      testParser('mixed-js', {})
    }
    else expect().fail('parsers.js must have a "javascript" property')
  })

  // testParser.coffee.tag
  it('coffeescript', function () {
    if (have('coffee')) {
      testParser('test', { type: 'coffee', expr: true })
    }
  })

  // testParser.livescript.tag
  it('livescript', function () {
    if (have('livescript')) {
      testParser('test', { type: 'livescript' })
    }
  })

  // testParser.livescript.tag
  it('typescript', function () {
    if (have('typescript')) {
      testParser('test', { type: 'typescript' })
    }
  })

  // testParser.es6.tag
  it('es6 (for babel 5.8.x)', function () {
    if (have('es6')) {
      testParser('test', { type: 'es6' })
    }
  })

  // testParser.es6.tag
  /* not working
  it('new css.babel parser (babel-core 6.0.2+)', function () {
    if (have('babel')) {
      testParser('test', { type: 'babel' })
    }
  })*/

  // testParser-attr.es6.tag
  /* grrr!!! is adding "use strict" in travis, but not in my local copy!!
  it('babel with shorthands (fix #1090)', function () {
    if (have('babel')) {
      testParser('test-attr', { type: 'babel', expr: true })
    }
  })*/

})


describe('Style parsers', function () {

  this.timeout(12000)

  function _sass(tag, css) {
    return '' + compiler.parsers._req('sass').renderSync({
      data: css,
      indentedSyntax: true,
      omitSourceMapUrl: true,
      outputStyle: 'compact' }).css
  }

  // style.tag
  it('default style', function () {
    testParser('style', {})
  })

  // style.escoped.tag
  it('scoped styles', function () {
    testParser('style.scoped', {})
  })

  // stylus.tag
  it('stylus', function () {
    if (have('stylus')) {
      testParser('stylus', {})
    }
  })

  // sass.tag
  it('sass, indented 2, margin 0 (custom parser)', function () {
    if (have('sass', 'node-sass')) {
      compiler.parsers.css.sass = _sass
      testParser('sass', {})
    }
  })

  it('Mixing CSS blocks with different type', function () {
    testParser('mixed-css', {})
  })

})

describe('Other', function () {

  it('Unknown HTML template parser throws an error', function () {
    var
      str1 = cat(basedir, 'test.tag')

    expect(compiler.compile).withArgs(str1, {template: 'unknown'}).to.throwError()
  })

  it('Unknown JS & CSS parsers throws an error', function () {
    var
      str1 = cat(basedir, 'test.tag'),
      str2 = [
        '<error>',
        "<style type='unknown'>p{top:0}</style>",
        '</error>'
      ].join('\n')

    expect(compiler.compile).withArgs(str1, {type: 'unknown'}).to.throwError()
    expect(compiler.compile).withArgs(str2).to.throwError()
  })

  // brackets.tag
  it('using different brackets', function () {
    testParser('brackets', { brackets: '${ }' })
  })

})
