describe('Compiler Browser', function() {

  var html = [
        '<script type=\"riot\/tag\" id=\"tag_src\">',
         '  <foo>',
         '     <p>{ opts.baz } { bar }<\/p>',

         '     this.bar = \"romutus\"',

         '  <\/foo>',
         '  <timetable>',
         '     <timer start={ time } each={ time, i in times }><\/timer>',
         '     <foo barz=\"899\" baz=\"90\"><\/foo>',
         '     <p>{ kama }<\/p>',

         '     this.times = [ 1, 3, 5 ]',
         '     this.kama = \"jooo\"',

         '  <\/timetable>',
         '<\/script>',
         '<script type=\"riot\/tag\" src=\"tag\/timer.tag\"><\/script>',
         '<timetable><\/timetable>'
        ].join('\n'),
      tags,
      div = document.createElement('div')

  before(function() {

    div.innerHTML = html
    document.body.appendChild(div)

  })

  after(function() {

    document.body.removeChild(div)

  })

  it('compiles', function() {

    riot.compile(function() {
      tags = riot.mount('timetable', { start: 0 })
    })

    riot.update()
    // grab source code for performance tests

    var src = document.getElementById('tag_src').innerHTML

    // compile timer 1000 times and see how long it takes
    var begin = +new Date()

    for (var i = 0; i < 1000; i++) {
      riot.compile(src, true)
    }

    expect(+new Date() - begin).to.be.below(100)

  })

})
