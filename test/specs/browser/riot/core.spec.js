import {
  injectHTML,
  $,
  $$,
  IE_VERSION,
  normalizeHTML,
  fireEvent,
  getCarrotPos,
  setCarrotPos
} from '../../../helpers/index'

// include special tags to test specific features
import '../../../tag/v-dom-1.tag'
import '../../../tag/v-dom-2.tag'
import '../../../tag/timetable.tag'
import '../../../tag/nested-child.tag'
import '../../../tag/top-attributes.tag'
import '../../../tag/preserve-attr.tag'
import '../../../tag/svg-attr.tag'
import '../../../tag/named-child.tag'
import '../../../tag/deferred-mount.tag'
import '../../../tag/prevent-update.tag'
import '../../../tag/expression-eval-count.tag'
import '../../../tag/multi-named.tag'
import '../../../tag/named-data-ref.tag'
import '../../../tag/input-number.tag'
import '../../../tag/input-values.tag'
import '../../../tag/input-updated.tag'
import '../../../tag/nested-riot.tag'
import '../../../tag/treeview.tag'
import '../../../tag/events.tag'
import '../../../tag/runtime-event-listener-switch.tag'
import '../../../tag/should-update.tag'
import '../../../tag/should-update-opts.tag'
import '../../../tag/observable-attr.tag'
import '../../../tag/virtual-nested-unmount.tag'
import '../../../tag/virtual-conditional.tag'
import '../../../tag/form-controls.tag'
import '../../../tag/data-is.tag'
import '../../../tag/virtual-nested-component.tag'
import '../../../tag/dynamic-data-is.tag'
import '../../../tag/update-context.tag'
import '../../../tag/dynamic-virtual.tag'
import '../../../tag/multiple-select.tag'
import '../../../tag/dynamic-nested.tag'

