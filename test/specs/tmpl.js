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
        fn: function(s) { return ['hi', s].join(' ') }
      },
      render = function (str) {
        return tmpl(str, data)
      }

  afterEach(function() {
    riot.settings.brackets = '{ }'
  })

  it('compiles specs', function() {

    expect(render('{ a: !no, b: yes }')).to.equal('a b')
    expect(render("{ 'a b': yes }")).to.equal('a b')
    expect(render('{ "a_b-c3": yes }')).to.equal('a_b-c3')
    expect(render('{ y: false || null || !no && yes }')).to.equal('y')
    expect(render('{ y: 4 > 2 }')).to.equal('y')
    expect(render('{ y: fn() }')).to.equal('y')
    expect(render('{ y: str == "x" }')).to.equal('y')
    expect(render('{ y: new Date() }')).to.equal('y')

    expect(render('{ true ? "a b c" : "foo" }')).to.equal('a b c')
    expect(render('{ true ? "a \\"b\\" c" : "foo" }')).to.equal('a "b" c')

    expect(render()).to.be(undefined)
    expect(render('{}')).to.be(undefined)
    expect(render('{ }')).to.be(undefined)
    expect(render('')).to.equal('')
    expect(render('{ } ')).to.equal(' ')
    expect(render('{ "1" }')).to.equal('1')
    expect(render('{ "1" } ')).to.equal('1 ')
    expect(render('{ 1 }{ 1 }')).to.equal('11')
    expect(render('{ 1 }{ 1 } ')).to.equal('11 ')
    expect(render(' { 1 }{ 1 }')).to.equal(' 11')
    expect(render('{ 1 } { 1 }')).to.equal('1 1')

    expect(render('{ "\\{ 1 \\}" }')).to.equal('{ 1 }')
    expect(render('\\{ 1 }')).to.equal('{ 1 }')
    expect(render('{ "\\}" }')).to.equal('}')
    expect(render('{ "\\{" }')).to.equal('{')

    expect(render('{ /* comment */ }')).to.be(undefined)
    expect(render(' { /* comment */ }')).to.equal(' ')
    expect(render('{ 1 /* comment */ + 1 }')).to.equal(2)
    expect(render('{ 1 /* comment */ + 1 } ')).to.equal('2 ')

    expect(render(' { nonExistingVar }')).to.equal(' ')
    expect(render('{ undefined }')).to.be(undefined)
    expect(render(' { no }')).to.equal(' ')

    expect(render('{ nonExistingVar }')).to.be(undefined)
    expect(render('{ null }')).to.equal(null)
    expect(render('{ no }')).to.equal(false)
    expect(render('{ yes }')).to.equal(true)
    expect(render('{ false || null || !no && yes }')).to.equal(true)
    expect(render('{ !no ? "yes" : "no" }')).to.equal('yes')
    expect(render('{ !yes ? "yes" : "no" }')).to.equal('no')
    expect(render('{ /^14/.test(+new Date()) }')).to.equal(true)
    expect(render('{ typeof Math.random() }')).to.equal('number')
    expect(render('{ fn("there") }')).to.equal('hi there')
    expect(render('{ str == "x" }')).to.equal(true)
    expect(render('{ /x/.test(str) }')).to.equal(true)

    expect(render('{ obj.val } ')).to.equal('2 ')
    expect(render('{ obj.val }')).to.equal(2)
    expect(render('{ obj["val"] }')).to.equal(2)
    expect(render('{ arr[0] }')).to.equal(2)
    expect(render('{ arr[0]; }')).to.equal(2)
    expect(render('{ arr.pop() }')).to.equal(2)

    expect(render('{ fn(str) }')).to.equal('hi x')

    expect(render('{ obj } ')).to.equal('[object Object] ')
    expect(render('{ obj }')).to.equal(data.obj)
    expect(render('{ arr }')).to.equal(data.arr)
    expect(render('{ fn }')).to.equal(data.fn)

    expect(render('{ str + " y" + \' z\'}')).to.equal('x y z')
    expect(render('{ ok : yes }')).to.equal('ok')

    expect(render('{ "a-a" : yes, \'b-b\': yes, c-c: yes }')).to.equal('a-a b-b c-c')
    expect(render('{ loading: !nonExistingVar.length }')).to.equal('loading')

    expect(render('\n  { yes \n ? 2 \n : 4} \n')).to.equal('\n  2 \n')

    expect(render('{ yes && "ok" }')).to.equal('ok')
    expect(render('{ no && "ok" }')).to.equal(false)

    expect(render('{ nonExistingVar ? "yes" : "no" }')).to.equal('no')
    expect(render('{ !nonExistingVar ? "yes" : "no" }')).to.equal('yes')

    window.globalVar = 5
    expect(render('{ globalVar }')).to.equal(window.globalVar)

    expect(render('{ !text }')).to.equal(true)

    data.esc = '\'\n\\'
    expect(render('{ esc }')).to.equal(data.esc)

    expect(render('{ this.str }')).to.equal('x')

    expect(render('{ x }')).to.equal(2)
    expect(render('{ y: x }')).to.equal('y')

    // expect(render('{ $a }')).to.equal(0)
    // expect(render('{ $a + $b }')).to.equal(1)

    // maybe / later:
    //expect(render('{ JSON.stringify({ x: 5 }) }')).to.equal('{"x":5}')

  })

  it('custom brackets', function() {

    riot.settings.brackets = '[ ]'
    expect(render('[ x ]')).to.equal(2)
    expect(render('[ str\\[0\\] ]')).to.equal('x')
    riot.settings.brackets = '<% %>'
    expect(render('<% x %>')).to.equal(2)
    riot.settings.brackets = '${ }'
    expect(render('${ x }')).to.equal(2)
    riot.settings.brackets = null
    expect(render('{ x }')).to.equal(2)

  })

})



