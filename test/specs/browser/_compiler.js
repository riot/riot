describe('Compiler Browser', function() {

  var tags = []
  // version# for IE 8-11, 0 for others


  before(function(next) {
    this.timeout(1000000) // on saucelabs is REALLY slow
    compile(next)
  })

  after(function() {
    var unmount = function (el) {
      if (el.length) {
        el.forEach(unmount)
      } else {
        if (el.isMounted) el.unmount()
      }
    }
    unmount(tags)
  })

  afterEach(function() {
    // restore the default brackets
    riot.settings.brackets = defaultBrackets

    var dft = defineTag.names || [], mtg = makeTag.tags || []
    dft.forEach(function(name) { riot.unregister(name) })
    mtg.forEach(function(tag) { tag.unmount() })
    defineTag.names = []
    makeTag.tags = []
  })








  it('style injection to single style tag', function() {
    var styles = getRiotStyles()

    expect(styles).to.match(/\bp\s*\{color: blue;}/)
    expect(styles).to.match(/\bdiv\s*\{color: red;}/)
  })

  // working
  it('style injection removes type riot style tag', function() {
    var stag = document.querySelector('style[type=riot]')
    expect(stag).to.be.equal(null)
  })

  if (typeof window.__karma__ === 'undefined') {
    it('style tag sits in between title and link to stylesheet', function () {
      var stag = document.querySelector('style')
      var prevE = stag.previousElementSibling
      var nextE = stag.nextElementSibling
      expect(prevE.tagName).to.be.equal('TITLE')
      expect(nextE.tagName).to.be.equal('LINK')
    })
  }

  it('scoped css tag supports htm5 syntax, multiple style tags', function () {

    checkCSS(riot.mount('style-tag3')[0], '4px')
    checkCSS(riot.mount('style-tag4')[0], '2px', 1)
    delete riot.parsers.css.cssup

    function checkCSS(t, x, p2) {
      t.update()
      var e = t.root.firstElementChild
      expect(e.tagName).to.be.equal('P')
      expect(window.getComputedStyle(e, null).borderTopWidth).to.be.equal(x)
      if (p2) {
        e = t.root.getElementsByTagName('P')[1]
        expect(e.innerHTML).to.be.equal('x')
        expect(window.getComputedStyle(e, null).borderTopWidth).to.be.equal('1px')
      }
      tags.push(t)
    }
  })

  it('scoped css and data-is, mount(selector, tagname)', function() {


    function checkBorder(t) {
      var e = t.root.firstElementChild
      var s = window.getComputedStyle(e, null).borderTopWidth
      expect(s).to.be.equal('1px')

    }

    injectHTML([
      '<scoped-tag></scoped-tag>',
      '<div data-is="scoped-tag"></div>',
      '<div id="scopedtag"></div>'
    ])

    var stags = riot.mount('scoped-tag')

    var tag = stags[0]
    checkBorder(tag)

    var rtag = stags[1]
    checkBorder(rtag)

    var divtag = riot.mount('#scopedtag', 'scoped-tag')[0]
    checkBorder(divtag)
    tags.push(divtag)
    tags.push(rtag)
    tag.unmount()
  })

  it('deferred injection of styles in batch', function() {

    // test riot.util.styleNode
    expect(riot.util.styleNode).to.not.be.equal(undefined)
    expect(riot.util.styleNode.tagName).to.be.equal('STYLE')

    // test style isn't injected yet
    styles = getRiotStyles()
    expect(styles).not.to.match(/\bparsed-style\s*\{/)

    // define a styled tag
    riot.tag('runtime-style-parsing', '<div></div>', '.parsed-style { color: red; }', '', function(opts) { })

    // test style isn't injected by the simple tag definition
    styles = getRiotStyles()
    expect(styles).not.to.match(/\bparsed-style\s*\{/)

    // mount the tag
    injectHTML(['<runtime-style-parsing></runtime-style-parsing>' ])
    var tag = riot.mount('runtime-style-parsing')[0]

    // test style is correctly injected
    styles = getRiotStyles()
    expect(styles).to.match(/\bparsed-style\s*\{\s*color:\s*red;\s*}/)

    // remount (unmount+mount)
    tag.unmount(true)
    tag = riot.mount('runtime-style-parsing')[0]
    expect(tag).to.not.be.equal(undefined)

    // test remount does not affect style
    styles = getRiotStyles()
    expect(styles).to.match(/\bparsed-style\s*\{\s*color:\s*red;\s*}/)

    // test remount does not duplicate rule
    expect(styles.match(/\bparsed-style\s*\{/g)).to.have.length(1)
  })

  it('preserve attributes from tag definition', function() {
    injectHTML('<div data-is="preserve-attr2"></div>')
    var tag = riot.mount('preserve-attr')[0]
    expect(tag.root.className).to.be.equal('single-quote')
    var tag2 = riot.mount('preserve-attr2')[0]
    expect(tag2.root.className).to.be.equal('double-quote')
    tag.unmount()
    tags.push(tag2)
  })

  it('precompiled tag compatibility', function() {

    injectHTML('<precompiled></precompiled>')
    riot.tag('precompiled', 'HELLO!', 'precompiled, [data-is="precompiled"]  { color: red }', function(opts) {
      this.nothing = opts.nothing
    })

    var tag = riot.mount('precompiled')[0]
    expect(window.getComputedStyle(tag.root, null).color).to.be.equal('rgb(255, 0, 0)')
    tag.unmount()

  })

  it('static named tag for tags property', function() {
    injectHTML('<named-child-parent></named-child-parent>')
    var tag = riot.mount('named-child-parent')[0]
    expect(tag['tags-child'].root.innerHTML).to.be.equal('I have a name')

    tag.unmount()
  })

  it('protect the internal "tags" attribute from external overrides', function() {
    var tag = riot.mount('loop-protect-internal-attrs')[0]
    expect(tag.tags['loop-protect-internal-attrs-child'].length).to.be.equal(4)
    tag.unmount()
  })

  it('preserve the mount order, first the parent and then all the children', function() {
    var correctMountingOrder = [
        'deferred-mount',
        'deferred-child-1',
        'deferred-child-2',
        'deferred-loop',
        'deferred-loop',
        'deferred-loop',
        'deferred-loop',
        'deferred-loop'
      ],
      mountingOrder = [],
      cb = function(tagName, childTag) {
        // make sure the mount event gets triggered when all the children tags
        // are in the DOM
        expect(document.contains(childTag.root)).to.be.equal(true)
        mountingOrder.push(tagName)
      },
      tag = riot.mount('deferred-mount', { onmount: cb })[0]

    expect(mountingOrder.join()).to.be.equal(correctMountingOrder.join())

    tag.unmount()
  })

  it('no update should be triggered if the preventUpdate flag is set', function() {
    var tag = riot.mount('prevent-update')[0]

    expect(tag['fancy-name'].innerHTML).to.be.equal('john')

    tag.root.getElementsByTagName('p')[0].onclick({})

    expect(tag['fancy-name'].innerHTML).to.be.equal('john')

    tag.unmount()
  })

  it('the before events get triggered', function() {
    var eventsCount = 0,
      tag,
      incrementEvents = function () {
        eventsCount++
      }
    riot.tag('before-events', '', function() {
      this.on('before-mount', incrementEvents)
      this.on('before-unmount', incrementEvents)
    })
    tag = riot.mount(document.createElement('before-events'))[0]
    tag.unmount()
    expect(eventsCount).to.be.equal(2)
  })

  it('child tags are only rendered when if-condition is truthy', function() {
    var tag = riot.mount('if-mount')[0]

    var expectL2 = function(base, exist) {
      var ex = expect(base.tags['if-level2'])
      exist ? ex.to.not.be.equal(undefined) : ex.to.be.equal(undefined)
      expect($$('if-level2', base.root).length).to.be.equal(exist ? 1 : 0)
    }

    var expectCond = function(base, exist) {
      var ex = expect(base.tags['if-level2'].tags['conditional-tag'])
      exist ? ex.to.not.be.equal(undefined) : ex.to.be.equal(undefined)
      expect($$('conditional-tag', base.root).length).to.be.equal(exist ? 1 : 0)
    }

    expectL2(tag.ff, false)
    expectL2(tag.ft, false)

    expectL2(tag.tf, true)
    expectCond(tag.tf, false)

    expectL2(tag.tt, true)
    expectCond(tag.tt, true)

    tag.tf.tags['if-level2'].toggleCondition()
    expectCond(tag.tf, true)

    tag.ft.toggleCondition()
    expectL2(tag.ft, true)
    expectCond(tag.ft, true)

    tag.unmount()
  })

  it('tags under a false if statement are unmounted', function() {
    var unmountCount = 0, cb = function() { unmountCount++ }
    var tag = riot.mount('if-unmount', {cb: cb})[0]

    // check that our child tags exist, and record their ids
    expect(tag.tags['if-uchild'].length).to.be.equal(3)
    var firstIds = tag.tags['if-uchild'].map(function(c) { return c._riot_id })

    // set if conditions to false
    tag.items[0].bool = false
    tag.update({cond: false})

    // ensure the tags are gone, and that their umount callbacks were triggered
    expect(tag.tags['if-uchild']).to.be.equal(undefined)
    expect(unmountCount).to.be.equal(3)

    // set conditions back to true
    tag.items[0].bool = true
    tag.update({cond: true})

    // ensure the tags exist, and get their ids
    expect(tag.tags['if-uchild'].length).to.be.equal(3)
    var secondIds = tag.tags['if-uchild'].map(function(c) { return c._riot_id })

    // ensure that all of the new tags are different instances from the first time
    var intersection = secondIds.filter(function(id2) {
      return firstIds.indexOf(id2) > -1
    })
    expect(intersection.length).to.be.equal(0)

    tag.unmount()
  })

  it('named refs are removed from parent when element leaves DOM', function() {
    injectHTML('<named-unmount></named-unmount>')
    var tag = riot.mount('named-unmount')[0]
    tag.unmount()

    expect(tag.first).to.be.equal(undefined)
    expect(tag.second).to.be.equal(undefined)

    tag.update({cond: true, items: ['third']})

    expect(tag.first).to.be.an(HTMLElement)
    expect(tag.second).to.be.an(HTMLElement)
    expect(tag.third).to.be.an(HTMLElement)

    tag.update({cond: false, items: []})

    expect(tag.first).to.be.equal(undefined)
    expect(tag.second).to.be.equal(undefined)
    expect(tag.third).to.be.equal(undefined)
  })

  it('preserve the mount order, first the parent and then all the children', function() {
    var correctMountingOrder = [
        'deferred-mount',
        'deferred-child-1',
        'deferred-child-2',
        'deferred-loop',
        'deferred-loop',
        'deferred-loop',
        'deferred-loop',
        'deferred-loop'
      ],
      mountingOrder = [],
      cb = function(tagName, childTag) {
        // make sure the mount event gets triggered when all the children tags
        // are in the DOM
        expect(document.contains(childTag.root)).to.be.equal(true)
        mountingOrder.push(tagName)
      },
      tag = riot.mount('deferred-mount', { onmount: cb })[0]

    expect(mountingOrder.join()).to.be.equal(correctMountingOrder.join())

    tag.unmount()
  })

  it('only evalutes expressions once per update', function() {

    var tag = riot.mount('expression-eval-count')[0]
    expect(tag.count).to.be.equal(1)
    tag.update()
    expect(tag.count).to.be.equal(2)
    tag.unmount()
  })

  it('multi named elements to an array', function() {
    var mount = function() {
        var tag = this
        expect(tag.rad[0].value).to.be.equal('1')
        expect(tag.rad[1].value).to.be.equal('2')
        expect(tag.rad[2].value).to.be.equal('3')
        expect(tag.t.value).to.be.equal('1')
        expect(tag.t_1.value).to.be.equal('1')
        expect(tag.t_2.value).to.be.equal('2')
        expect(tag.c[0].value).to.be.equal('1')
        expect(tag.c[1].value).to.be.equal('2')
      },
      mountChild = function() {
        var tag = this
        expect(tag.child.value).to.be.equal('child')
        expect(tag.check[0].value).to.be.equal('one')
        expect(tag.check[1].value).to.be.equal('two')
        expect(tag.check[2].value).to.be.equal('three')

      }
    var tag = riot.mount('multi-named', { mount: mount, mountChild: mountChild })[0]

    tag.unmount()
  })

  it('input type=number', function() {
    var tag = riot.mount('input-number', {num: 123})[0]
    var inp = tag.root.getElementsByTagName('input')[0]
    expect(inp.getAttribute('type')).to.be.equal('number')
    expect(inp.value).to.be.equal('123')
    tag.unmount()
  })

  it('the input values should be updated corectly on any update call', function() {
    var tag = riot.mount('input-values')[0]
    expect(tag.i.value).to.be.equal('foo')
    tag.update()
    expect(tag.i.value).to.be.equal('hi')
  })

  it('data-is as expression', function() {
    injectHTML('<container-riot></container-riot>')
    var tag = riot.mount('container-riot')[0]
    var div = tag.root.getElementsByTagName('div')[0]
    expect(div.getAttribute('data-is')).to.be.equal('nested-riot')
    tag.unmount()
  })

  it('the "updated" event gets properly triggered in a nested child', function(done) {
    injectHTML('<div id="updated-events-tester"></div>')
    var tag = riot.mount('#updated-events-tester', 'named-child-parent')[0],
      counter = 0

    tag.tags['named-child'].on('updated', function() {
      counter ++
      if (counter == 2) done()
    })

    tag.update()
    tag.tags['named-child'].update()

    tag.unmount()

  })

  it('the "updated" gets properly triggered also from the children tags in a loop', function(done) {

    injectHTML('<div id="updated-events-in-loop"></div>')
    var tag = riot.mount('#updated-events-in-loop', 'loop-unshift')[0],
      counter = 0

    tag.tags['loop-unshift-item'][0].on('updated', function() {
      counter ++
      if (counter == 2) done()
    })

    tag.update()
    tag.tags['loop-unshift-item'][0].update()

    tag.unmount()

  })

  it('recursive structure', function() {
    var tag = riot.mount('treeview')[0]
    expect(tag).to.be.an('object')
    expect(tag.isMounted).to.be.equal(true)
    tag.unmount()
  })

  it('the loops children sync correctly their internal data with their options', function() {
    var tag = riot.mount('loop-sync-options')[0]

    function ch(idx) {
      return tag.root.getElementsByTagName('loop-sync-options-child')[idx]._tag
    }

    expect(ch(0).val).to.be.equal('foo')
    expect(ch(0).root.className).to.be.equal('active')
    expect(ch(1).val).to.be.equal(undefined)
    expect(ch(2).val).to.be.equal(undefined)
    expect(ch(0).num).to.be.equal(undefined)
    expect(ch(1).num).to.be.equal(3)
    expect(ch(2).num).to.be.equal(undefined)
    expect(ch(0).bool).to.be.equal(undefined)
    expect(ch(1).bool).to.be.equal(undefined)
    expect(ch(2).bool).to.be.equal(false)
    tag.update({
      children: tag.children.reverse()
    })
    expect(ch(0).val).to.be.equal(undefined)
    expect(ch(0).root.className).to.be.equal('')
    expect(ch(1).val).to.be.equal(undefined)
    expect(ch(2).val).to.be.equal('foo')
    expect(ch(2).root.className).to.be.equal('active')
    expect(ch(0).num).to.be.equal(undefined)
    expect(ch(1).num).to.be.equal(3)
    expect(ch(2).num).to.be.equal(undefined)
    expect(ch(0).bool).to.be.equal(false)
    expect(ch(1).bool).to.be.equal(undefined)
    expect(ch(2).bool).to.be.equal(undefined)

    tag.update({
      children: tag.children.reverse()
    })
    expect(ch(0).val).to.be.equal('foo')
    expect(ch(0).root.className).to.be.equal('active')
    expect(ch(1).val).to.be.equal(undefined)
    expect(ch(2).val).to.be.equal(undefined)
    expect(ch(2).root.className).to.be.equal('')
    expect(ch(0).num).to.be.equal(undefined)
    expect(ch(1).num).to.be.equal(3)
    expect(ch(2).num).to.be.equal(undefined)
    expect(ch(0).bool).to.be.equal(undefined)
    expect(ch(1).bool).to.be.equal(undefined)
    expect(ch(2).bool).to.be.equal(false)
    tag.unmount()
  })


/*
// TODO: soon it will be possible!
it('raw contents', function() {
    var tag = riot.mount('raw-contents')[0],
      p = $('p', tag.root),
      h1 = $('h1', tag.root),
      span = $('span', tag.root),
      div = $('div', tag.root)

    expect(p.contains(span)).to.be.equal(true)
    // TODO: pass this test
    expect(h1.innerHTML).to.be.equal('Title: ' + p.innerHTML)
    expect(div.getAttribute('data-content')).to.be.equal('<div>Ehy</div><p>ho</p>')
    //tag.unmount()
  })

*/

  it('the loops children sync correctly their internal data even when they are nested', function() {
    var tag = riot.mount('loop-sync-options-nested')[0]

    expect(tag.tags['loop-sync-options-nested-child'][0].parent.root.tagName.toLowerCase()).to.be.equal('loop-sync-options-nested')
    expect(tag.tags['loop-sync-options-nested-child'][0].val).to.be.equal('foo')
    expect(tag.tags['loop-sync-options-nested-child'][1].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].num).to.be.equal(3)
    expect(tag.tags['loop-sync-options-nested-child'][2].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].bool).to.be.equal(false)
    tag.update({
      children: tag.children.reverse()
    })
    tag.update()
    expect(tag.tags['loop-sync-options-nested-child'][0].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].val).to.be.equal('foo')
    expect(tag.tags['loop-sync-options-nested-child'][0].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].num).to.be.equal(3)
    expect(tag.tags['loop-sync-options-nested-child'][2].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].bool).to.be.equal(false)
    expect(tag.tags['loop-sync-options-nested-child'][1].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].parent.root.tagName.toLowerCase()).to.be.equal('loop-sync-options-nested')
    tag.update({
      children: tag.children.reverse()
    })
    tag.update()
    expect(tag.tags['loop-sync-options-nested-child'][0].val).to.be.equal('foo')
    expect(tag.tags['loop-sync-options-nested-child'][1].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].val).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].num).to.be.equal(3)
    expect(tag.tags['loop-sync-options-nested-child'][2].num).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][0].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][1].bool).to.be.equal(undefined)
    expect(tag.tags['loop-sync-options-nested-child'][2].bool).to.be.equal(false)

    tag.unmount()
  })

  it('the children tags are in sync also in multiple nested tags', function() {

    injectHTML('<loop-sync-options-nested-wrapper></loop-sync-options-nested-wrapper>')
    var tag = riot.mount('loop-sync-options-nested-wrapper')[0]
    expect(tag.tags['loop-sync-options-nested'].tags['loop-sync-options-nested-child'].length).to.be.equal(3)
    tag.unmount()
  })

  it('children in a loop inherit properties from the parent', function() {
    var tag = riot.mount('loop-inherit')[0]
    expect(tag.me.opts.nice).to.be.equal(tag.isFun)
    tag.isFun = false
    tag.update()
    expect(tag.me.opts.nice).to.be.equal(tag.isFun)
    expect(tag.me.tags).to.be.empty()
    tag.unmount()
  })

  it('loop tags get rendered correctly also with conditional attributes', function(done) {
    var tag = riot.mount('loop-conditional')[0]

    setTimeout(function() {
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(2)
      expect(tag.root.getElementsByTagName('loop-conditional-item').length).to.be.equal(2)
      expect(tag.tags['loop-conditional-item'].length).to.be.equal(2)
      tag.items = []
      tag.update()
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(0)
      expect(tag.root.getElementsByTagName('loop-conditional-item').length).to.be.equal(0)
      expect(tag.tags['loop-conditional-item']).to.be.equal(undefined)
      tag.items = [2, 2, 2]
      tag.update()
      expect(tag.root.getElementsByTagName('div').length).to.be.equal(3)
      expect(tag.root.getElementsByTagName('loop-conditional-item').length).to.be.equal(3)
      expect(tag.tags['loop-conditional-item'].length).to.be.equal(3)
      done()
    }, 100)

    tag.unmount()
  })

  it('custom children items in a nested loop are always in sync with the parent tag', function() {
    var tag = riot.mount('loop-inherit')[0]

    expect(tag.tags['loop-inherit-item'].length).to.be.equal(4)
    expect(tag.me.opts.name).to.be.equal(tag.items[0])
    expect(tag.you.opts.name).to.be.equal(tag.items[1])
    expect(tag.everybody.opts.name).to.be.equal(tag.items[2])

    tag.items.splice(1, 1)
    tag.update()
    expect(tag.root.getElementsByTagName('div').length).to.be.equal(2)
    expect(tag.tags['loop-inherit-item'].length).to.be.equal(3)

    tag.items.push('active')
    tag.update()
    expect(tag.root.getElementsByTagName('div').length).to.be.equal(3)
    expect(tag.root.getElementsByTagName('div')[2].innerHTML).to.contain('active')
    expect(tag.root.getElementsByTagName('div')[2].className).to.be.equal('active')
    expect(tag.me.opts.name).to.be.equal(tag.items[0])
    expect(tag.you).to.be.equal(undefined)
    expect(tag.everybody.opts.name).to.be.equal(tag.items[1])
    expect(tag.boh.opts.name).to.be.equal('boh')
    expect(tag.tags['loop-inherit-item'].length).to.be.equal(4)

    tag.unmount()

  })

  it('the DOM events get executed in the right context', function() {
    var tag = riot.mount('loop-inherit')[0]
    tag.tags['loop-inherit-item'][0].root.onmouseenter({})
    expect(tag.wasHovered).to.be.equal(true)
    expect(tag.root.getElementsByTagName('div').length).to.be.equal(4)
    tag.tags['loop-inherit-item'][0].root.onclick({})
    expect(tag.tags['loop-inherit-item'][0].wasClicked).to.be.equal(true)

    tag.unmount()
  })

  it('loops over other tag instances do not override their internal properties', function() {
    var tag = riot.mount('loop-tag-instances')[0]

    tag.start()

    expect(tag.tags['loop-tag-instances-child'].length).to.be.equal(5)
    expect(tag.tags['loop-tag-instances-child'][0].root.tagName.toLowerCase()).to.be.equal('loop-tag-instances-child')
    tag.update()
    expect(tag.tags['loop-tag-instances-child'][3].root.tagName.toLowerCase()).to.be.equal('loop-tag-instances-child')

    tag.unmount()

  })

  it('nested loops using non object data get correctly rendered', function() {
    var tag = riot.mount('loop-nested-strings-array')[0],
      children = tag.root.getElementsByTagName('loop-nested-strings-array-item')
    expect(children.length).to.be.equal(4)
    children = tag.root.getElementsByTagName('loop-nested-strings-array-item')
    children[0].onclick({})
    expect(children.length).to.be.equal(4)
    expect(normalizeHTML(children[0].innerHTML)).to.be.equal('<p>b</p>')
    expect(normalizeHTML(children[1].innerHTML)).to.be.equal('<p>a</p>')
    tag.unmount()
  })

  it('all the events get fired also in the loop tags, the e.item property gets preserved', function() {
    var currentItem,
      currentIndex,
      callbackCalls = 0,
      tag = riot.mount('events', {
        cb: function(e) {
          expect(e.item.val).to.be.equal(currentItem)
          expect(e.item.index).to.be.equal(currentIndex)
          callbackCalls++
        }
      })[0],
      divTags = tag.root.getElementsByTagName('div')



    currentItem = tag.items[0]
    currentIndex = 0
    divTags[0].onclick({})
    tag.items.reverse()
    tag.update()
    currentItem = tag.items[0]
    currentIndex = 0
    divTags[0].onclick({})

    expect(callbackCalls).to.be.equal(2)

    tag.unmount()
  })

  it('top most tag preserve attribute expressions', function() {
    var tag = riot.mount('top-attributes')[0]
    expect(tag.root.className).to.be.equal('classy') // qouted
    expect(tag.root.getAttribute('data-noquote')).to.be.equal('quotes') // not quoted
    expect(tag.root.getAttribute('data-nqlast')).to.be.equal('quotes') // last attr with no quotes
    expect(tag.root.style.fontSize).to.be.equal('2em') // TODO: how to test riot-prefix?

    var opts = tag.root._tag.opts
    if (opts)
      expect(opts.riotStyle).to.match(/font-size:\s?2em/i)
    else
      console.log('top-attributes._tag.opts not found!')

    tag.unmount()
  })

  it('camelize the options passed via dom attributes', function() {
    var node = document.createElement('top-attributes'),
      tag

    node.setAttribute('my-random-attribute', 'hello')
    tag = riot.mount(node, {
      'another-random-option': 'hello'
    })[0]
    expect(tag.opts.myRandomAttribute).to.be.equal('hello')
    expect(tag.opts['another-random-option']).to.be.equal('hello')

    tag.unmount()

  })

  it('the data-is attribute gets updated if a DOM node gets mounted using two or more different tags', function() {
    var div = document.createElement('div')
    tags.push(riot.mount(div, 'timetable')[0])
    expect(div.getAttribute('data-is')).to.be.equal('timetable')
    tags.push(riot.mount(div, 'test')[0])
    expect(div.getAttribute('data-is')).to.be.equal('test')

  })

  it('any DOM event in a loop updates the whole parent tag', function() {
    var tag = riot.mount('loop-numbers-nested')[0]
    expect(tag.root.getElementsByTagName('ul')[0].getElementsByTagName('li').length).to.be.equal(4)
    tag.root.getElementsByTagName('ul')[0].getElementsByTagName('li')[0].onclick({})
    expect(tag.root.getElementsByTagName('ul')[0].getElementsByTagName('li').length).to.be.equal(2)
    tag.unmount()
  })

  it('riot.observable instances could be also used in a loop', function() {
    var tag = riot.mount('loop-child')[0]

    tag.items = [riot.observable({name: 1}), {name: 2}]
    tag.update()
    tag.items = [{name: 2}]
    tag.update()

    tag.unmount()
  })

  it('the update event returns the tag instance', function() {
    var tag = riot.mount('loop-child')[0]
    expect(tag.update()).to.not.be.equal(undefined)
    tag.unmount()
  })

  it('table with multiple bodies and dynamic styles #1052', function() {

    var tag = riot.mount('table-multibody')[0],
      bodies = tag.root.getElementsByTagName('tbody')

    expect(bodies.length).to.be.equal(3)
    for (var i = 0; i < bodies.length; ++i) {
      expect(normalizeHTML(bodies[0].innerHTML))
        .to.match(/<tr style="background-color: ?(?:white|lime);?"[^>]*>(?:<td[^>]*>[A-C]\d<\/td>){3}<\/tr>/)
    }

    expect(bodies[0].getElementsByTagName('tr')[0].style.backgroundColor).to.be.equal('white')
    tag.root.getElementsByTagName('button')[0].onclick({})
    expect(bodies[0].getElementsByTagName('tr')[0].style.backgroundColor).to.be.equal('lime')

    tag.unmount()
  })

  it('table with tbody and thead #1549', function() {

    var tag = riot.mount('table-thead-tfoot-nested')[0],
      bodies = tag.root.getElementsByTagName('tbody'),
      heads = tag.root.getElementsByTagName('thead'),
      foots = tag.root.getElementsByTagName('tfoot')

    expect(bodies.length).to.be.equal(1)
    expect(heads.length).to.be.equal(1)
    expect(foots.length).to.be.equal(1)

    var ths = tag.root.getElementsByTagName('th'),
      trs = tag.root.getElementsByTagName('tr'),
      tds = tag.root.getElementsByTagName('td')

    expect(ths.length).to.be.equal(3)
    expect(trs.length).to.be.equal(5)
    expect(tds.length).to.be.equal(6)

    tag.unmount()
  })

  it('table with caption and looped cols, ths, and trs #1067', function() {
    var data = {
      // copied from loop-cols.tag
      headers: [
        'Name',
        'Number',
        'Address',
        'City',
        'Contact'
      ],
      data: [
        ['Abc', '10', 'A 4B', 'México', 'Juan'],
        ['Def', '20', 'B 50', 'USA', 'Anna'],
        ['Ghi', '30', 'D 60', 'Japan', ''],
        ['Jkl', '40', 'E 1C', 'France', 'Balbina']
      ]
    }
    var tag = riot.mount('loop-cols')[0],
      el, i, k

    tag.update()

    el = getEls('caption')[0]
    expect(el.innerHTML).to.be.equal('Loop Cols')

    el = getEls('colgroup')
    expect(el.length).to.be.equal(1)

    el = getEls('col', el[0])
    expect(el.length).to.be.equal(5)

    el = getEls('tr', getEls('thead')[0])
    expect(el.length).to.be.equal(1)

    el = getEls('th', el[0])
    expect(el.length).to.be.equal(5)
    for (i = 0; i < el.length; ++i) {
      expect(el[i].tagName).to.be.equal('TH')
      expect(el[i].innerHTML.trim()).to.be.equal(data.headers[i])
    }

    el = getEls('tr', getEls('tbody')[0])
    expect(el.length).to.be.equal(4)
    //console.log(' - - - tbody.tr: ' + el[0].innerHTML)

    for (i = 0; i < el.length; ++i) {
      var cells = getEls('td', el[i])
      expect(cells.length).to.be.equal(5)
      for (k = 0; k < cells.length; ++k) {
        //console.log(' - - - getting data[' + i + ',' + k + ']')
        expect(cells[k].tagName).to.be.equal('TD')
        expect(cells[k].innerHTML.trim()).to.be.equal(data.data[i][k])
      }
    }

    tag.unmount()

    function getEls(t, e) {
      if (!e) e = tag.root
      return e.getElementsByTagName(t)
    }
  })

  it('table/thead/tbody/tfoot used as root element of custom tags', function() {
    var
      tag = riot.mount('table-test')[0],
      tbl

    // set "tbl" to the table-test root element
    expect(tag).to.not.be.empty()
    tbl = tag.root
    expect(tbl).to.not.be.empty()
    tag.update()

    testTable(tbl, 'table-caption', {
      tbody: 1,
      caption: true,
      colgroup: true
    })
    testTable(tbl, 'table-colgroup', {
      thead: 1,
      tbody: 1,
      colgroup: true
    })
    testTable(tbl, 'table-looped-col', {
      thead: 1,
      tbody: 1,
      col: true
    })
    testTable(tbl, 'table-multi-col', {
      thead: 1,
      tbody: 1,
      col: true
    })
    testTable(tbl, 'table-tfoot', {
      tfoot: 1,
      tbody: 1
    })
    testTable(tbl, 'table-tr-body-only', {
      tr: 2
    })
    testTable(tbl, 'table-tr-alone', {
      tr: 1
    })
    testTable(tbl, 'table-custom-thead-tfoot', {
      thead: 1,
      tfoot: 1,
      tbody: 2,
      colgroup: true
    })

    tag.unmount()

    // test the table and call the tests for the content
    function testTable(root, name, info) {
      var s, key, inf

      root = root.querySelectorAll('table[data-is=' + name + ']')
      s = name + '.length: '
      expect(s + root.length).to.be.equal(s + '1')
      root = root[0]

      // test content
      for (key in info) { // eslint-disable-line
        if (info[key] === true)
          testOther(root, key)
        else
          testRows(root, key, info[key])
      }
    }

    // test rows and cells for an element of thead/tfoot/tbody
    function testRows(root, name, cnt) {
      var s, i, r, c, rows, cells, templ

      // check the count of this element
      root = root.getElementsByTagName(name)
      s = name + '.length: '
      expect(s + root.length).to.be.equal(s + cnt)
      if (name === 'tr') {
        name = 'tbody'
        root = [{ rows: root }]
        //...and leave cnt as-is, else adjust cnt to expected rows
      } else cnt = name === 'tbody' ? 2 : 1

      // check each element
      for (i = 0; i < root.length; i++) {
        // test the rows
        rows = root[i].rows
        expect(rows.length).to.be.equal(cnt)
        // test the cols
        for (r = 0; r < rows.length; r++) {
          c = name[1].toUpperCase()
          s = r + 1
          cells = rows[r].cells
          templ = c === 'B' ? 'R' + s + '-C' : c + '-'
          expect(cells.length).to.be.equal(2)
          expect(cells[0].innerHTML).to.contain(templ + '1')
          expect(cells[1].innerHTML).to.contain(templ + '2')
        }
      }
    }

    // test caption, colgroup and col elements
    function testOther(root, name) {
      var cols, s = name + '.length: '

      // we'll search the parent for <col>, later in the switch
      if (name !== 'col') {
        root = root.getElementsByTagName(name)
        expect(s + root.length).to.be.equal(s + '1')
        root = root[0]
      }
      switch (name) {
      case 'caption':
        expect(root.innerHTML).to.contain('Title')
        break
      case 'colgroup':
      case 'col':
        cols = root.getElementsByTagName('col')
        expect(cols).to.have.length(2)
        expect(cols[0].width).to.be.equal('150')
        expect(cols[1].width).to.be.equal('200')
        break
      default:
        break
      }
    }
  })

  it('the "shouldUpdate" locks the tag update properly', function() {
    var tag = riot.mount('should-update')[0]
    tag.update()
    expect(tag.count).to.be.equal(0)
    tag.shouldUpdate = function() { return true }
    tag.update()
    expect(tag.count).to.be.equal(1)
    tag.unmount()
  })

  it('select as root element of custom riot tag', function () {
    var
      CHOOSE = 0,     // option alone
      OPTION = 1,     // looped option
      OPTGRP = 2,     // optgroup with options
      list = {
        'select-single-option': [0, CHOOSE],
        'select-each-option': [1, OPTION],
        'select-each-option-prompt': [2, CHOOSE, OPTION],
        'select-each-two-options': [4, OPTION, OPTION],
        'select-optgroup-each-option': [0, OPTGRP],
        'select-optgroup-each-option-prompt': [0, CHOOSE, OPTGRP],
        'select-two-optgroup-each-option': [3, OPTGRP, CHOOSE, OPTGRP],
        'select-each-optgroup': [0, OPTGRP, OPTGRP]
      },
      sel, dat, tag = riot.mount('select-test')[0]

    expect(tag).to.not.be.empty()
    for (var name in list) {                 // eslint-disable-line guard-for-in
      //console.log('Testing ' + name)
      dat = list[name]
      sel = tag.root.querySelector('select[data-is=' + name + ']')
      expect(sel).to.not.be.empty()
      if (sel.selectedIndex !== dat[0]) expect().fail(
        name + '.selectIndex ' + sel.selectedIndex + ' expected to be ' + dat[0])
      var s1 = listFromSel(sel)
      var s2 = listFromDat(dat)
      expect(s1).to.be.equal(s2)
    }

    function listFromDat(dat) {
      var op = [], s = 'Opt1,Opt2,Opt3'
      for (i = 1; i < dat.length; i++) {
        if (dat[i] === OPTGRP) op.push('G,' + s)
        else if (dat[i] === OPTION) op.push(s)
        else op.push('(choose)')
      }
      return op.join(',')
    }
    function listFromSel(el) {
      var op = []
      el = el.firstChild
      while (el) {
        if (el.tagName === 'OPTGROUP') {
          op.push('G')
          op = op.concat(listFromSel(el))
        } else if (el.tagName === 'OPTION') {
          op.push(el.text)
        }
        el = el.nextSibling
      }
      return op.join(',')
    }

    tag.unmount()
  })

  it('Passing options to the compiler through compile (v2.3.12)', function () {
    var str = '<passing-options>\n  <p>\n  <\/p>\nclick(e){}\n<\/passing-options>',
      result = compile(str, true, {compact: true, type: 'none'})
    expect(result).to.contain('<p></p>')          // compact: true
    expect(result).to.contain('\nclick(e){}\n')   // type: none
  })

  // scoped-css is deprecated, this test must be changed in future versions
  it('Using the `style` for set the CSS parser through compile (v2.3.12)', function () {
    var str = '<style-option><style>p {top:0}<\/style>\n<\/style-option>',
      result
    result = compile(str, {'style': 'scoped-css'})
    expect(result).to.match(/\[(?:data-is)="style-option"\] p ?\{top:0\}/)
  })

  it('allow passing riot.observale instances to the children tags', function() {
    var tag = riot.mount('observable-attr')[0]
    expect(tag.tags['observable-attr-child'].wasTriggered).to.be.equal(true)
    tag.unmount()
  })

  it('loops get rendered correctly also when riot.brackets get changed', function() {

    // change the brackets
    riot.settings.brackets = '{{ }}'
    var tag = riot.mount('loop-double-curly-brackets')[0],
      ps = tag.root.getElementsByTagName('p')

    expect(ps.length).to.be.equal(2)
    expect(ps[0].innerHTML).to.be.equal(ps[1].innerHTML)
    expect(ps[0].innerHTML).to.be.equal('hello')
    tag.change()
    expect(ps.length).to.be.equal(2)
    expect(ps[0].innerHTML).to.be.equal(ps[1].innerHTML)
    expect(ps[0].innerHTML).to.be.equal('hello world')

    tag.unmount()

  })

  it('compile detect changes in riot.settings.brackets', function() {
    var compiled

    // change the brackets
    riot.util.brackets.set('{{ }}')
    expect(riot.settings.brackets).to.be.equal('{{ }}')
    compiled = compile('<my>{{ time }} and { time }</my>', true)
    expect(compiled).to.contain("riot.tag2('my', '{{time}} and { time }',")

    // restore using riot.settings
    riot.settings.brackets = defaultBrackets
    compiled = compile('<my>{ time } and { time }</my>', true)
    expect(riot.util.brackets.settings.brackets).to.be.equal(defaultBrackets)
    expect(compiled).to.contain("riot.tag2('my', '{time} and {time}',")

    // change again, now with riot.settings
    riot.settings.brackets = '{{ }}'
    compiled = compile('<my>{{ time }} and { time }</my>', true)
    expect(riot.util.brackets.settings.brackets).to.be.equal('{{ }}')
    expect(compiled).to.contain("riot.tag2('my', '{{time}} and { time }',")

    riot.util.brackets.set(undefined)
    expect(riot.settings.brackets).to.be.equal(defaultBrackets)
    compiled = compile('<my>{ time } and { time }</my>', true)
    expect(compiled).to.contain("riot.tag2('my', '{time} and {time}',")
  })

  it('loops correctly on array subclasses', function() {
    var tag = riot.mount('loop-arraylike')[0],
      root = tag.root
    expect(normalizeHTML(root.getElementsByTagName('div')[0].innerHTML))
      .to.be.equal('<p>0 = zero</p><p>1 = one</p><p>2 = two</p><p>3 = three</p>')
    tag.unmount()
  })

  it('each custom tag with an if', function() {
    defineTag('<inner><br></inner>')
    var tag = makeTag(`
      <inner each={item in items} if={cond} />
      this.items = [1]
      this.cond = true
    `)
    expectHTML(tag).to.be.equal('<inner><br></inner>')

    tag.update({cond: false})
    expectHTML(tag).to.be.equal('')
    expect(tag.tags.inner).to.be.equal(undefined)

    tag.update({cond: true})
    expectHTML(tag).to.be.equal('<inner><br></inner>')
    expect(tag.tags.inner).not.to.be.equal(undefined)
  })

  it('each anonymous with an if', function() {
    var tag = makeTag(`
      <div each={item, i in items} if={item.cond}>{i}</div>
      this.items = [{cond: true}, {cond: false}]
    `)
    expectHTML(tag).to.be.equal('<div>0</div>')
    tag.items[1].cond = true
    tag.update()
    expectHTML(tag).to.be.equal('<div>0</div><div>1</div>')
  })
  it('virtual tags mount inner content and not the virtual tag root', function() {
    var tag = riot.mount('loop-virtual')[0],
      els = tag.root.children

    expect(els[0].tagName).to.be.equal('DT')
    expect(els[0].innerHTML).to.be.equal('Coffee')
    expect(els[1].tagName).to.be.equal('DD')
    expect(els[1].innerHTML).to.be.equal('Black hot drink')
    expect(els[2].tagName).to.be.equal('DT')
    expect(els[2].innerHTML).to.be.equal('Milk')
    expect(els[3].tagName).to.be.equal('DD')
    expect(els[3].innerHTML).to.be.equal('White cold drink')

    tag.data.reverse()
    tag.update()

    expect(els[2].tagName).to.be.equal('DT')
    expect(els[2].innerHTML).to.be.equal('Coffee')
    expect(els[3].tagName).to.be.equal('DD')
    expect(els[3].innerHTML).to.be.equal('Black hot drink')
    expect(els[0].tagName).to.be.equal('DT')
    expect(els[0].innerHTML).to.be.equal('Milk')
    expect(els[1].tagName).to.be.equal('DD')
    expect(els[1].innerHTML).to.be.equal('White cold drink')

    tag.data.unshift({ key: 'Tea', value: 'Hot or cold drink' })
    tag.update()
    expect(els[0].tagName).to.be.equal('DT')
    expect(els[0].innerHTML).to.be.equal('Tea')
    expect(els[1].tagName).to.be.equal('DD')
    expect(els[1].innerHTML).to.be.equal('Hot or cold drink')
    tag.unmount()

    injectHTML('<loop-virtual-reorder></loop-virtual-reorder>')

    var tag2 = riot.mount('loop-virtual-reorder')[0],
      els2 = tag2.root.children

    els2[0].setAttribute('test', 'ok')
    expect(els2[0].getAttribute('test')).to.be.equal('ok')
    expect(els2[0].tagName).to.be.equal('DT')
    expect(els2[0].innerHTML).to.be.equal('Coffee')
    expect(els2[1].tagName).to.be.equal('DD')
    expect(els2[1].innerHTML).to.be.equal('Black hot drink')
    expect(els2[2].tagName).to.be.equal('DT')
    expect(els2[2].innerHTML).to.be.equal('Milk')
    expect(els2[3].tagName).to.be.equal('DD')
    expect(els2[3].innerHTML).to.be.equal('White cold drink')

    tag2.data.reverse()
    tag2.update()

    expect(els2[2].getAttribute('test')).to.be.equal('ok')
    expect(els2[2].tagName).to.be.equal('DT')
    expect(els2[2].innerHTML).to.be.equal('Coffee')
    expect(els2[3].tagName).to.be.equal('DD')
    expect(els2[3].innerHTML).to.be.equal('Black hot drink')
    expect(els2[0].tagName).to.be.equal('DT')
    expect(els2[0].innerHTML).to.be.equal('Milk')
    expect(els2[1].tagName).to.be.equal('DD')
    expect(els2[1].innerHTML).to.be.equal('White cold drink')
    tags.push(tag2)


  })

  it('mount search data-is attributes for tag names only #1463', function () {
    var
      names = ['x-my_tag1', 'x-my-tag2', 'x-my-3tag', 'x-m1-3tag'],
      templ = '<@>X</@>',
      i, el, tag, name

    // test browser capability for match unquoted chars in [-_A-Z]
    for (i = 0; i < names.length; ++i) {
      el = appendTag('div', {'data-is': names[i]})
      compile(templ.replace(/@/g, names[i]))
      tag = riot.mount(names[i])[0]
      tag = $('*[data-is=' + names[i] + ']')
      expect(tag.innerHTML).to.be.equal('X')
      tag.unmount()
    }

    // double quotes work, we can't mount html element named "22"
    name = 'x-my-tag3'
    el = appendTag(name, {name: '22'})
    compile(templ.replace(/@/g, name))
    tag = riot.mount('*[name="22"]')[0]
    tag = $(name)
    expect(tag.innerHTML).to.be.equal('X')
    tag.unmount()
  })

  it('nested virtual tags unmount properly', function() {
    injectHTML('<virtual-nested-unmount></virtual-nested-unmount>')
    var tag = riot.mount('virtual-nested-unmount')[0]
    var spans = tag.root.querySelectorAll('span')
    var divs = tag.root.querySelectorAll('div')
    expect(spans.length).to.be.equal(6)
    expect(divs.length).to.be.equal(3)
    expect(spans[0].innerHTML).to.be.equal('1')
    expect(spans[1].innerHTML).to.be.equal('1')
    expect(spans[2].innerHTML).to.be.equal('2')
    expect(spans[3].innerHTML).to.be.equal('1')
    expect(spans[4].innerHTML).to.be.equal('2')
    expect(spans[5].innerHTML).to.be.equal('3')
    expect(divs[0].innerHTML).to.be.equal('1')
    expect(divs[1].innerHTML).to.be.equal('2')
    expect(divs[2].innerHTML).to.be.equal('3')

    tag.childItems = [
      {title: '4', childchildItems: ['1', '2', '3', '4']},
      {title: '5', childchildItems: ['1', '2', '3', '4', '5']}
    ]
    tag.update()
    spans = tag.root.querySelectorAll('span')
    divs = tag.root.querySelectorAll('div')
    expect(spans.length).to.be.equal(9)
    expect(divs.length).to.be.equal(2)
    expect(spans[0].innerHTML).to.be.equal('1')
    expect(spans[1].innerHTML).to.be.equal('2')
    expect(spans[2].innerHTML).to.be.equal('3')
    expect(spans[3].innerHTML).to.be.equal('4')
    expect(spans[4].innerHTML).to.be.equal('1')
    expect(spans[5].innerHTML).to.be.equal('2')
    expect(spans[6].innerHTML).to.be.equal('3')
    expect(spans[7].innerHTML).to.be.equal('4')
    expect(spans[8].innerHTML).to.be.equal('5')
    expect(divs[0].innerHTML).to.be.equal('4')
    expect(divs[1].innerHTML).to.be.equal('5')

    tag.unmount()
  })

  it('still loops with reserved property names #1526', function() {
    var tag = riot.mount('reserved-names')[0]
    tag.reorder()
    tag.update()
    tag.reorder()
    tag.update()
    tag.unmount()
  })

  it('named elements in object key loop do not duplicate', function() {

    var tag = riot.mount('obj-key-loop')[0]

    expect(tag.x.value).to.be.equal('3')
    expect(tag.y.value).to.be.equal('44')
    expect(tag.z.value).to.be.equal('23')

    tag.update()
    expect(tag.x.value).to.be.equal('3')
    expect(tag.y.value).to.be.equal('44')
    expect(tag.z.value).to.be.equal('23')

    tag.unmount()
  })

  it('render tag: input,option,textarea tags having expressions as value', function() {
    injectHTML('<form-controls></form-controls>')
    var val = 'my-value',
      tag = riot.mount('form-controls', { text: val })[0],
      root = tag.root

    expect(root.querySelector('input[type="text"]').value).to.be.equal(val)
    expect(root.querySelector('select option[selected]').value).to.be.equal(val)
    expect(root.querySelector('textarea[name="txta1"]').value).to.be.equal(val)
    expect(root.querySelector('textarea[name="txta2"]').value).to.be.equal('')
    if (IE_VERSION !== 9) expect(root.querySelector('textarea[name="txta2"]').placeholder).to.be.equal(val)

    tag.unmount()
  })

  it('support `data-is` for html5 compliance', function() {
    injectHTML('<div data-is="tag-data-is"></div>')
    var tag = riot.mount('tag-data-is')[0]
    var els = tag.root.getElementsByTagName('p')
    expect(els.length).to.be.equal(2)
    expect(els[0].innerHTML).to.contain('html5')
    expect(els[1].innerHTML).to.contain('too')
    tag.unmount()
  })

  it('tag names are case insensitive (converted to lowercase) in `riot.mount`', function() {
    var i, els = document.querySelectorAll('tag-data-is,[data-is="tag-data-is"]')
    for (i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i])
    }
    injectHTML('<div data-is="tag-data-is"></div>')
    injectHTML('<tag-DATA-Is></tag-DATA-Is>')
    var tags = riot.mount('tag-Data-Is')

    expect(tags.length).to.be.equal(2)
    expect(tags[0].root.getElementsByTagName('p').length).to.be.equal(2)
    expect(tags[1].root.getElementsByTagName('p').length).to.be.equal(2)
    tags.push(tags[0], tags[1])
  })

  it('the value of the `data-is` attribute needs lowercase names', function() {
    var i, els = document.querySelectorAll('tag-data-is,[data-is="tag-data-is"]')
    for (i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i])
    }
    injectHTML('<div data-is="tag-DATA-Is"></div>')
    var tags = riot.mount('tag-Data-Is')

    expect(tags.length).to.be.equal(0)
  })

  it('component nested in virtual unmounts correctly', function() {
    injectHTML('<virtual-nested-component></virtual-nested-component>')
    var tag = riot.mount('virtual-nested-component')[0]
    var components = tag.root.querySelectorAll('not-virtual-component2')
    expect(components.length).to.be.equal(4)

    tag.unmount()
    components = tag.root.querySelectorAll('not-virtual-component2')
    expect(components.length).to.be.equal(0)

    tag.unmount()

  })

  it('non looped and conditional virtual tags mount content', function() {
    injectHTML('<virtual-no-loop></virtual-no-loop>')
    var tag = riot.mount('virtual-no-loop')[0]

    var virts = tag.root.querySelectorAll('virtual')
    expect(virts.length).to.be.equal(0)

    var spans = tag.root.querySelectorAll('span')
    var divs = tag.root.querySelectorAll('div')
    expect(spans.length).to.be.equal(2)
    expect(divs.length).to.be.equal(2)
    expect(spans[0].innerHTML).to.be.equal('if works text')
    expect(divs[0].innerHTML).to.be.equal('yielded text')
    expect(spans[1].innerHTML).to.be.equal('virtuals yields expression')
    expect(divs[1].innerHTML).to.be.equal('hello there')


    tag.unmount()
  })

  it('virtual tags with yielded content function in a loop', function() {
    injectHTML('<virtual-yield-loop></virtual-yield-loop>')
    var tag = riot.mount('virtual-yield-loop')[0]
    var spans = tag.root.querySelectorAll('span')

    expect(spans[0].innerHTML).to.be.equal('one')
    expect(spans[1].innerHTML).to.be.equal('two')
    expect(spans[2].innerHTML).to.be.equal('three')

    tag.items.reverse()
    tag.update()

    spans = tag.root.querySelectorAll('span')

    expect(spans[0].innerHTML).to.be.equal('three')
    expect(spans[1].innerHTML).to.be.equal('two')
    expect(spans[2].innerHTML).to.be.equal('one')

    tag.unmount()
  })

  it('data-is can be dynamically created by expression', function() {
    injectHTML('<dynamic-data-is></dynamic-data-is>')
    var tag = riot.mount('dynamic-data-is')[0]
    var divs = tag.root.querySelectorAll('div')
    expect(divs[0].querySelector('input').getAttribute('type')).to.be.equal('color')
    expect(divs[1].querySelector('input').getAttribute('type')).to.be.equal('color')
    expect(divs[2].querySelector('input').getAttribute('type')).to.be.equal('date')
    expect(divs[3].querySelector('input').getAttribute('type')).to.be.equal('date')

    tag.single = 'color'
    tag.update()
    expect(divs[3].querySelector('input').getAttribute('type')).to.be.equal('color')

    tag.intags.reverse()
    tag.update()
    divs = tag.root.querySelectorAll('div')
    expect(divs[0].querySelector('input').getAttribute('type')).to.be.equal('date')
    expect(divs[1].querySelector('input').getAttribute('type')).to.be.equal('color')
    expect(divs[2].querySelector('input').getAttribute('type')).to.be.equal('color')


    tag.unmount()
  })
})
