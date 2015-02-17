describe('Tmpl tests',function(){
  var data = {
    yes: true,
    no: false,
    str: 'x',
    obj: {val:2},
    arr: [2],
    x: 2,
    fn: function(s) { return ['hi', s].join(' ') }
  }

  it('compile specs',function(){

    var data = {
      yes: true,
      no: false,
      str: 'x',
      obj: {val:2},
      arr: [2],
      x: 2,
      fn: function(s) { return ['hi', s].join(' ') }
    },
    render = function (str) {
      return tmpl(str, data)
    }

    expect(render('<div class="{'
           + 'one: !no,'
           + 'two: false || null || !no && yes,'
           + '\'th_r-e3\': 4 > 2,'
           + '\'four five\': fn(),'
           + 'six: str == "x"'
         + '}">')).to.equal('<div class="one two th_r-e3 four five six">')

    expect(render( '{ true ? "a b c" : "foo" }')).to.equal('a b c')
    expect(render( '{ true ? "a \\"b\\" c" : "foo" }')).to.equal('a "b" c')

    expect(render()).to.be.undefined
    expect(render( '{}')).to.be.undefined
    expect(render( '{ }')).to.be.undefined
    expect(render( '')).to.equal('')
    expect(render( '{ } ')).to.equal(' ')
    expect(render( '{ "1" }')).to.equal('1')
    expect(render( '{ "1" } ')).to.equal('1 ')
    expect(render( '{ 1 }{ 1 }')).to.equal('11')
    expect(render( '{ 1 }{ 1 } ')).to.equal('11 ')
    expect(render( ' { 1 }{ 1 }')).to.equal(' 11')
    expect(render( '{ 1 } { 1 }')).to.equal('1 1')

    expect(render( '{ "\\{ 1 \\}" }')).to.equal('{ 1 }')
    expect(render( '\\{ 1 }')).to.equal('{ 1 }')
    expect(render( '{ "\\}" }')).to.equal('}')
    expect(render( '{ "\\{" }')).to.equal('{')


    expect(render( '{ /* comment */ }')).to.be.undefined
    expect(render( ' { /* comment */ }')).to.equal(' ')
    expect(render( '{ 1 /* comment */ + 1 }')).to.equal(2)
    expect(render( '{ 1 /* comment */ + 1 } ')).to.equal('2 ')

    expect(render( ' { nonExistingVar }')).to.equal(' ')
    expect(render( '{ undefined }')).to.be.undefined
    expect(render( ' { no }')).to.equal(' ')

    expect(render( '{ nonExistingVar }')).to.be.undefined
    expect(render( '{ null }')).to.equal(null)
    expect(render( '{ no }')).to.equal(false)
    expect(render( '{ yes }')).to.equal(true)
    expect(render( '{ false || null || !no && yes }')).to.equal(true)
    expect(render( '{ !no ? "yes" : "no" }')).to.equal('yes')
    expect(render( '{ !yes ? "yes" : "no" }')).to.equal('no')
    expect(render( '{ /^14/.test(+new Date()) }')).to.equal(true)
    expect(render( '{ typeof Math.random() }')).to.equal('number')
    expect(render( '{ fn("there") }')).to.equal('hi there')
    expect(render( '{ str == "x" }')).to.equal(true)
    expect(render( '{ /x/.test(str) }')).to.equal(true)

    expect(render( '{ obj.val } ')).to.equal('2 ')
    expect(render( '{ obj.val }')).to.equal(2)
    expect(render( '{ obj["val"] }')).to.equal(2)
    expect(render( '{ arr[0] }')).to.equal(2)
    expect(render( '{ arr[0]; }')).to.equal(2)
    expect(render( '{ arr.pop() }')).to.equal(2)

    expect(render( '{ fn(str) }')).to.equal('hi x')

    expect(render( '{ obj } ')).to.equal('[object Object] ')
    expect(render( '{ obj }')).to.equal(data.obj)
    expect(render( '{ arr }')).to.equal(data.arr)
    expect(render( '{ fn }')).to.equal(data.fn)

    expect(render( '{ str + " y" + \' z\'}')).to.equal('x y z')
    expect(render( '{ ok : yes }')).to.equal('ok')

    expect(render('{ "a-a" : yes, \'b-b\': yes, c-c: yes }')).to.equal('a-a b-b c-c')
    expect(render( '{ loading: !nonExistingVar.length }')).to.equal('loading')

    expect(render( '\n  { yes \n ? 2 \n : 4} \n')).to.equal('\n  2 \n')

    expect(render( '{ yes && "ok" }')).to.equal('ok')
    expect(render( '{ no && "ok" }')).to.equal(false)

    expect(render( '{ nonExistingVar ? "yes" : "no" }')).to.equal('no')
    expect(render( '{ !nonExistingVar ? "yes" : "no" }')).to.equal('yes')

    window.globalVar = 5
    expect(render( '{ globalVar }')).to.equal(window.globalVar)
    //expect(render( '{ location.href.split(".").pop() }')).to.equal('html')

    data.esc = '\'\n\\'
    expect(render( '{ esc }')).to.equal(data.esc)

    expect(render( '{ this.str }')).to.equal('x')

    expect(render( '{ x }')).to.equal(2)
    expect(render( '{ y: x }')).to.equal('y')

    // custom brackets
    riot.settings.brackets = '[ ]'
    expect(render( '[ x ]')).to.equal(2)
    expect(render( '[ str\\[0\\] ]')).to.equal('x')
    riot.settings.brackets = '<% %>'
    expect(render( '<% x %>')).to.equal(2)
    riot.settings.brackets = '{ }'
  })
})



