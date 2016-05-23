import {
  injectHTML,
  $,
  $$,
  normalizeHTML,
  appendTag,
  getRiotStyles,
  makeTag,
  defineTag
} from '../../helpers/index'
import riot from 'riot'

// include special tags to test specific features
import '../../tag/v-dom-1.tag'
import '../../tag/v-dom-2.tag'
import '../../tag/timetable.tag'
import '../../tag/nested-child.tag'
import '../../tag/top-attributes.tag'
import '../../tag/preserve-attr.tag'
import '../../tag/named-child.tag'
import '../../tag/deferred-mount.tag'
import '../../tag/prevent-update.tag'

const expect = chai.expect

describe('Riot core', function() {
  it('Riot exists', function () {
    expect(riot).to.be.not.undefined
  })

  before(function() {
    // general tag
    riot.tag('test', '<p>val: { opts.val }<\/p>')
  })

  it('populates the vdom property correctly on riot global', function() {
    injectHTML('<v-dom-1></v-dom-1>')
    injectHTML('<v-dom-2></v-dom-2>')
    var tags = riot.mount('v-dom-1, v-dom-2')

    expect(tags.length).to.be.equal(2)
    expect(riot.vdom).to.have.length(tags.length)
    riot.vdom.forEach(function(tag, i) {
      expect(tag).to.be.equal(tags[i])
    })
    tags.forEach(tag => tag.unmount())
  })

  it('mount and unmount', function() {

    injectHTML([
      '<test id="test-tag"></test>',
      '<div id="foo"></div>',
      '<div id="bar"></div>'
    ])

    var tag = riot.mount('test', { val: 10 })[0],
      tag2 = riot.mount('#foo', 'test', { val: 30 })[0],
      tag3 = riot.mount(document.getElementById('bar'), 'test', { val: 50 })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')
    expect(normalizeHTML(tag2.root.innerHTML)).to.be.equal('<p>val: 30</p>')
    expect(normalizeHTML(tag3.root.innerHTML)).to.be.equal('<p>val: 50</p>')

    tag.unmount()
    tag2.unmount()
    tag3.unmount(true)

    expect(tag3.isMounted).to.be.equal(false)

    expect(document.body.getElementsByTagName('test').length).to.be.equal(0)
    expect(document.getElementById('foo')).to.be.equal(null)
    expect(document.getElementById('bar')).to.not.be.equal(null)

    expect(tag.root._tag).to.be.equal(undefined)
    expect(tag2.root._tag).to.be.equal(undefined)
    expect(tag3.root._tag).to.be.equal(undefined)

  })

  it('mount a tag mutiple times', function() {

    injectHTML([
       // mount the same tag multiple times
      '<div id="multi-mount-container-1"></div>',

    ])

    var tag = riot.mount('#multi-mount-container-1', 'test', { val: 300 })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 300</p>')

    riot.tag('test-h', '<p>{ x }</p>', function() { this.x = 'ok'})

    tag = riot.mount('#multi-mount-container-1', 'test-h')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')

    tag.unmount()

  })

  it('compiles and unmount the children tags', function(done) {

    injectHTML('<timetable></timetable>')

    this.timeout(5000)

    var ticks = 0,
      tag = riot.mount('timetable', {
        start: 0,
        ontick: function() {
          ticks++
        }
      })[0]

    expect($$('timer', tag.root).length).to.be.equal(3)

    riot.update()

    expect(tag.tags.foo).to.not.be.equal(undefined)

    tag.unmount()

    // no time neither for one tick
    // because the tag got unMounted too early
    setTimeout(function() {
      expect(ticks).to.be.equal(0)
      done()
    }, 1200)

  })

  it('mount a tag mutiple times using "*"', function() {

    injectHTML([
      // multple mount using *
      '<div id="multi-mount-container-2">',
      '    <test-i></test-i>',
      '    <test-l></test-l>',
      '    <test-m></test-m>',
      '<\/div>'
    ])

    riot.tag('test-i', '<p>{ x }</p>', function() { this.x = 'ok'})
    riot.tag('test-l', '<p>{ x }</p>', function() { this.x = 'ok'})
    riot.tag('test-m', '<p>{ x }</p>', function() { this.x = 'ok'})

    var subTags = riot.mount('#multi-mount-container-2', '*')

    expect(subTags.length).to.be.equal(3)

    subTags = riot.mount(document.getElementById('multi-mount-container-2'), '*')

    expect(subTags.length).to.be.equal(3)

    subTags.forEach(tag => tag.unmount())

  })

  it('the mount method could be triggered also on several tags using a NodeList instance', function() {

    injectHTML([
      '<multi-mount value="1"></multi-mount>',
      '<multi-mount value="2"></multi-mount>',
      '<multi-mount value="3"></multi-mount>',
      '<multi-mount value="4"></multi-mount>'
    ])

    riot.tag('multi-mount', '{ opts.value }')

    var multipleTags = riot.mount(document.querySelectorAll('multi-mount'))

    expect(multipleTags[0].root.innerHTML).to.be.equal('1')
    expect(multipleTags[1].root.innerHTML).to.be.equal('2')
    expect(multipleTags[2].root.innerHTML).to.be.equal('3')
    expect(multipleTags[3].root.innerHTML).to.be.equal('4')

    var i = multipleTags.length

    multipleTags.forEach(tag => tag.unmount())
  })


  it('all the nested tags will are correctly pushed to the parent.tags property', function() {

    injectHTML('<nested-child></nested-child>')

    var tag = riot.mount('nested-child')[0],
      root = tag.root

    expect(tag.tags.child.length).to.be.equal(6)
    expect(tag.tags['another-nested-child']).to.be.an('object')
    tag.tags.child[0].unmount()
    expect(tag.tags.child.length).to.be.equal(5)
    tag.tags['another-nested-child'].unmount()
    expect(tag.tags['another-nested-child']).to.be.equal(undefined)

    tag.unmount()

  })

  it('brackets', function() {

    injectHTML([
      '<test-a></test-a>',
      '<test-b></test-b>',
      '<test-c></test-c>',
      '<test-d></test-d>',
      '<test-e></test-e>',
      '<test-f></test-f>',
      '<test-g></test-g>'
    ])

    var tag

    riot.settings.brackets = '[ ]'
    riot.tag('test-a', '<p>[ x ]</p>', function() { this.x = 'ok'})
    tag = riot.mount('test-a')[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')
    tag.unmount()

    riot.settings.brackets = '${ }'
    riot.tag('test-c', '<p>${ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-c')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')
    tag.unmount()

    riot.settings.brackets = null
    riot.tag('test-d', '<p>{ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-d')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')
    tag.unmount()

    riot.settings.brackets = '[ ]'
    riot.tag('test-e', '<p>[ x ]</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-e')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')
    tag.unmount()

    riot.settings.brackets = '${ }'
    riot.tag('test-f', '<p>${ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-f')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')
    tag.unmount()

    riot.settings.brackets = null
    riot.tag('test-g', '<p>{ x }</p>', function() { this.x = 'ok' })
    tag = riot.mount('test-g')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>ok</p>')
    tag.unmount()

  })

  it('data-is attribute', function() {

    injectHTML('<div id="rtag" data-is="rtag"><\/div>')
    riot.tag('rtag', '<p>val: { opts.val }</p>')

    var tag = riot.mount('#rtag', { val: 10 })[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')

    tag.unmount()
    expect(document.body.getElementsByTagName('rtag').length).to.be.equal(0)

    tag.unmount()

  })

  it('data-is attribute by tag name', function() {

    // data-is attribute by tag name

    riot.tag('rtag2', '<p>val: { opts.val }</p>')

    injectHTML('<div data-is="rtag2"></div>')

    var tag = riot.mount('rtag2', { val: 10 })[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')

    tag.unmount()
    expect(document.body.querySelectorAll('rtag2').length).to.be.equal(0)

  })


  it('data-is attribute using the "*" selector', function() {

    injectHTML([
      '<div id="rtag-nested">',
      '  <div data-is="rtag"></div>',
      '  <div data-is="rtag"></div>',
      '  <div data-is="rtag"></div>',
      '</div>'
    ])

    var subTags = riot.mount('#rtag-nested', '*', { val: 10 })

    expect(subTags.length).to.be.equal(3)

    expect(normalizeHTML(subTags[0].root.innerHTML)).to.be.equal('<p>val: 10</p>')
    expect(normalizeHTML(subTags[1].root.innerHTML)).to.be.equal('<p>val: 10</p>')
    expect(normalizeHTML(subTags[2].root.innerHTML)).to.be.equal('<p>val: 10</p>')

    subTags.forEach(tag => tag.unmount())

  })


  it('top level attr manipulation', function() {

    injectHTML('<top-level-attr value="initial"></top-level-attr>')

    riot.tag('top-level-attr', '{opts.value}')

    var tag = riot.mount('top-level-attr')[0]

    tag.root.setAttribute('value', 'changed')
    tag.update()

    expect(tag.root.innerHTML).to.be.equal('changed')

    tag.unmount()
  })


  it('top level attr manipulation having expression', function() {

    injectHTML('<top-level-attr></top-level-attr>')

    riot.tag('top-level-attr', '{opts.value}')

    var tag = riot.mount('top-level-attr')[0]

    tag.root.setAttribute('value', '{1+1}')
    tag.update()

    expect(tag.root.innerHTML).to.be.equal('2')

    tag.unmount()

  })

  it('preserve attributes from tag definition', function() {


    injectHTML('<preserve-attr></preserve-attr><div data-is="preserve-attr2"></div>')

    var tag = riot.mount('preserve-attr')[0]
    expect(tag.root.className).to.be.equal('single-quote')
    var tag2 = riot.mount('preserve-attr2')[0]
    expect(tag2.root.className).to.be.equal('double-quote')
    tag.unmount()
    tag2.unmount()
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

  it('preserve the mount order, first the parent and then all the children', function() {

    injectHTML('<deferred-mount></deferred-mount>')

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

    injectHTML('<prevent-update></prevent-update>')

    var tag = riot.mount('prevent-update')[0]

    expect(tag['fancy-name'].innerHTML).to.be.equal('john')

    tag.root.getElementsByTagName('p')[0].onclick({})

    expect(tag['fancy-name'].innerHTML).to.be.equal('john')

    tag.unmount()
  })

  it('the before events get triggered', function() {
    injectHTML('<before-events></before-events>')
    var tag,
      incrementEvents = sinon.spy()

    riot.tag('before-events', '', function() {
      this.on('before-mount', incrementEvents)
      this.on('before-unmount', incrementEvents)
    })
    tag = riot.mount(document.createElement('before-events'))[0]
    tag.unmount()
    expect(incrementEvents).to.have.been.calledTwice
  })



/*
  TODO: this test should not rely on the compiler!
  it('event handler on each custom tag doesnt update parent', function() {
    defineTag(`
    <inner>
      <button id='btn' onclick={foo} />
      foo() {}
    </inner>
    `)

    var tag = makeTag(`
      <inner each={item in items} />
      this.items = [1]
      this.updateCount = 0
      this.on('update', function() { this.updateCount++ })
    `)

    expect(tag.updateCount).to.be.equal(0)
    tag.tags.inner[0].btn.onclick({})
    expect(tag.updateCount).to.be.equal(0)
    tag.unmount()

  })

*/


})