describe('Tmpl', function() {

  var tmpl = riot.util.tmpl,
      data = {
        yes: true,
        no: false,
        str: 'x',
        obj: {val: 2},
        arr: [2],
        x: 2,
        $a: 0,
        $b: 1,
        esc: '\'\n\\',
        fn: function(s) { return ['hi', s].join(' ') }
      },
      render = function (str) {
        return tmpl(str, data)
      }

  globalVar = 5

  it('compiles specs', function() {

    this.timeout(5000)
    //// return values

    // expressions always return a raw value
    expect(render('{ 1 }')).to.equal(1)
    expect(render('{ x }')).to.equal(2)
    expect(render('{ str }')).to.equal(data.str)
    expect(render('{ obj }')).to.equal(data.obj)
    expect(render('{ arr }')).to.equal(data.arr)
    expect(render('{ fn }')).to.equal(data.fn)
    expect(render('{ null }')).to.equal(null)
    expect(render('{ no }')).to.equal(false)
    expect(render('{ yes }')).to.equal(true)

    // templates always return a string value
    expect(render('{ 1 } ')).to.equal('1 ')
    expect(render('{ obj } ')).to.equal('[object Object] ')


    //// empty arguments

    // empty expressions equal to undefined
    expect(render()).to.be(undefined)
    expect(render('{}')).to.be(undefined)
    expect(render('{ }')).to.be(undefined)

    // empty templates equal to empty string
    expect(render('')).to.equal('')
    expect(render('{ } ')).to.equal(' ')


    //// undefined values

    // ignore undefined value errors in expressions (catch the error, and set value to undefined)
    expect(render('{ nonExistingVar }')).to.be(undefined)
    expect(render('{ !nonExistingVar }')).to.equal(true)
    expect(render('{ nonExistingVar ? "yes" : "no" }')).to.equal('no')
    expect(render('{ !nonExistingVar ? "yes" : "no" }')).to.equal('yes')

    // in templates, false and undefined values result in empty string
    expect(render(' { nonExistingVar }')).to.equal(' ')
    expect(render(' { no }')).to.equal(' ')


    //// expressions

    // expressions are just JavaScript
    expect(render('{ obj.val }')).to.equal(2)
    expect(render('{ obj["val"] }')).to.equal(2)
    expect(render('{ arr[0] }')).to.equal(2)
    expect(render('{ arr[0]; }')).to.equal(2)
    expect(render('{ arr.pop() }')).to.equal(2)
    expect(render('{ fn(str) }')).to.equal('hi x')
    expect(render('{ yes && "ok" }')).to.equal('ok')
    expect(render('{ no && "ok" }')).to.equal(false)
    expect(render('{ false || null || !no && yes }')).to.equal(true)
    expect(render('{ !no ? "yes" : "no" }')).to.equal('yes')
    expect(render('{ !yes ? "yes" : "no" }')).to.equal('no')
    expect(render('{ /^14/.test(+new Date()) }')).to.equal(true)
    expect(render('{ typeof Math.random() }')).to.equal('number')
    expect(render('{ fn("there") }')).to.equal('hi there')
    expect(render('{ str == "x" }')).to.equal(true)
    expect(render('{ /x/.test(str) }')).to.equal(true)
    expect(render('{ true ? "a b c" : "foo" }')).to.equal('a b c')
    expect(render('{ true ? "a \\"b\\" c" : "foo" }')).to.equal('a "b" c')
    expect(render('{ str + " y" + \' z\'}')).to.equal('x y z')
    expect(render('{ esc }')).to.equal(data.esc)
    expect(render('{ $a }')).to.equal(0)
    expect(render('{ $a + $b }')).to.equal(1)
    expect(render('{ this.str }')).to.equal('x')

    // global vars are supported in expressions
    expect(render('{ globalVar }')).to.equal(globalVar)

    // all comments in expressions are stripped from the output
    expect(render('{ /* comment */ /* as*/ }')).to.be(undefined)
    expect(render(' { /* comment */ }')).to.equal(' ')
    expect(render('{ 1 /* comment */ + 1 }')).to.equal(2)
    expect(render('{ 1 /* comment */ + 1 } ')).to.equal('2 ')


    //// templates

    // all expressions are evaluted in template
    expect(render('{ 1 }{ 1 }')).to.equal('11')
    expect(render('{ 1 }{ 1 } ')).to.equal('11 ')
    expect(render(' { 1 }{ 1 }')).to.equal(' 11')
    expect(render('{ 1 } { 1 }')).to.equal('1 1')

    // both templates and expressions are new-line-friendly
    expect(render('\n  { yes \n ? 2 \n : 4} \n')).to.equal('\n  2 \n')


    //// class shorthand

    // names can be single-quoted, double-quoted, unquoted
    expect(render('{ ok : yes }')).to.equal('ok')
    expect(render('{ "a" : yes, \'b\': yes, c: yes }')).to.equal('a b c')
    expect(render('{ a_b-c3: yes }')).to.equal('a_b-c3')

    // even dashed names can be unquoted
    expect(render('{ my-class: yes }')).to.equal('my-class')

    // set two classes with one expression
    expect(render('{ "a b": yes }')).to.equal('a b')

    // errors in expressions are silently catched allowing shorter expressions
//  expect(render('{ loading: !nonExistingVar.length }')).to.equal('loading')   //@not compatible
    expect(render('{ loading: !nonExistingVar.length }')).to.equal('')

    // expressions are just regular JavaScript
    expect(render('{ a: !no, b: yes }')).to.equal('a b')
    expect(render('{ y: false || null || !no && yes }')).to.equal('y')
    expect(render('{ y: 4 > 2 }')).to.equal('y')
    expect(render('{ y: fn() }')).to.equal('y')
    expect(render('{ y: str == "x" }')).to.equal('y')
    expect(render('{ y: new Date() }')).to.equal('y')

    // even function calls, objects and arrays are no problem
    expect(render('{ ok: fn(1, 2) }')).to.equal('ok')
    expect(render('{ ok: fn([1, 2]) }')).to.equal('ok')
    expect(render('{ ok: fn({a: 1, b: 1}) }')).to.equal('ok')


    //// custom brackets

    // single character brackets
    riot.settings.brackets = '[ ]'
    expect(render('[ x ]')).to.equal(2)
    expect(render('[ str\\[0\\] ]')).to.equal('x')

    // multi character brackets
    riot.settings.brackets = '<% %>'
    expect(render('<% x %>')).to.equal(2)

    // asymmetric brackets
    riot.settings.brackets = '${ }'
    expect(render('${ x }')).to.equal(2)

    // default to { } if setting is empty
    riot.settings.brackets = null
    expect(render('{ x }')).to.equal(2)


    //// using brackets inside expressions

    // brackets in expressions can always be escaped
    expect(render('{ "\\{ 1 \\}" }')).to.equal('{ 1 }')
    expect(render('\\{ 1 }')).to.equal('{ 1 }')
    expect(render('{ "\\}" }')).to.equal('}')
    expect(render('{ "\\{" }')).to.equal('{')

    // though escaping is optional...
    expect(render('{ JSON.stringify({ x: 5 }) }')).to.equal('{"x":5}')
    expect(render('a{ "b{c}d" }e { "{f{f}}" } g')).to.equal('ab{c}de {f{f}} g')

    // for custom brackets as well:

    riot.settings.brackets = '[ ]'
    expect(render('a[ "b[c]d" ]e [ "[f[f]]" ] g')).to.equal('ab[c]de [f[f]] g')

    riot.settings.brackets = '{{ }}'
    expect(render('a{{ "b{{c}}d" }}e {{ "{f{{f}}}" }} g')).to.equal('ab{{c}}de {f{{f}}} g')

    riot.settings.brackets = '<% %>'
    expect(render('a<% "b<%c%>d" %>e <% "<%f<%f%>%>" %> g')).to.equal('ab<%c%>de <%f<%f%>%> g')

    riot.settings.brackets = null

    // ...unless you're doing something very special. escaping is still needed if:

    // - your inner brackets don't have matching closing/opening bracket, e.g. { "{" } instead of { "{ }" }
    expect(render('a{ "b\\{cd" }e')).to.equal('ab{cde')

    // - you're using asymmetric custom brackets, e.g.: ${ } instead of { }, [ ], {{ }}, <% %>
    riot.settings.brackets = '${ }'
    expect(render('a${ "b{c\\}d" }e')).to.equal('ab{c}de')
    riot.settings.brackets = null

  })

  it('compiles specs - 2015-07-16 tmpl update', function() {

    riot.settings.brackets = null

  //// Fewer errors in recognizing complex expressions, even in class shorthands.

    data.$a = 0
    data.$b = 0
    data.parent = { selectedId: 0 }

    // FIX #784 - The shorthand syntax for class names doesn't support parentheses
    expect(render('{ primary: (parent.selectedId === $a)  }')).to.be('primary')

    // a bit more of complexity. note: using the comma operator requires parentheses
    expect(render('{ ok: ($b++, ($a > 0) || ($b & 1)) }')).to.be('ok')

  //// Unprotected keywords `void`, `window` and `global`, in addition to `this`.

    globalVar = 5
    data.$a = 5
    expect(render('{' + (typeof window === 'object' ? 'window' : 'global') +'.globalVar }')).to.be(5)
    expect(render('{ this.$a }')).to.be(5)
    expect(render('{ void 0 }')).to.be(undefined)

    // without unprefixed global/window, default convertion to `new (D).Date()` throws here
    data.Date = '?'
    if (typeof window !== 'object')
      expect(render('{ +new global.Date() }')).to.be.a('number')
    else
      expect(render('{ +new window.Date() }')).to.be.a('number')

  //// Better recognition of nested brackets, escaping is almost unnecessary.

    // inner brackets don't need to be escaped
    expect(render('{{ str: "s" }}')).to.eql({ str: 's' })
    expect(render(' {{str: {}}}+{{}}')).to.be(' [object Object]+[object Object]')
    expect(render('{ "{}}" }')).to.be('{}}')

    // inner custom brackets
    riot.settings.brackets = '[ ]'
    expect(render('[ str[0] ]')).to.be('x')
    expect(render('[ [1].pop() ]')).to.be(1)
    expect(render('a,[["b", "c"]],d')).to.be('a,b,c,d')

    riot.settings.brackets = '<% %>'
    expect(render('<% "%><% %>" %>')).to.be('%><% %>')

    // multi character brackets
    riot.settings.brackets = '(( ))'
    expect(render('((({})))')).to.eql({})
    expect(render('(((("o"))))="o"')).to.be('o="o"')
    expect(render('((( ("o") )))="o"')).to.be('o="o"')

    // brackets inside strings, even unbalanced, are ignored
    riot.settings.brackets = null
    expect(render('a{ "b{cd" }e')).to.be('ab{cde')
    expect(render('a{ "b}cd" }e')).to.be('ab}cde')

    // asymmetric custom brackets
    riot.settings.brackets = '${ }'
    expect(render('a${ "b${c}d" }e')).to.be('ab${c}de')

    // silly brackets?
    riot.settings.brackets = '[ ]]'
    expect(render('a[ "[]]"]]b')).to.be('a[]]b')
    expect(render('[[[]]]]')).to.eql([[]])

    riot.settings.brackets = '( ))'
    expect(render('a( "b))" ))c')).to.be('ab))c')
    expect(render('a( (("bc))")) ))')).to.be('abc))')
    expect(render('a( ("(((b))") ))c')).to.be('a(((b))c')
    expect(render('a( ("b" + (")c" ))))')).to.be('ab)c')    // test skipBracketedPart()

    riot.settings.brackets = null

  //// Better recognition of literal regexps inside template and expressions.

    expect(render('{ /{}\\/\\n/.source }')).to.be('{}\\/\\n')
    expect(render('{ ok: /{}\\/\\n/.test("{}\\/\\n") }')).to.be('ok')

    // in quoted text, left bracket and backslashes need to be escaped!
    expect(render('str = "/\\{}\\\\/\\\\n/"')).to.be('str = "/{}\\/\\n/"')

    // handling quotes in regexp is not so complicated :)
    expect(render('{ /"\'/.source }')).to.be('"\'')
    expect(render('{ ok: /"\'/.test("\\\"\'") }')).to.be('ok')
    expect(render('str = "/\\\\\"\'/"')).to.be('str = "/\\\"\'/"')

    // no confusion with operators
    data.x = 2
    expect(render('{ 10 /x+10/ 1 }')).to.be(15)
    expect(render('{ x /2+x/ 1 }')).to.be(3)
    expect(render('{ x /2+"abc".search(/c/) }')).to.be(3)

    // in expressions, there's no ASI support
    expect(render('{ x\n /2+x/ 1 }')).to.be(3)

  //// Better recognition of comments, including empty ones.

    // comments within expresions are converted to spaces, in concordance with js specs
    expect(render('{ typeof/**/str === "string" }')).to.be(true)
    expect(render('{ 1+/* */+2 }')).to.be(3)

    // comments in template text is preserved
    expect(render(' /*/* *\/ /**/ ')).to.be(' /*/* *\/ /**/ ')
    expect(render('/*/* "note" /**/')).to.be('/*/* "note" /**/')

    // riot parse correctamente empty and exotic comments
    expect(render('{ /**/ }')).to.be(undefined)               // empty comment
    expect(render('{ /*/* *\/ /**/ }')).to.be(undefined)      // nested comment sequences

    // there's no problem in shorthands
    expect(render('{ ok: 0+ /*{no: 1}*/ 1 }')).to.be('ok')
    expect(render('{ ok: 1 /*, no: 1*/ }')).to.be('ok')
    expect(render('{ ok/**/: 1 }')).to.be('ok')

    // nor in the template text, comments inside strings are preserved
    expect(render('{ "/* ok */" }')).to.be('/* ok */')
    expect(render('{ "/*/* *\/ /**/" }')).to.be('/*/* *\/ /**/')
    expect(render('{ "/* \\"comment\\" */" }')).to.be('/* "comment" */')

  //// Support for full ISO-8859-1 charset in js var and class names
  /*
    expect(render('{ neón: 1 }')).to.be('neón')
    expect(render('{ -ä: 1 }')).to.be('-ä')                   // '-ä' is a valid class name
    expect(render('{ ä: 1 }')).to.be('ä')
    expect(render('{ (this["neón"] = 0, ++neón) }')).to.be(1)
    expect(render('{ (this["_ä"] = 1, _ä) }')).to.be(1)       // '-ä'' is not a var name
    expect(render('{ (this["ä"] = 1, ä) }')).to.be(1)
  */
    // but you can include almost anything in quoted names
    expect(render('{ "_\u221A": 1 }')).to.be('_\u221A')
    expect(render('{ (this["\u221A"] = 1, this["\u221A"]) }')).to.be(1)

  //// Mac/Win EOL's normalization avoids unexpected results with some editors.

    // win eols are normalized in template text
    expect(render('\r\n \n \r \n\r')).to.be('\n \n \n \n\n')
    expect(render('\r\n { 0 } \r\n')).to.be('\n 0 \n')

    // ...even in their quoted parts
    expect(render('style="\rtop:0\r\n"')).to.be('style="\ntop:0\n"')

    // whitespace are compacted in expressions (see generated code)
    expect(render(' { yes ?\n\t2 : 4} ')).to.be(' 2 ')
    expect(render('{ \t \nyes !== no\r\n }')).to.be(true)

    // ...but is preserved in js quoted strings
    expect(render('{ "\r\n \n \r" }')).to.be('\r\n \n \r')
    expect(render('{ ok: "\r\n".charCodeAt(0) === 13 }')).to.be('ok')

    // in shorthand names, whitespace will be compacted.
    expect(render('{ " \ta\n \r \r\nb\n ": yes }')).to.be('a b')

  //// Extra tests

    // correct handling of quotes
    expect(render('{ "House \\"Atrides\\" wins" }')).to.be('House "Atrides" wins')
    expect(render('{ "Leto\'s house" }')).to.be("Leto's house")
    expect(render(" In '{ \"Leto\\\\\\\'s house\" }' ")).to.be(" In 'Leto\\\'s house' ")  // « In '{ "Leto\\\'s house" }' » --> In 'Leto\'s house'
    expect(render(' In "{ "Leto\'s house" }" ')).to.be(' In "Leto\'s house" ')            // « In "{ "Leto's house" }"    » --> In "Leto's house"
    expect(render(' In "{ \'Leto\\\'s house\' }" ')).to.be(' In "Leto\'s house" ')        // « In "{ 'Leto\'s house' }"   » --> In "Leto's house"

  //// Consistency?

    // the main inconsistence between expressions and class shorthands
    expect(render('{ !nonExistingVar.foo ? "ok" : "" }')).to.equal(undefined) // ok
    expect(render('{ !nonExistingVar.foo ? "ok" : "" } ')).to.equal(' ')      // ok
  //expect(render('{ ok: !nonExistingVar.foo }')).to.equal('ok')              // what?
    expect(render('{ ok: !nonExistingVar.foo }')).to.equal('')                // ok ;)

  //// Custom brackets

    // brackets RegEx generation and info, discards /im, escape each char in regexp
    !(function testBrackets(brfn) {

      var vals = [
      // source     brackets(2) + brackets(3)
        ['<% %>',   '<% %>'    ],
        ['[! !]',   '\\[! !]'  ],
        ['·ʃ< ]]',  '·ʃ< ]]'   ],
        ['{$ $}',   '{\\$ \\$}'],
        ['${ }',    '\\${ }'   ],
        ['_( )_',   '_\\( \\)_']
      ]
      var rs, bb, i

      riot.settings.brackets = undefined  // use default brackets
      for (i = 0; i < 2; i++) {
        expect(brfn(rs)).to.be(rs)
        expect(brfn(0)).to.equal('{')
        expect(brfn(1)).to.equal('}')
        expect(brfn(2)).to.equal('{')
        expect(brfn(3)).to.equal('}')
        riot.settings.brackets = '{ }'    // same as defaults
      }
      for (i = 0; i < vals.length; i++) {

        // set another brackets
        rs = vals[i]
        bb = (riot.settings.brackets = rs[0]).split(' ')
        rs = rs[1]

        expect(brfn(/{ }/g).source).to.equal(rs)
        expect(brfn(0)).to.equal(bb[0])
        expect(brfn(1)).to.equal(bb[1]); bb = rs.split(' ')
        expect(brfn(2)).to.equal(bb[0])
        expect(brfn(3)).to.equal(bb[1])
      }

      riot.settings.brackets = null

    })(riot.util.brackets)

  })

})
