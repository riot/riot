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
    expect(render('{ loading: !nonExistingVar.length }')).to.equal('loading')

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

})