describe('Riot core', function() {
  it('Riot exists', function () {
    expect(riot).to.be.not.undefined
  })

  before(function() {
    // general tag
    riot.tag('test', '<p>val: { opts.val }</p>')
  })

  it('it should export the current riot build version as string', function() {
    expect(riot.version).to.be.a('string')
  })

  it('populates the vdom property correctly on riot global', function() {
    injectHTML('<v-dom-1></v-dom-1>')
    injectHTML('<v-dom-2></v-dom-2>')
    var tags = riot.mount('v-dom-1, v-dom-2')

    expect(tags.length).to.be.equal(2)
    expect(riot.util.vdom).to.have.length(tags.length)
    riot.util.vdom.forEach(function(tag, i) {
      expect(tag).to.be.equal(tags[i])
    })
    tags.forEach(tag => tag.unmount())
  })

  it('riot can be extended', function() {
    riot.route = function() {}

    expect(riot.route).to.be.a('function')

    riot.util.tmpl.errorHandle = function() {}

    expect(riot.util.tmpl.errorHandle).to.be.a('function')
  })

  it('mount and unmount', function() {

    injectHTML([
      '<test id="test-tag"></test>',
      '<div id="foo"></div>',
      '<div id="bar"></div>'
    ])

    var tag = riot.mount('test', { val: 10 })[0],
      tag2 = riot.mount('#foo', 'test', { val: 30 })[0],
      tag3 = riot.mount($('#bar'), 'test', { val: 50 })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')
    expect(normalizeHTML(tag2.root.innerHTML)).to.be.equal('<p>val: 30</p>')
    expect(normalizeHTML(tag3.root.innerHTML)).to.be.equal('<p>val: 50</p>')

    tag.unmount()
    tag2.unmount()
    tag3.unmount(true)

    expect(tag3.isMounted).to.be.equal(false)

    expect($$('test').length).to.be.equal(0)
    expect($('#foo')).to.be.equal(null)
    expect($('#bar')).to.not.be.equal(null)

    expect(tag.root._tag).to.be.equal(undefined)
    expect(tag2.root._tag).to.be.equal(undefined)
    expect(tag3.root._tag).to.be.equal(undefined)

    tag3.root.parentNode.removeChild(tag3.root)

  })

  it('node should not preserve attributes from tag mounted on it when it is unmounted', function() {
    injectHTML('<div id="node"></div>')

    var tag = riot.mount('#node', 'top-attributes', { cls: 'test' })[0]

    expect(tag.root.hasAttribute('class')).to.be.equal(true)
    expect(tag.root.hasAttribute('style')).to.be.equal(true)
    expect(tag.root.hasAttribute('data-nqlast')).to.be.equal(true)

    tag.unmount()

    expect(tag.root.hasAttribute('class')).to.be.equal(false)
    expect(tag.root.hasAttribute('style')).to.be.equal(false)
    expect(tag.root.hasAttribute('data-nqlast')).to.be.equal(false)
  })

  it('mount a tag mutiple times', function() {

    injectHTML([
      // mount the same tag multiple times
      '<div id="multi-mount-container-1"></div>'

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
      '</div>'
    ])

    riot.tag('test-i', '<p>{ x }</p>', function() { this.x = 'ok'})
    riot.tag('test-l', '<p>{ x }</p>', function() { this.x = 'ok'})
    riot.tag('test-m', '<p>{ x }</p>', function() { this.x = 'ok'})

    const container = $('#multi-mount-container-2')
    var subTags = riot.mount('#multi-mount-container-2', '*')

    expect(subTags.length).to.be.equal(3)

    subTags = riot.mount(container, '*')

    expect(subTags.length).to.be.equal(3)

    subTags.forEach(tag => tag.unmount())
    container.parentNode.removeChild(container)
  })

  it('an <option> tag having the attribute "selected" should be the value of the parent <select> tag', function() {
    injectHTML('<tmp-select-tag></tmp-select-tag>')

    riot.tag('tmp-select-tag', `
    <select ref='select'>
      <option value="1" selected="{v == 1}">1</option>
      <option value="2" selected="{v == 2}">2</option>
      <option value="3" selected="{v == 3}">3</option>
    </select>`,
      function() {
        this.v = 2
      })

    var tag = riot.mount('tmp-select-tag')[0]

    expect(tag.refs.select.selectedIndex).to.be.equal(1)

    tag.unmount()
    riot.unregister('tmp-select-tag')
  })

  it('the mount method could be triggered also on several tags using a NodeList instance', function() {

    injectHTML([
      '<multi-mount value="1"></multi-mount>',
      '<multi-mount value="2"></multi-mount>',
      '<multi-mount value="3"></multi-mount>',
      '<multi-mount value="4"></multi-mount>'
    ])

    riot.tag('multi-mount', '{ opts.value }')

    var multipleTags = riot.mount($$('multi-mount'))

    expect(multipleTags[0].root.innerHTML).to.be.equal('1')
    expect(multipleTags[1].root.innerHTML).to.be.equal('2')
    expect(multipleTags[2].root.innerHTML).to.be.equal('3')
    expect(multipleTags[3].root.innerHTML).to.be.equal('4')

    multipleTags.forEach(tag => tag.unmount())
  })


  it('all the nested tags will are correctly pushed to the parent.tags property', function() {

    injectHTML('<nested-child></nested-child>')

    var tag = riot.mount('nested-child')[0]

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

  it('the case of attributes prefixed with riot should be leaved untouched', function() {
    riot.tag('crazy-svg', `
      <svg preserveAspectRatio="xMinYMax meet" riot-viewBox="{'0 0 300 300'}">
        <circle riot-cx="{ 5 }" riot-cy="{ 5 }" r="2" fill="black"></circle>
      </svg>
    `)

    injectHTML('<crazy-svg></crazy-svg>')

    var tag = riot.mount('crazy-svg')[0]

    expect($('svg', tag.root).getAttribute('viewBox')).to.be.equal('0 0 300 300')
    expect($('svg', tag.root).getAttribute('preserveAspectRatio')).to.be.equal('xMinYMax meet')

    tag.unmount()
  })

  it('data-is attribute', function() {
    injectHTML('<div id="rtag" data-is="rtag"></div>')
    riot.tag('rtag', '<p>val: { opts.val }</p>')

    var tag = riot.mount('#rtag', { val: 10 })[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')

    tag.unmount()
    expect($$('rtag').length).to.be.equal(0)

    tag.unmount()
  })

  it('the data-is attribute is preserved in case of unmount', function() {
    injectHTML('<div id="rtag" data-is="rtag"></div>')
    riot.tag('rtag', '<p>val: { opts.val }</p>')

    var tag = riot.mount('#rtag', { val: 10 })[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')

    tag.unmount(true)
    expect(tag.root.getAttribute('data-is')).to.be.ok
    tag.root.parentNode.removeChild(tag.root)
  })

  it('data-is can be dynamically created by expression', function() {
    injectHTML('<dynamic-data-is></dynamic-data-is>')
    var tag = riot.mount('dynamic-data-is')[0]
    var divs = $$('div', tag.root)
    expect($('input', divs[0]).getAttribute('type')).to.be.equal('color')
    expect($('input', divs[0]).getAttribute('name')).to.be.equal('aaa')
    expect($('input', divs[1]).getAttribute('type')).to.be.equal('color')
    expect($('input', divs[2]).getAttribute('type')).to.be.equal('date')
    expect($('input', divs[3]).getAttribute('type')).to.be.equal('date')
    expect($('input', divs[3]).getAttribute('name')).to.be.equal('calendar')
    expect(tag.tags['dynamic-data-toggle']).to.be.an('object')


    tag.single = 'color'
    tag.toggle = false
    tag.intags[0].name = 'ddd'
    tag.update()
    expect($('input', divs[3]).getAttribute('type')).to.be.equal('color')
    expect($('input', divs[3]).getAttribute('name')).to.be.equal('color')
    expect(tag.tags['dynamic-data-toggle']).to.be.equal(undefined)
    expect($('input', divs[0]).getAttribute('name')).to.be.equal('ddd')

    tag.intags.reverse()
    tag.toggle = true
    tag.update()
    divs = $$('div', tag.root)
    expect($('input', divs[0]).getAttribute('type')).to.be.equal('date')
    expect($('input', divs[1]).getAttribute('type')).to.be.equal('color')
    expect($('input', divs[2]).getAttribute('type')).to.be.equal('color')
    expect(tag.tags['dynamic-data-toggle']).to.be.an('object')

    tag.intags.splice(1, 1)
    tag.update()
    expect(tag.tags.color.length).to.be.equal(2) // single + remaining loop color
    expect(tag.tags.calendar).to.be.an('object')

    // below checks for strays
    tag.intags.reverse()
    tag.update()
    expect(tag.tags.color.length).to.be.equal(2)

    tag.intags.reverse()
    tag.update()
    expect(tag.tags.color.length).to.be.equal(2)

    // single tags as tag object and not array after delete

    tag.intags.splice(1, 1)
    tag.update()

    expect(tag.tags.color).to.be.an('object')

    tag.unmount()

  })

  it('support `data-is` for html5 compliance', function() {
    injectHTML('<div data-is="tag-data-is"></div>')
    var tag = riot.mount('tag-data-is')[0]
    var els = $$('p', tag.root)
    expect(els.length).to.be.equal(2)
    expect(els[0].innerHTML).to.contain('html5')
    expect(els[1].innerHTML).to.contain('too')
    tag.unmount()
  })

  it('`data-is` expressions will be evaluated only if they return a string', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', `
      <div data-is="{ tag }">
        <p>hello</p>
      </div>
    `)
    var tag = riot.mount('riot-tmp')[0]

    expect($('p', tag.root).innerHTML).to.be.equal('hello')

    tag.unmount()
  })

  it('tag names are case insensitive (converted to lowercase) in `riot.mount`', function() {
    var i, els = $$('tag-data-is,[data-is="tag-data-is"]')
    for (i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i])
    }
    injectHTML('<div data-is="tag-data-is"></div>')
    injectHTML('<tag-DATA-Is></tag-DATA-Is>')
    var tags = riot.mount('tag-Data-Is')

    expect(tags.length).to.be.equal(2)
    expect($$('p', tags[0].root).length).to.be.equal(2)
    expect($$('p', tags[1].root).length).to.be.equal(2)
    tags.push(tags[0], tags[1])
  })

  it('the data-is attribute gets updated if a DOM node gets mounted using two or more different tags', function() {

    var div = document.createElement('div')
    var tag1 = riot.mount(div, 'timetable')[0]
    expect(div.getAttribute('data-is')).to.be.equal('timetable')
    var tag2 = riot.mount(div, 'test')[0]
    expect(div.getAttribute('data-is')).to.be.equal('test')

    tag1.unmount()
    tag2.unmount()

  })

  it('the value of the `data-is` attribute needs lowercase names', function() {
    var i, els = $$('tag-data-is,[data-is="tag-data-is"]')
    for (i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i])
    }
    injectHTML('<div data-is="tag-DATA-Is"></div>')
    var tags = riot.mount('tag-Data-Is')

    expect(tags.length).to.be.equal(0)
  })

  it('data-is as expression', function() {
    injectHTML('<container-riot></container-riot>')
    var tag = riot.mount('container-riot')[0]
    var div = $('div', tag.root)
    expect(div.getAttribute('data-is')).to.be.equal('nested-riot')
    tag.unmount()
  })

  it('data-is attribute by tag name', function() {

    // data-is attribute by tag name

    riot.tag('rtag2', '<p>val: { opts.val }</p>')

    injectHTML('<div data-is="rtag2"></div>')

    var tag = riot.mount('rtag2', { val: 10 })[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>val: 10</p>')

    tag.unmount()
    expect($$('rtag2').length).to.be.equal(0)

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

  it('SVGs xlink attributes get correctly parsed', function() {
    injectHTML('<svg-attr></svg-attr>')
    var tag = riot.mount('svg-attr')[0]

    expect(tag.refs.target.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.be.equal(tag.href)
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

  it('static referenced tag for tags property', function() {
    injectHTML('<named-child-parent></named-child-parent>')
    var tag = riot.mount('named-child-parent')[0]
    expect(tag.refs['tags-child'].root.innerHTML).to.be.equal('I have a name')

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

    expect(tag.refs['fancy-name'].innerHTML).to.be.equal('john')

    fireEvent($$('p')[0], 'click')

    expect(tag.refs['fancy-name'].innerHTML).to.be.equal('john')

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

  it('the before mount event gets triggered before the component markup creation', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', `
      <p>{ flag }<p>
    `, function() {
        this.flag = true
        this.on('before-mount', () => {
          this.flag = false
        })
      })

    var tag = riot.mount('riot-tmp')[0]

    expect($('p', tag.root).innerHTML).to.be.equal('false')

    tag.unmount()
  })

  it('all the events get fired also in the loop tags, the e.item property gets preserved', function() {
    injectHTML('<events></events>')
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
      divTags = $$('div', tag.root)

    currentItem = tag.items[0]
    currentIndex = 0
    fireEvent(divTags[0], 'click')
    tag.items.reverse()
    tag.update()
    currentItem = tag.items[0]
    currentIndex = 0
    fireEvent(divTags[0], 'click')

    expect(callbackCalls).to.be.equal(2)

    tag.unmount()
  })

  it('event listeners can be switched in runtime without memory leaks', function() {
    injectHTML('<runtime-event-listener-switch></runtime-event-listener-switch>')
    var
      args = [],
      cb = function(name) {
        args.push(name)
      },
      tag = riot.mount('runtime-event-listener-switch', { cb })[0],
      pFirst = $('p.first', tag.root),
      pSecond = $('p.second', tag.root)

    fireEvent(pFirst, 'click')
    expect(args[0]).to.be.equal('ev1')
    fireEvent(pSecond, 'mouseenter')
    expect(args[1]).to.be.equal('ev2')
    fireEvent(pFirst, 'click')
    expect(args[2]).to.be.equal('ev1')
    fireEvent(pFirst, 'mouseenter')
    expect(args[3]).to.be.equal('ev2')

    expect(args.length).to.be.equal(4)

    tag.unmount()

  })

  it('don t\' skip the anonymous tags using the "riot.settings.skipAnonymousTags = false" option' , function(done) {
    riot.settings.skipAnonymousTags = false
    injectHTML('<anonymous-test></anonymous-test>')
    riot.mixin({
      init() {
        if (this.__.isAnonymous) {
          expect(this.on).to.be.ok
          done()
        }
      }
    })
    riot.tag('anonymous-test', '<div each="{ items }"></div>', function() {
      this.items = [1]
    })
    var tag = riot.mount('anonymous-test')[0]
    tag.unmount()
    riot.settings.skipAnonymousTags = true
  })

  it('the "updated" event gets properly triggered in a nested child', function(done) {
    injectHTML('<div id="updated-events-tester"></div>')
    var tag = riot.mount('#updated-events-tester', 'named-child-parent')[0],
      counter = 0

    tag.tags['named-child'].on('updated', function() {
      counter ++
      if (counter === 2) done()
    })

    tag.update()
    tag.tags['named-child'].update()

    tag.unmount()

  })

  it('only evalutes expressions once per update', function() {

    injectHTML('<expression-eval-count></expression-eval-count>')

    var tag = riot.mount('expression-eval-count')[0]
    expect(tag.count).to.be.equal(1)
    tag.update()
    expect(tag.count).to.be.equal(2)
    tag.unmount()
  })

  it('multi referenced elements to an array', function() {

    injectHTML('<multi-named></multi-named>')

    var mount = function() {
        var tag = this
        expect(tag.refs.rad[0].value).to.be.equal('1')
        expect(tag.refs.rad[1].value).to.be.equal('2')
        expect(tag.refs.rad[2].value).to.be.equal('3')
        expect(tag.refs.t.value).to.be.equal('1')
        expect(tag.refs.t_1.value).to.be.equal('1')
        expect(tag.refs.t_2.value).to.be.equal('2')
        expect(tag.refs.c[0].value).to.be.equal('1')
        expect(tag.refs.c[1].value).to.be.equal('2')
      },
      mountChild = function() {
        var tag = this
        expect(tag.refs.child.value).to.be.equal('child')
        expect(tag.refs.check[0].value).to.be.equal('one')
        expect(tag.refs.check[1].value).to.be.equal('two')
        expect(tag.refs.check[2].value).to.be.equal('three')

      }
    var tag = riot.mount('multi-named', { mount: mount, mountChild: mountChild })[0]

    tag.unmount()
  })


  it('input type=number', function() {

    injectHTML('<input-number></input-number>')

    var tag = riot.mount('input-number', {num: 123})[0]
    var inp = $('input', tag.root)
    expect(inp.getAttribute('type')).to.be.equal('number')
    expect(inp.value).to.be.equal('123')

    tag = riot.mount('input-number', {num: 0})[0]
    inp = $('input', tag.root)
    expect(inp.getAttribute('type')).to.be.equal('number')
    expect(inp.value).to.be.equal('0')

    tag = riot.mount('input-number', {num: null})[0]
    inp = $('input', tag.root)
    expect(inp.getAttribute('type')).to.be.equal('number')
    expect(inp.value).to.be.equal('')

    tag.unmount()

  })

  it('the input values should be updated corectly on any update call', function() {

    injectHTML('<input-values></input-values>')

    var tag = riot.mount('input-values')[0]
    expect(tag.refs.i.value).to.be.equal('hi')
    tag.update()
    expect(tag.refs.i.value).to.be.equal('foo')

    tag.unmount()
  })

  it('carrot position is preserved when input is same as calculated value', function() {

    injectHTML('<input-values></input-values>')

    var tag = riot.mount('input-values')[0]

    var newValue = 'some new text'
    tag.refs.i.value = newValue
    tag.refs.i.focus()
    setCarrotPos(tag.refs.i, 4)

    tag.message = newValue
    tag.update()

    expect(getCarrotPos(tag.refs.i)).to.be.equal(4)

    tag.unmount()
  })

  it('does not set value attribute', function() {

    injectHTML('<input-values></input-values>')

    var tag = riot.mount('input-values')[0]
    expect(tag.refs.i.value).to.be.equal('hi')
    expect(tag.refs.i.hasAttribute('value')).to.be.ok
    tag.update()
    expect(tag.refs.i.value).to.be.equal('foo')
    expect(tag.refs.i.hasAttribute('value')).to.be.ok
    tag.message = ''
    tag.update()
    expect(tag.refs.i.value).to.be.equal('')
    expect(tag.refs.i.hasAttribute('value')).to.be.false

    tag.unmount()
  })

  it('updates the value of input which has been changed from initial one #2096', function() {

    injectHTML('<input-updated></input-updated>')

    var tag = riot.mount('input-updated')[0]
    expect(tag.refs.i.value).to.be.equal('Hello, Riot!')
    tag.refs.i.value = 'Hi!'
    fireEvent(tag.refs.b, 'click')
    expect(tag.refs.i.value).to.be.equal('Can you hear me?')

    tag.unmount()
  })

  it('fails to update the value of input which has the same internal value #1642 #2112', function() {

    injectHTML('<input-updated></input-updated>')

    var tag = riot.mount('input-updated')[0]
    fireEvent(tag.refs.b, 'click')
    expect(tag.refs.i.value).to.be.equal('Can you hear me?')

    tag.refs.i.value = 'Yeah.'
    fireEvent(tag.refs.b, 'click')
    expect(tag.refs.i.value).not.to.be.equal('Can you hear me?')
    // IT MAY SEEM WEIRD AT FIRST, BUT THIS IS SPEC.
    // See more detail on #1642

    tag.unmount()
  })

  it('recursive structure', function() {
    injectHTML('<treeview></treeview>')
    var tag = riot.mount('treeview')[0]
    expect(tag).to.be.an('object')
    expect(tag.isMounted).to.be.equal(true)
    tag.unmount()
  })

  it('top most tag preserve attribute expressions', function() {
    injectHTML('<top-attributes cls="classy"></top-attributes>')
    var tag = riot.mount('top-attributes')[0]
    expect(tag.root.className).to.be.equal('classy') // qouted
    expect(tag.root.getAttribute('data-noquote')).to.be.equal('quotes') // not quoted
    expect(tag.root.getAttribute('data-nqlast')).to.be.equal('quotes') // last attr with no quotes
    expect(tag.root.style.fontSize).to.be.equal('2em') // TODO: how to test riot-prefix?
    tag.unmount()
  })

  it('camelize the options passed via dom attributes', function() {
    injectHTML('<top-attributes></top-attributes>')
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

  it('expressions object attributes get removed once used', function() {
    injectHTML('<top-attributes></top-attributes>')
    var node = document.createElement('top-attributes'),
      tag

    node.setAttribute('data', '{ opts }')
    tag = riot.mount(node, { message: 'hello' })[0]
    expect(tag.opts.data.message).to.be.equal('hello')
    expect(tag.root.getAttribute('data')).to.be.not.ok

    tag.unmount()
  })


  it('the "shouldUpdate" locks the tag update properly', function() {
    injectHTML('<should-update></should-update>')
    var tag = riot.mount('should-update')[0]
    expect(tag.update()).to.be.ok
    expect(tag.refs.count.innerHTML).to.be.equal('0')
    expect(tag.count).to.be.equal(0)
    tag.update(true)
    expect(tag.count).to.be.equal(1)
    tag.unmount()
  })

  it('the "shouldUpdate" accepts nextOpts', function() {
    injectHTML('<should-update-opts should-update="{ count === 0 }"></should-update-opts>')
    var tag = riot.mount('should-update-opts')[0]
    expect(tag.update()).to.be.ok
    expect(tag.count).to.be.equal(1)
    tag.update()
    expect(tag.count).to.be.equal(1)
    tag.unmount()
  })

  it('allow passing riot.observale instances to the children tags', function() {
    injectHTML('<observable-attr></observable-attr>')
    var tag = riot.mount('observable-attr')[0]
    expect(tag.tags['observable-attr-child'].wasTriggered).to.be.equal(true)
    tag.unmount()
  })

  it('nested virtual tags unmount properly', function() {
    injectHTML('<virtual-nested-unmount></virtual-nested-unmount>')
    var tag = riot.mount('virtual-nested-unmount')[0]
    var spans = $$('span', tag.root)
    var divs = $$('div', tag.root)
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
    spans = $$('span', tag.root)
    divs = $$('div', tag.root)
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

  it('render tag: input,option,textarea tags having expressions as value', function() {
    injectHTML('<form-controls></form-controls>')
    var val = 'my-value',
      tag = riot.mount('form-controls', { text: val })[0],
      root = tag.root

    expect($('input[type="text"]', root).value).to.be.equal(val)
    expect($('select option[selected]', root).value).to.be.equal(val)
    expect($('textarea[name="txta1"]', root).value).to.be.equal(val)
    expect($('textarea[name="txta2"]', root).value).to.be.equal('')
    if (IE_VERSION !== 9) expect($('textarea[name="txta2"]', root).placeholder).to.be.equal(val)

    tag.unmount()
  })

  it('multiple select will be properly rendered', function() {
    injectHTML('<multiple-select></multiple-select>')
    const tag = riot.mount('multiple-select')[0]
    const values = []
    ;[].forEach.call(tag.refs.sel.options, function(option) {
      if (option.selected) values.push(option.value)
    })
    expect(values).to.have.length(2)
    tag.unmount()
  })


  it('component nested in virtual unmounts correctly', function() {
    injectHTML('<virtual-nested-component></virtual-nested-component>')
    var tag = riot.mount('virtual-nested-component')[0]
    var components = $$('not-virtual-component2', tag.root)

    expect(components.length).to.be.equal(4)
    expect(tag.tags['not-virtual-component2']).to.have.length(4)

    tag.people.pop()
    tag.update()

    components = $$('not-virtual-component2', tag.root)
    expect(components.length).to.be.equal(3)
    expect(tag.tags['not-virtual-component2']).to.have.length(3)

    tag.unmount()

    components = $$('not-virtual-component2', tag.root)
    expect(components.length).to.be.equal(0)
  })

  it('event handler on each custom tag doesnt update parent', function() {

    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('inner', '<button ref="btn" onclick="{foo}" />', function() {
      this.foo = function() {}.bind()
    })

    riot.tag('riot-tmp', '<inner each="{item in items}" />', function() {
      this.items = [1]
      this.updateCount = 0
      this.on('update', function() { this.updateCount++ })
    })

    var tag = riot.mount('riot-tmp')[0]

    expect(tag.updateCount).to.be.equal(0)
    fireEvent(tag.tags.inner[0].refs.btn, 'click')
    expect(tag.updateCount).to.be.equal(0)


    tag.unmount()

  })

  it('the class attributes get properly removed in case of falsy values', function(done) {

    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', '<p class="{ foo: isFoo }">foo</p>', function() {
      this.isFoo = true
    })

    var tag = riot.mount('riot-tmp')[0],
      p = $('p', tag.root)

    expect(p.hasAttribute('class')).to.be.equal(true)

    // Edge 16 has some race condition issues so we need to defer this check
    setTimeout(() => {
      tag.isFoo = false
      tag.update()
      expect(p.hasAttribute('class')).to.be.equal(false)
      tag.unmount()
      done()
    }, 100)
  })

  it('custom attributes should not be removed if not falsy', function() {
    injectHTML('<riot-tmp data-index="{ index }"></riot-tmp>')

    riot.tag('riot-tmp', '<p></p>', function() {
      this.index = 0
    })

    var tag = riot.mount('riot-tmp')[0]

    expect(tag.opts.dataIndex).to.be.equal(0)
    expect(tag.root.getAttribute('data-index')).to.be.ok
    tag.index = false
    tag.update()
    expect(tag.root.getAttribute('data-index')).to.be.not.ok

    tag.unmount()
  })

  it('make sure the tag context is preserved during updates', function(done) {
    injectHTML('<update-context></update-context>')

    var tag = riot.mount('update-context')[0]

    expect(tag.message).to.be.equal('hi')

    tag.on('updated', function() {
      expect($('p', this.root).textContent).to.be.equal('goodbye')
      expect(tag.unmount()).to.be.an('object')
      done()
      tag.unmount()
    })
  })

  it('create tags extending the riot.Tag constructor', function() {
    class Component extends riot.Tag {
      get name() { return 'component' }
      get tmpl() { return '<h1 onclick="{ onClick }">{ opts.message } { user }</h1>' }
      onCreate() {
        this.user = 'dear User'
      }
      onClick() {
        this.user = 'the user is gone'
      }
    }

    var component = new Component(document.createElement('div'), {
      message: 'hello'
    })
    var h1 = $('h1', component.root)

    expect(component.opts.message).to.be.equal('hello')
    expect(component.user).to.be.equal('dear User')
    expect(h1.textContent).to.be.equal('hello dear User')

    fireEvent(h1, 'click')

    expect(h1.textContent).to.be.equal('hello the user is gone')

    // make sure the component is properly registered
    injectHTML('<component></component>')

    var tag = riot.mount('component', {message: 'hi'})[0]
    expect(tag.opts.message).to.be.equal('hi')

    tag.unmount()
    component.unmount()
  })

  it('extend existing tags created via riot.Tag constructor', function() {
    class Component extends riot.Tag {
      get name() { return 'component' }
      get tmpl() { return '<h1 onclick="{ onClick }">{ opts.message } { user }</h1>' }
      onCreate() {
        this.user = 'dear User'
      }
      onClick() {
        this.user = 'the user is gone'
      }
    }

    class SubComponent extends Component {
      get name() { return 'sub-component' }
      get tmpl() { return '<h2 onclick="{ onClick }">{ opts.message } { user }</h2>' }
    }

    var subComponent = new SubComponent(document.createElement('div'), {
      message: 'hello'
    })

    var h2 = $('h2', subComponent.root)

    expect(subComponent.opts.message).to.be.equal('hello')
    expect(subComponent.user).to.be.equal('dear User')
    expect(h2.textContent).to.be.equal('hello dear User')

    // make sure the sub-component is properly registered
    injectHTML('<sub-component></sub-component>')

    var tag = riot.mount('sub-component', {message: 'hi'})[0]
    expect(tag.opts.message).to.be.equal('hi')

    tag.unmount()
    subComponent.unmount()
  })

  it('gets the reference by data-ref attribute', function() {
    injectHTML('<named-data-ref></named-data-ref>')
    var tag = riot.mount('named-data-ref')[0]
    expect(tag.refs.greeting.value).to.be.equal('Hello')

    tag.unmount()
  })

  it('unmounting a tag containing ref will not throw', function() {

    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', '<div ref="child" onclick="{ unmount }"></div>', function() {
      this.isFoo = true
    })

    var tag = riot.mount('riot-tmp')[0]
    fireEvent(tag.refs.child, 'click')
    expect(tag.isMounted).to.be.equal(false)
    tag.unmount()
  })

  it('dom nodes  having "ref" attributes and upgraded to tags do not appeart twice in the parent', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('riot-tmp-sub', '<p>hi</p>')

    riot.tag('riot-tmp', '<div ref="child"></div>', function() {
      this.on('mount', () => {
        riot.mount(this.refs.child, 'riot-tmp-sub', { parent: this })
      })
    })

    var tag = riot.mount('riot-tmp')[0]

    expect(tag.refs.child).to.be.not.an('array')
    expect(tag.refs.child.hasAttribute('ref')).to.be.ok

    tag.unmount()
  })

  it('ref attributes will be removed only if falsy or not strings', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', `
      <div ref='child'></div>
      <div ref="{ expr }"></div>
      <div ref="{ null }"></div>
      <div ref="{ false }"></div>
      <div ref="{ '' }"></div>
    `, function() {
        this.expr = 'expr'
      })

    var tag = riot.mount('riot-tmp')[0],
      divs = $$('div', tag.root)

    expect(tag.refs.child).to.be.ok
    expect(tag.refs.expr).to.be.ok

    expect(divs[0].hasAttribute('ref')).to.be.ok
    expect(divs[1].hasAttribute('ref')).to.be.ok
    expect(divs[2].hasAttribute('ref')).to.be.not.ok
    expect(divs[3].hasAttribute('ref')).to.be.not.ok
    expect(divs[4].hasAttribute('ref')).to.be.not.ok

    tag.unmount()
  })


  it('virtual tags can be used with dynamic data-is', function() {
    injectHTML('<dynamic-virtual></dynamic-virtual>')

    var tag = riot.mount('dynamic-virtual')[0]
    var first = tag.root.firstElementChild
    expect(first.tagName).to.be.equal('P')
    expect(first.innerHTML).to.be.equal('yielded data')

    tag.render = 'xtag'
    tag.update()
    first = tag.root.firstElementChild
    expect(first.tagName).to.be.equal('SPAN')
    expect(first.innerHTML).to.be.equal('virtual data-is')

    tag.unmount()
  })

  it('nested dynamic tags retain data-is attribute', function() {
    injectHTML('<dynamic-nested></dynamic-nested>')
    var tag = riot.mount('dynamic-nested')[0]

    expect(tag.refs.dynamic.root.getAttribute('data-is')).to.be.equal('page-a')
    expect(tag.tags['page-a'].root.querySelector('h1').innerHTML).to.be.equal('page-a')

    tag.page = 'page-b'
    tag.update()
    expect(tag.refs.dynamic.root.getAttribute('data-is')).to.be.equal('page-b')
    expect(tag.tags['page-b'].root.querySelector('h1').innerHTML).to.be.equal('page-b')

    tag.unmount()
  })

  it('virtual tags with conditional will mount their children tags properly', function() {
    injectHTML('<virtual-conditional></virtual-conditional>')
    var tag = riot.mount('virtual-conditional')[0]

    riot.util.tmpl.errorHandler = function () {
      throw new Error('It should render without errors')
    }

    expect(tag.childMountCount).to.be.equal(0)
    tag.user = { name: 'foo' }

    tag.update()
    expect(tag.childMountCount).to.be.equal(1)

    riot.util.tmpl.errorHandler = null

    tag.unmount()

  })

  it('the value attribute on a riot tag gets properly passed as option', function() {
    injectHTML('<riot-tmp-value></riot-tmp-value>')
    riot.tag('riot-tmp', '<p>{ opts.value }</p>')
    riot.tag('riot-tmp-value', '<riot-tmp value="{ value }"></riot-tmp>', function() {
      this.value = 'foo'
    })
    var tag = riot.mount('riot-tmp-value')[0]
    expect(tag.tags['riot-tmp'].opts.value).to.be.equal('foo')
    expect(tag.tags['riot-tmp'].opts.riotValue).to.be.not.ok
    tag.unmount()
  })

  it('the null attributes should be not transformed to empty strings', function() {
    injectHTML('<riot-tmp-value></riot-tmp-value>')
    riot.tag('riot-tmp', '<p>{ opts.value }</p>')
    riot.tag('riot-tmp-value', '<riot-tmp value="{ null }" value2="{ undefined }"></riot-tmp>')
    var tag = riot.mount('riot-tmp-value')[0]
    expect(tag.tags['riot-tmp'].opts.value).to.be.equal(null)
    expect(tag.tags['riot-tmp'].opts.value2).to.be.equal(undefined)
    tag.unmount()
  })

  it('style properties could be passed also as object', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('riot-tmp', '<p riot-style="{ style }">hi</p>')
    var tag = riot.mount('riot-tmp')[0],
      p = $('p', this.root)

    tag.style = { color: 'red', height: '10px'}
    tag.update()

    expect(p.style.color).to.be.equal('red')
    expect(p.style.height).to.be.equal('10px')

    tag.unmount()
  })


  it('class properties could be passed also as object', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('riot-tmp', '<p class="{ classes }">hi</p>')
    var tag = riot.mount('riot-tmp')[0],
      p = $('p', this.root)

    tag.classes = { foo: true, bar: false }
    tag.update()
    expect(p.getAttribute('class')).to.be.equal('foo')
    tag.classes = { foo: true, bar: true }
    tag.update()
    expect(p.getAttribute('class')).to.be.equal('foo bar')
    tag.unmount()
  })

  it('undefined text node should not be rendered', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('riot-tmp', '<p>{ message }</p>')

    var tag = riot.mount('riot-tmp')[0],
      p = $('p', this.root)

    expect(p.innerHTML).to.be.not.equal('undefined')

    tag.unmount()
  })

  it('subtags created via is get properly unmounted', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('riot-tmp-sub', '<p>hi</p>')
    riot.tag('riot-tmp', '<div if="{ showSub }"><div data-is="{ subTag }"></div></div>')

    var tag = riot.mount('riot-tmp')[0],
      unmount = sinon.spy()

    expect(tag.tags['riot-tmp-sub']).to.be.not.ok

    tag.showSub = true
    tag.subTag = 'riot-tmp-sub'
    tag.update()

    expect(tag.tags['riot-tmp-sub']).to.be.ok
    tag.tags['riot-tmp-sub'].on('unmount', unmount)

    tag.showSub = false
    tag.update()

    expect(tag.tags['riot-tmp-sub']).to.be.not.ok
    expect(unmount).to.have.been.called

    tag.unmount()
  })

  it('riot can mount also inline templates', function() {
    injectHTML(`
      <riot-tmp>
        <p ref="mes">{ message }</p>
        <riot-tmp-sub ref="sub" message="{ message }">
          <p ref="mes">{ message }</p>
        </riot-tmp-sub>
      </riot-tmp>`)

    riot.tag('riot-tmp', false, function() {
      this.message = 'hello'
    })

    riot.tag('riot-tmp-sub', false, function(opts) {
      this.message = opts.message
    })

    var tag = riot.mount('riot-tmp')[0]

    expect(tag.refs.mes.innerHTML).to.be.equal(tag.message)
    expect(tag.refs.sub.refs.mes.innerHTML).to.be.equal(tag.message)

    tag.unmount()
  })


  it('tags in an svg context are automatically detected and properly created see #2290', function() {
    injectHTML('<svg id="tmpsvg"><g data-is="riot-tmp"></g></svg>')

    riot.tag('riot-tmp', '<circle riot-cx="{ 10 + 5 }" riot-cy="{ 10 + 5 }" r="2" fill="black"></circle>')

    var tag = riot.mount('riot-tmp')[0],
      circle = $('circle', this.root)

    expect(circle instanceof HTMLElement).to.be.equal(false)

    tag.unmount()
    document.body.removeChild(window.tmpsvg)
  })

  it('disable the auto updates via settings.autoUpdate = false', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', '<p ref="p" onclick="{ updateMessage }">{ message }</p>', function() {
      this.message = 'hi'
      this.updateMessage = function() {
        this.message = 'goodbye'
      }
    })

    riot.settings.autoUpdate = false
    var tag = riot.mount('riot-tmp')[0]

    expect(tag.refs.p.innerHTML).to.be.equal(tag.message)

    fireEvent(tag.refs.p, 'click')

    expect(tag.refs.p.innerHTML).to.be.not.equal(tag.message)

    tag.unmount()
    riot.settings.autoUpdate = true
  })

  it('updates during the mount event should properly update the DOM', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', '<p ref="p">{ message }</p>', function() {
      this.message = 'hi'
      this.on('mount', () => {
        this.message = 'goodbye'
        this.update()
      })
    })

    var tag = riot.mount('riot-tmp')[0]
    expect(tag.refs.p.innerHTML).to.be.equal('goodbye')
    tag.unmount()
  })

  it('avoid to get ref attributes on yield tags', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', '<yield ref="foo"/>')

    var tag = riot.mount('riot-tmp')[0]
    expect(tag.refs.foo).to.be.undefined
    tag.unmount()
  })

  it('remove style attributes if they contain blank values', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp', "<p ref='p' riot-style=\"{changed ? 'background-color: green' : ''}\"></p>", function() {
      this.changed = true
    })

    var tag = riot.mount('riot-tmp')[0]
    expect(tag.refs.p.hasAttribute('style')).to.be.ok
    tag.changed = false
    tag.update()
    expect(tag.refs.p.hasAttribute('style')).to.be.not.ok

    tag.unmount()
  })

  it('avoid to clean the DOM for the default riot.unmount call', function(done) {
    injectHTML('<riot-tmp></riot-tmp>')

    riot.tag('riot-tmp-sub', '<p id="{ id }">foo</p>', function() {
      this.id = `id-${ this._riot_id }`

      this.on('before-unmount', () => {
        expect(document.getElementById(this.id)).to.be.ok
        done()
      })
    })

    riot.tag('riot-tmp', '<riot-tmp-sub></riot-tmp-sub>')

    var tag = riot.mount('riot-tmp')[0]

    setTimeout(() => {
      expect(document.getElementById(tag.tags['riot-tmp-sub'].id)).to.be.ok
      tag.unmount()
    }, 100)
  })
})
