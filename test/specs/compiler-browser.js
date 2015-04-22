
// this function is needed to run the tests also on ie8
// ie8 returns some weird strings when we try to get the innerHTML of a tag
function normalizeHTML (html) {
  return html
    .trim()
    // change all the tags properties and names to lowercase because a <li> for ie8 is a <LI>
    .replace(/<([^>]*)>/g, function(tag) { return tag.toLowerCase() })
    .replace(/\r|\r|\n/gi, '')
}

describe('Compiler Browser', function() {

  var html = [

          // compiles test
          '<script type=\"riot\/tag\" id=\"tag_src\">',
          '  <foo>',
          '     <p>{ opts.baz } { bar }<\/p>',

          '     this.bar = \"romutus\"',

          '  <\/foo>',
          '  <timetable>',
          '     <timer ontick={ parent.opts.ontick } start={ time } each={ time, i in times }><\/timer>',
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
          '  <test><p>val: { opts.val }<\/p><\/test>',
          '<\/script>',

          '<test id="test-tag"><\/test>',
          '<div id=\"foo\"><\/div>',
          '<div id=\"bar\"><\/div>',

          // duplicated tags in loops

          '<outer id="outer1"><\/outer>',
          '<outer id="outer2"><\/outer>',
          '<outer id="outer3"><\/outer>',

          '<script type=\"riot\/tag\">',

          '<inner>',
          ' <p>',
          '   { opts.value }',
          ' <\/p>',
          '<\/inner>',

          '<\/script>',

          '<script type=\"riot\/tag\">',

          '<outer>',
          '   <div each="{ data, i in opts.data }">',
          '     <span>{ i }<\/span>',
          '     <inner value="{ data.value }"><\/inner>',
          '   <\/div>',
          '<\/outer>',

          '<\/script>',

          // each loop

          '<loop><\/loop>',

          '<script type=\"riot\/tag\">',

          '<loop>',
          '<ul>',
          '  <li each="{ item, i in items }">{ i } { item.value } <\/li>',
          '<\/ul>',
          '<button onclick={ addSomeItems }>btn<\/button>',

          'this.items = []',
          ' ',
          ' addSomeItems(e) {',
          '    var amount = 5',
          '    while(amount--){',
          '      this.items.push({value: "item #" + this.items.length})',
          '    }',
          '  }',
          ' ',
          '<\/loop>',

          '<\/script>',

          // loop context

          '<loop-child><\/loop-child>',
          '<script type=\"riot\/tag\" src=\"tag\/loop-child.tag\"><\/script>',

          // loop order
          '<loop-manip><\/loop-manip>',
          '<script type=\"riot\/tag\" src=\"tag\/loop-manip.tag\"><\/script>',

          // looped child
          '<nested-child><\/nested-child>',
          '<script type=\"riot\/tag\" src=\"tag\/nested-child.tag\"><\/script>',

          // loop option
          '<loop-option><\/loop-option>',
          '<script type=\"riot\/tag\" src=\"tag\/loop-option.tag\"><\/script>',

          // multiple mount at same time
          '<multi-mount value="1"><\/multi-mount>',
          '<multi-mount value="2"><\/multi-mount>',
          '<multi-mount value="3"><\/multi-mount>',
          '<multi-mount value="4"><\/multi-mount>',

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

          '<\/script>',

          // mount the same tag multiple times
          '<div id=\"multi-mount-container-1\"><\/div>',

          // multple mount using *
          '<div id=\"multi-mount-container-2\">',
          '    <test-i><\/test-i>',
          '    <test-l><\/test-l>',
          '    <test-m><\/test-m>',
          '<\/div>',
          // riot-tag attribute

          '<script type=\"riot\/tag\">',
          '  <rtag><p>val: { opts.val }<\/p><\/rtag>',
          '<\/script>',

          '<div id="rtag" riot-tag="rtag"><\/div>',
          '<div id="rtag-nested">',
          '  <div riot-tag="rtag"><\/div>',
          '  <div riot-tag="rtag"><\/div>',
          '  <div riot-tag="rtag"><\/div>',
          '<\/div>',

          // tags property in loop
          '<ploop-tag><\/ploop-tag>',
          '<ploop1-tag><\/ploop1-tag>',
          '<ploop2-tag><\/ploop2-tag>',
          '<ploop3-tag><\/ploop3-tag>',
          '<script type=\"riot\/tag\" src=\"tag\/ploop-tag.tag\"><\/script>',

          '<script type=\"riot\/tag\" src=\"tag\/inner-html.tag\"><\/script>',
          // yield tests

          '<script type=\"riot\/tag\" src=\"tag\/yield-nested.tag\"><\/script>',
          '<yield-parent>{ greeting }<\/yield-parent>',

          '<inner-html>',
          '  { greeting }',
          '  <inner value="ciao mondo"><\/inner>',
          '<\/inner-html>',

          '<yield-loop>',
          '  { greeting }',
          '  <div>Something else<\/div>',
          '<\/yield-loop>'


        ].join('\r'),
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

  it('compiles and unmount the children tags', function(done) {

    this.timeout(3000)

    var ticks = 0,
        tag = riot.mount('timetable', {
        start: 0,
        ontick: function() {
          ticks++
        }
      })[0]

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

    expect(tag.tags.foo).to.not.be('undefined')

    tag.unmount()

    // no time neither for one tick
    // because the tag got unmounted too early
    setTimeout(function() {
      expect(ticks).to.be(0)
      done()
    }, 1200)

  })

  it('mount and unmount', function() {

    var tag = riot.mount('test', { val: 10 })[0],
        tag2 = riot.mount('#foo', 'test', { val: 30 })[0],
        tag3 = riot.mount(document.getElementById('bar'), 'test', { val: 50 })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>val: 10</p>')
    expect(normalizeHTML(tag2.root.innerHTML)).to.be('<p>val: 30</p>')
    expect(normalizeHTML(tag3.root.innerHTML)).to.be('<p>val: 50</p>')

    tag.unmount()
    tag2.unmount()
    tag3.unmount(true)

    expect(document.body.getElementsByTagName('test').length).to.be(0)
    expect(document.getElementById('foo')).to.be(null)
    expect(document.getElementById('bar')).to.not.be(null)

    expect(tag.root._tag).to.be(null)
    expect(tag2.root._tag).to.be(null)
    expect(tag3.root._tag).to.be(null)

  })

  it('mount a tag mutiple times', function() {
    var tag = riot.mount('#multi-mount-container-1', 'test', { val: 300 })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>val: 300</p>')

    riot.tag('test-h', '<p>{ x }</p>', function() { this.x = 'ok'})

    tag = riot.mount('#multi-mount-container-1', 'test-h')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    tags.push(tag)

  })

  it('mount a tag mutiple times using "*"', function() {


    riot.tag('test-i', '<p>{ x }</p>', function() { this.x = 'ok'})
    riot.tag('test-l', '<p>{ x }</p>', function() { this.x = 'ok'})
    riot.tag('test-m', '<p>{ x }</p>', function() { this.x = 'ok'})

    var subTags = riot.mount('#multi-mount-container-2', '*')

    expect(subTags.length).to.be(3)

    subTags = riot.mount(document.getElementById('multi-mount-container-2'), '*')

    expect(subTags.length).to.be(3)

    tags.push(subTags)

  })

  it('avoid to duplicate tags in multiple foreach loops', function() {

    var mountTag = function(tagId) {
      var data = [],
          tag,
          itemsCount = 5

      while (itemsCount--) {
        data.push({
          value: 'item #' + itemsCount
        })
      }

      tag = riot.mount(tagId, {data: data})[0]
      // comment the following line to check the rendered html
      tags.push(tag)

    }

    mountTag('#outer1')
    mountTag('#outer2')
    mountTag('#outer3')

    expect(outer1.getElementsByTagName('inner').length).to.be(5)
    expect(outer1.getElementsByTagName('span').length).to.be(5)
    expect(outer1.getElementsByTagName('p').length).to.be(5)
    expect(outer2.getElementsByTagName('inner').length).to.be(5)
    expect(outer2.getElementsByTagName('span').length).to.be(5)
    expect(outer2.getElementsByTagName('p').length).to.be(5)
    expect(outer3.getElementsByTagName('inner').length).to.be(5)
    expect(outer3.getElementsByTagName('span').length).to.be(5)
    expect(outer3.getElementsByTagName('p').length).to.be(5)

  })

  it('the each loops update correctly the DOM nodes', function() {
    var tag = riot.mount('loop')[0],
        root = tag.root,
        button = root.getElementsByTagName('button')[0],
        itemsCount = 5

    tags.push(tag)

    tag.items = []

    while (itemsCount--) {
      tag.items.push({
        value: 'item #' + tag.items.length
      })
    }
    tag.update()

    expect(root.getElementsByTagName('li').length).to.be(5)

    // no update is required here
    button.onclick({})

    expect(root.getElementsByTagName('li').length).to.be(10)

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be('<li>0 item #0 </li><li>1 item #1 </li><li>2 item #2 </li><li>3 item #3 </li><li>4 item #4 </li><li>5 item #5 </li><li>6 item #6 </li><li>7 item #7 </li><li>8 item #8 </li><li>9 item #9 </li>')

    tag.items.reverse()
    tag.update()
    expect(root.getElementsByTagName('li').length).to.be(10)

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be('<li>0 item #9 </li><li>1 item #8 </li><li>2 item #7 </li><li>3 item #6 </li><li>4 item #5 </li><li>5 item #4 </li><li>6 item #3 </li><li>7 item #2 </li><li>8 item #1 </li><li>9 item #0 </li>'.trim())

    var tempItem = tag.items[1]
    tag.items[1] = tag.items[8]
    tag.items[8] = tempItem
    tag.update()

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be('<li>0 item #9 </li><li>1 item #1 </li><li>2 item #7 </li><li>3 item #6 </li><li>4 item #5 </li><li>5 item #4 </li><li>6 item #3 </li><li>7 item #2 </li><li>8 item #8 </li><li>9 item #0 </li>'.trim())

    tag.items = []
    tag.update()
    expect(root.getElementsByTagName('li').length).to.be(0)

  })

  it('each loop creates correctly a new context', function() {

    var tag = riot.mount('loop-child')[0],
        root = tag.root,
        children = root.getElementsByTagName('looped-child')

    expect(children.length).to.be(2)
    expect(normalizeHTML(children[0].innerHTML)).to.be('<h3>one</h3> <button>one</button>')
    expect(normalizeHTML(children[1].innerHTML)).to.be('<h3>two</h3> <button>two</button>')

    tags.push(tag)

  })

  it('the mount method could be triggered also on several tags using a NodeList instance', function() {

    riot.tag('multi-mount', '{ opts.value }')

    var multipleTags = riot.mount(document.querySelectorAll('multi-mount'))

    expect(multipleTags[0].root.innerHTML).to.be('1')
    expect(multipleTags[1].root.innerHTML).to.be('2')
    expect(multipleTags[2].root.innerHTML).to.be('3')
    expect(multipleTags[3].root.innerHTML).to.be('4')

    var i = multipleTags.length

    while(i--) {
      tags.push(multipleTags[i])
    }

  })

  it('each loop adds and removes items in the right position (when multiple items share the same html)', function() {

    var tag = riot.mount('loop-manip')[0],
        root = tag.root,
        children = root.getElementsByTagName('loop-manip')

    tags.push(tag)

    tag.top()
    tag.update()
    tag.bottom()
    tag.update()
    tag.top()
    tag.update()
    tag.bottom()
    tag.update()

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be('<li>100 <a>remove</a></li><li>100 <a>remove</a></li><li>0 <a>remove</a></li><li>1 <a>remove</a></li><li>2 <a>remove</a></li><li>3 <a>remove</a></li><li>4 <a>remove</a></li><li>5 <a>remove</a></li><li>100 <a>remove</a></li><li>100 <a>remove</a></li>'.trim())


  })

  it('all the nested tags will are correctly pushed to the parent.tags property', function() {

    var tag = riot.mount('nested-child')[0],
        root = tag.root

    tags.push(tag)

    expect(tag.tags.child.length).to.be(6)
    expect(tag.tags['another-nested-child']).to.be.an('object')
    tag.tags.child[0].unmount()
    expect(tag.tags.child.length).to.be(5)
    tag.tags['another-nested-child'].unmount()
    expect(tag.tags['another-nested-child']).to.be(undefined)

  })

  it('loop option tag', function() {
    var tag = riot.mount('loop-option')[0],
        root = tag.root

    expect(normalizeHTML(root.innerHTML)).to.match(/<select> <option value="1">Peter<\/option><option selected="(selected|true)" value="2">Sherman<\/option><option value="3">Laura<\/option> <\/select>/)

    tags.push(tag)

  })

  it('brackets', function() {

    var tag

    riot.settings.brackets = '[ ]'
    riot.tag('test-a', '<p>[ x ]</p>', function() { this.x = 'ok'})
    tag = riot.mount('test-a')[0]
    tags.push(tag)

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    /*

    FIXME: this test fails somehow on IE9

    riot.settings.brackets = '<% %>'
    riot.tag('test-b', '<p><% x %></p>', function() { this.x = 'ok' })
    tag = riot.mount('test-b')[0]
    tags.push(tag)

    */
    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    riot.settings.brackets = '${ }'
    riot.tag('test-c', '<p>${ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-c')[0]
    tags.push(tag)

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    riot.settings.brackets = null
    riot.tag('test-d', '<p>{ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-d')[0]
    tags.push(tag)

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    riot.settings.brackets = '[ ]'
    tag = riot.mount('test-e')[0]
    tags.push(tag)

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    riot.settings.brackets = '${ }'
    tag = riot.mount('test-f')[0]
    tags.push(tag)

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

    riot.settings.brackets = null
    tag = riot.mount('test-g')[0]
    tags.push(tag)

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>ok</p>')

  })

  it('riot-tag attribute', function() {

    var tag = riot.mount('#rtag', { val: 10 })[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be('<p>val: 10</p>')

    tag.unmount()
    expect(document.body.getElementsByTagName('rtag').length).to.be(0)

  })

  it('riot-tag attribute using the "*" selector', function() {

    var subTags = riot.mount('#rtag-nested', '*', { val: 10 })

    expect(subTags.length).to.be(3)

    expect(normalizeHTML(subTags[0].root.innerHTML)).to.be('<p>val: 10</p>')
    expect(normalizeHTML(subTags[1].root.innerHTML)).to.be('<p>val: 10</p>')
    expect(normalizeHTML(subTags[2].root.innerHTML)).to.be('<p>val: 10</p>')

    tags.push(subTags)

  })

  it('tags property in loop, varying levels of nesting', function() {
    var tag = riot.mount('ploop-tag, ploop1-tag, ploop2-tag, ploop3-tag', {
      elements: [{
        foo: 'foo',
        id: 0
      }, {
        foo: 'bar',
        id: 1
      }]
    })

    expect(tag[0].tags['ploop-child'].length).to.be(2)
    expect(tag[0].tags['ploop-another']).to.be.an('object')
    expect(tag[1].tags['ploop-child'].length).to.be(2)
    expect(tag[1].tags['ploop-another'].length).to.be(2)
    expect(tag[2].tags['ploop-child'].length).to.be(2)
    expect(tag[2].tags['ploop-another']).to.be.an('object')
    expect(tag[3].tags['ploop-child'].length).to.be(2)
    expect(tag[3].tags['ploop-another']).to.be.an('object')
    tag.map(function(t) {t.unmount()})
  })

  it('simple html transclusion via <yield> tag', function() {

    var tag = riot.mount('inner-html')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<h1>Hello,   World  <inner value="ciao mondo"><p> ciao mondo </p></inner></h1>')
    tags.push(tag)

  })

  it('<yield> contents in a child get always compiled using its parent data', function(done) {

    var tag = riot.mount('yield-parent', {
      saySomething: done
    })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.match(/<h1>Hello, from the parent<\/h1> <yield-child><h1>Greeting<\/h1>\s+<i>from the child<\/i> <div(.+|)> <b>wooha<\/b> <\/div> <\/yield-child>/)

    tag.update({
      isSelected: true
    })

    expect(normalizeHTML(tag.root.innerHTML)).to.be('<h1>Hello, from the parent</h1> <yield-child><h1>Greeting</h1>  <i>from the child</i> <div class="selected"> <b>wooha</b> </div> </yield-child>')

    tag.root.getElementsByTagName('i')[0].onclick({})

    tags.push(tag)

  })

  it('<yield> contents in a loop get always compiled using its parent data', function(done) {

    var tag = riot.mount('yield-loop', {
      saySomething: done
    })[0],
      child3

    expect(tag.tags['yield-child-2'].length).to.be(5)

    child3 = tag.tags['yield-child-2'][3]
    expect(child3.root.getElementsByTagName('h2')[0].innerHTML.trim()).to.be('subtitle4')

    child3.root.getElementsByTagName('i')[0].onclick({})

    tags.push(tag)

  })

})
