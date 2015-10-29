//
// Parsers Suite
//
/*eslint-env node, mocha */
var
  compiler = require('../../lib/server/compiler'),
  expect = require('expect.js'),
  path = require('path'),
  fs = require('fs')

describe('All the tags get compiler as expected', function() {
  var
    basedir = __dirname,
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


  describe('test html', function() {

    function render(str, opts) {
      return compiler.html(str, opts || {})
    }

    function testStr(str1, str2, opts) {
      expect(render(str1, opts)).to.be(str2)
    }

    it('compiles void tag into separated: <x/> -> <x></x>', function() {
      testStr('<p/>', '<p></p>')
      testStr('<a><b/></a>', '<a><b></b></a>')
      testStr('<my-tag value={ test }/>', '<my-tag value="{test}"></my-tag>')
    })

    it('adds the prefix `riot-` to some attributes', function() {
      testStr('<img src={ a }>', '<img riot-src="{a}">')
      testStr('<p style="left:0; top={ n }">', '<p riot-style="left:0; top={n}">')
    })

    it('adds the prefix `__` to boolean attributes with expressions', function() {
      testStr('<a disabled={ a } nowrap="{ b }">', '<a __disabled="{a}" __nowrap="{b}">')
      testStr('<a disabled readonly={}>', '<a disabled __readonly="{}">')
      testStr('<a readonly=readonly autofocus={1}>', '<a readonly="readonly" __autofocus="{1}">')
    })

    it('adds double quotes to the attribute value', function() {
      testStr('<a a={ a }>', '<a a="{a}">')
      testStr("<a a='{ a }'>", '<a a="{a}">')
      testStr('<a a={ a } b={ b }>', '<a a="{a}" b="{b}">')
      testStr('<a id={ a }/>', '<a id="{a}"></a>')
      testStr('<input id={ a }/>', '<input id="{a}">')
    })

    it('keeps interpolations', function() {
      testStr('<a href="a?b={ c }">', '<a href="a?b={c}">')
      testStr('<a id="{ a }b">', '<a id="{a}b">')
    })

    it('skips HTML comments', function() {
      testStr('{ a }<!-- c -->', '{a}')
      testStr('<!-- c -->{ a }', '{a}')
      testStr('<!-- c -->{ a }<!-- c --><p/><!-- c -->', '{a}<p></p>')
    })

    it('option `whitespace` normalizes and preserves line endings', function() {
      testStr('<p>a\r</p>\r\r\n<p>\n</p>', '<p>a\\n</p>\\n\\n<p>\\n</p>', { whitespace: 1 })
    })

    it('option `compact` removes line endings between tags', function() {
      testStr('<p>a\r</p>\r\r\n<p>\n</p>', '<p>a </p><p></p>', { compact: 1 })
    })

    describe('2.3.0', function () {

      it('fix #827 to input type=number', function () {
        testStr('<input type=number>', '<input type="{\'number\'}">')
      })

      it('normalizes attributes, all values in double quotes', function () {
        testStr('<a a={a} b=number c =\'x\'>', '<a a="{a}" b="number" c="x">')
      })

      it('lf/cr in attribute values are compacted to space', function () {
        testStr("<p\r\n a\t= ' {a}' b='{b}\n'\n\n>", '<p a=" {a}" b="{b} ">')
        testStr("<p\ta ='p:{}\r\n;'>", '<p a="p:{} ;">')
      })

      it('double quotes in expressions are converted to `&quot;`', function () {
        testStr('<p x={ "a" } y="{2}">', '<p x="{&quot;a&quot;}" y="{2}">')
        testStr('<p x="{"a"}" y="{2}">', '<p x="{&quot;a&quot;}" y="{2}">')
        testStr('<p x=\'{"a"}\' y="{2}">', '<p x="{&quot;a&quot;}" y="{2}">')
        testStr('<p x="{""}">', '<p x="{&quot;&quot;}">')
      })

      it('single quotes in expressions are escaped', function () {
        testStr("<p x={ 'a' } y='{2}'>", '<p x="{\'a\'}" y="{2}">')
        testStr("<p x='{'a'}' y='{2}'>", '<p x="{\'a\'}" y="{2}">')
        testStr("<p x=\"{'a'}\" y='{2}'>", '<p x="{\'a\'}" y="{2}">')
        testStr("<p x='{''}'>", '<p x="{\'\'}">')
      })

      it('preserves `<` and `>` operators in expressions', function () {
        testStr('<p x={ a>b }></p>', '<p x="{a>b}"></p>')
        testStr('<p x={ a<b }></p>', '<p x="{a<b}"></p>')
      })

      // compile.html must preserve escaped brackets
      it('preserves escaped riot brackets', function() {
        testStr('\\{ a }', '\\{ a }')
        testStr(' \\{ a \\}', '\\{ a \\}')   // trim is ok
        testStr('<a a="\\{ a \\}">', '<a a="\\{ a \\}">')
        testStr('<p>\\{}</p>', '<p>\\{}</p>')
      })

      /*
        don't needed in version for non precompiled expressions
      it('escape internal brackets (only `{` is nedeed)', function() {
        testStr('<p>\\{</p>}<p>', '<p>\\{</p>}<p>')
        testStr('<p x="\\{}"></p>', '<p x="\\{}"></p>')
        testStr('<p x="\\{}"></p>', '<p x="\\{}"></p>')
        testStr('<p>\\{ a }</p>', '<p>\\{ a }</p>')
      })
      */

      it('removed enumerated/unuseful attributes from the boolean list', function () {
        var att = [
          'async', 'defer', 'defaultchecked', 'defaultmuted', 'defaultselected',
          'draggable', 'spellcheck', 'translate', 'declare', 'indeterminate',
          'pauseonexit', 'enabled', 'visible'
        ]
        for (var i = 0; i < att.length; ++i) {
          testStr('<p ' + att[i] + '={}>', '<p ' + att[i] + '="{}">')
        }
      })

    })

  })

  describe('Scoped CSS', function() {

    function render(str, parser) {
      return compiler.style(str, 'my-tag', parser || 'scoped-css')
    }

    it('add my-tag to the simple selector', function() {
      expect(render('h1 { font-size: 150% }'))
          .to.equal('my-tag h1,[riot-tag="my-tag"] h1 { font-size: 150% }')
    })
    it('add my-tag to the multi selector in a line', function() {
      expect(render('h1 { font-size: 150% } #id { color: #f00 }'))
          .to.equal('my-tag h1,[riot-tag="my-tag"] h1 { font-size: 150% } my-tag #id,[riot-tag="my-tag"] #id { color: #f00 }')
    })
    it('add my-tag to the complex selector', function() {
      expect(render('header a.button:hover { text-decoration: none }'))
          .to.equal('my-tag header a.button:hover,[riot-tag="my-tag"] header a.button:hover { text-decoration: none }')
    })
    it('add my-tag to the comma-separated selector', function() {
      expect(render('h2, h3 { border-bottom: 1px solid #000 }'))
          .to.equal('my-tag h2,[riot-tag="my-tag"] h2,my-tag h3,[riot-tag="my-tag"] h3 { border-bottom: 1px solid #000 }')
    })
    it('add my-tag to the attribute selector', function() {
      expect(render('i[class=twitter] { background: #55ACEE }'))
          .to.equal('my-tag i[class=twitter],[riot-tag="my-tag"] i[class=twitter] { background: #55ACEE }')
    })
    it('add my-tag to the selector with a backslash', function() {
      expect(render('a:after { content: "*" }'))
          .to.equal('my-tag a:after,[riot-tag="my-tag"] a:after { content: "*" }')
    })
    it('add my-tag to the selector with multi-line definitions', function() {
      expect(render('header {\n  text-align: center;\n  background: rgba(0,0,0,.2);\n}'))
          .to.equal('my-tag header,[riot-tag="my-tag"] header { text-align: center; background: rgba(0,0,0,.2); }')
    })
    it('add my-tag to the root selector', function() {
      expect(render(':scope { display: block }'))
          .to.equal('my-tag,[riot-tag="my-tag"] { display: block }')
    })
    it('add my-tag to the nested root selector', function() {
      expect(render(':scope > ul { padding: 0 }'))
          .to.equal('my-tag > ul,[riot-tag="my-tag"] > ul { padding: 0 }')
    })
    it('add my-tag to the root selector with attr', function() {
      expect(render(':scope[disabled] { color: gray }'))
          .to.equal('my-tag[disabled],[riot-tag="my-tag"][disabled] { color: gray }')
    })
    it('add my-tag to the root selector with class', function() {
      expect(render(':scope.great { color: gray }'))
          .to.equal('my-tag.great,[riot-tag="my-tag"].great { color: gray }')
    })
    it('not add my-tag to @font-face', function() {
      expect(render('@font-face { font-family: "FontAwesome" }'))
          .to.equal('@font-face { font-family: "FontAwesome" }')
    })
    it('not add my-tag to @media, and add it to the selector inside', function() {
      expect(render('@media (min-width: 500px) {\n  header {\n    text-align: left;\n  }\n}'))
          .to.equal('@media (min-width: 500px) { my-tag header,[riot-tag="my-tag"] header { text-align: left; } }')
    })
    it('not add my-tag to "from" and "to" in @keyframes', function() {
      expect(render('@keyframes fade { from { opacity: 1; } to { opacity: 0; } }'))
          .to.equal('@keyframes fade { from { opacity: 1; } to { opacity: 0; } }')
    })
    it('not add my-tag to parsentage values in @keyframes', function() {
      expect(render('@keyframes fade { 10% { opacity: 1; } 85% { opacity: 0; } }'))
          .to.equal('@keyframes fade { 10% { opacity: 1; } 85% { opacity: 0; } }')
    })

    it('use a custom css parser to render the css', function() {
      compiler.parsers.css.myParser = function(tag, css) {
        return css.replace(/@tag/, tag)
      }
      expect(render('@tag { color: red }', 'myParser'))
          .to.equal('my-tag { color: red }')
    })

  })

  describe('HTML parsers', function () {

    this.timeout(10000)

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

      it('plays with quoted values', function () {
        testStr('<a href={ "a" }>', '<a href="{@ &quot;a&quot;}">', opts)
        testStr('<a>{"b"}</a>', '<a>{@&quot;b&quot;}</a>', opts)
      })

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

    this.timeout(10000)

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
    it('es6 (babel-core or babel)', function () {
      if (have('es6')) {
        testParser('test', { type: 'es6' })
      }
    })

    // testParser-attr.es6.tag
    it('es6 with shorthands (fix #1090)', function () {
      if (have('babel')) {
        testParser('test-attr', { type: 'es6', expr: true })
      }
    })

  })


  describe('Style parsers', function () {

    this.timeout(10000)

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

})
