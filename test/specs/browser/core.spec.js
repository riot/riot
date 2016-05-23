import {
  injectHTML,
  $,
  $$,
  normalizeHTML,
  appendTag,
  getRiotStyles
} from '../../helpers/index'
import riot from 'riot'

// include special tags to test specific features
import '../../tag/v-dom-1.tag'
import '../../tag/v-dom-2.tag'
import '../../tag/timetable.tag'

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

      // multple mount using *
      '<div id="multi-mount-container-2">',
      '    <test-i></test-i>',
      '    <test-l></test-l>',
      '    <test-m></test-m>',
      '<\/div>'
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

})