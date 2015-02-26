describe('Compiler Browser', function() {

  var html = [

          // compiles test
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
          '<timetable><\/timetable>',

          // mount and unmount

          '<script type=\"riot\/tag\">',
          '  <test><p>Val: { opts.val }<\/p><\/test>',
          '<\/script>',

          '<test id="test-tag"><\/test>',
          '<div id=\"foo\"><\/div>',
          '<div id=\"bar\"><\/div>',

          // brackets

          '<test-a><\/test-a>',
          '<test-b><\/test-b>',
          '<test-c><\/test-c>',
          '<test-d><\/test-d>',
          '<test-e><\/test-e>',
          '<test-f><\/test-f>',
          '<test-g><\/test-g>',

          '<script type=\"riot\/tag\">',

          '  <test-e>',
          '    <p>[ x ]<\/p>',
          '    this.x = \"ok\"',
          '  <\/test-e>',

          '  <test-f>',
          '    <p>${ x }<\/p>',
          '    this.x = \"ok\"',
          '  <\/test-f>',

          '  <test-g>',
          '    <p>{ x }<\/p>',
          '    this.x = \"ok\"',
          '  <\/test-g>',

          '<\/script>'

        ].join('\n'),
      tags = [],
      div = document.createElement('div')

  before(function(next) {

    div.innerHTML = html
    document.body.appendChild(div)
    riot.compile(next)

  })

  after(function() {
    var unmount = function (el) {
      if (el.length) {
        el.forEach(unmount)
      } else {
        el.unmount()
      }
    }
    unmount(tags)

  })

  it('compiles', function(done) {

    tags.push(riot.mount('timetable', { start: 0 }))[0]
    expect(document.getElementsByTagName('timer').length).to.be(3)

    riot.update()
    // grab source code for performance tests

    var src = document.getElementById('tag_src').innerHTML

    // compile timer 1000 times and see how long it takes
    var begin = +new Date()

    for (var i = 0; i < 1000; i++) {
      riot.compile(src, true)
    }

    expect(+new Date() - begin).to.be.below(100)

    done()

  })

  it('mount and unmount', function() {

    riot.compile(function() {

      var tag = riot.mount('test', { val: 10 })[0],
          tag2 = riot.mount('#foo', 'test', { val: 30 })[0],
          tag3 = riot.mount(document.getElementById('bar'), 'test', { val: 50 })

      expect(tag.root.innerHTML).to.be('<p>Val: 10</p>')
      expect(tag2.root.innerHTML).to.be('<p>Val: 30</p>')
      expect(tag3.root.innerHTML).to.be('<p>Val: 50</p>')

      tag.unmount()
      tag2.unmount()
      tag3.unmount()

      tag = riot.mount('test', { val: 110 })[0]
      tag2 = riot.mount('#foo', 'test', { val: 140 })[0]
      tag3 = riot.mount(bar, 'test', { val: 150 })

      expect(tag.root.innerHTML).to.be('<p>Val: 110</p>')
      expect(tag2.root.innerHTML).to.be('<p>Val: 140</p>')
      expect(tag3.root.innerHTML).to.be('<p>Val: 150</p>')

      tags.push(tag)
      tags.push(tag2)
      tags.push(tag3)

    })
  })

  it('brackets', function() {

    var tag

    riot.settings.brackets = '[ ]'
    riot.tag('test-a', '<p>[ x ]</p>', function() { this.x = 'ok'})
    tag = riot.mount('test-a')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

    riot.settings.brackets = '<% %>'
    riot.tag('test-b', '<p><% x %></p>', function() { this.x = 'ok' })
    tag = riot.mount('test-b')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

    riot.settings.brackets = '${ }'
    riot.tag('test-c', '<p>${ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-c')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

    riot.settings.brackets = null
    riot.tag('test-d', '<p>{ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-d')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

    riot.settings.brackets = '[ ]'
    tag = riot.mount('test-e')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

    riot.settings.brackets = '${ }'
    tag = riot.mount('test-f')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

    riot.settings.brackets = null
    tag = riot.mount('test-g')[0]
    tags.push(tag)

    expect(tag.root.innerHTML).to.be('<p>ok</p>')

  })

})
