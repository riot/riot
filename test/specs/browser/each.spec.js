import {
  injectHTML,
  $$,
  getNextSibling,
  getPreviousSibling,
  normalizeHTML
} from '../../helpers/index'

import riot from 'riot'

// include special tags to test specific features
import '../../tag/loop-svg-nodes.tag'
import '../../tag/loop-position.tag'
import '../../tag/table-data.tag'
import '../../tag/loop-option.tag'
import '../../tag/loop-optgroup.tag'
import '../../tag/loop-optgroup2.tag'
import '../../tag/loop-arraylike.tag'
import '../../tag/loop-ids.tag'
import '../../tag/loop-unshift.tag'
import '../../tag/loop-virtual.tag'
import '../../tag/loop-null-items.tag'
import '../../tag/loop-named.tag'
import '../../tag/loop-single-tags.tag'
import '../../tag/loop.tag'
import '../../tag/loop-cols.tag'
import '../../tag/loop-child.tag'
import '../../tag/loop-combo.tag'
import '../../tag/loop-reorder.tag'
import '../../tag/loop-manip.tag'
import '../../tag/loop-object.tag'
import '../../tag/loop-tag-instances.tag'
import '../../tag/loop-numbers-nested.tag'
import '../../tag/loop-nested-strings-array.tag'
import '../../tag/loop-events.tag'
import '../../tag/loop-sync-options-nested.tag'
import '../../tag/loop-inherit.tag'
import '../../tag/loop-root.tag'
import '../../tag/loop-double-curly-brackets.tag'
import '../../tag/loop-conditional.tag'
import '../../tag/loop-protect-internal-attrs.tag'
import '../../tag/ploop-tag.tag'
import '../../tag/table-loop-extra-row.tag'
import '../../tag/obj-key-loop.tag'
import '../../tag/loop-sync-options.tag'
import '../../tag/outer.tag'
import '../../tag/named-select.tag'

import '../../tag/virtual-no-loop.tag'
import '../../tag/virtual-yield-loop.tag'

const expect = chai.expect

describe('Riot each', function() {
  it('the loop elements keep their position in the DOM', function() {
    injectHTML('<loop-position></loop-position>')
    var tag = riot.mount('loop-position')[0],
      h3 = tag.root.getElementsByTagName('h3')[0]

    expect(getPreviousSibling(h3).tagName.toLowerCase()).to.be.equal('p')
    expect(getNextSibling(h3).tagName.toLowerCase()).to.be.equal('p')

    tag.unmount()

  })

  it('SVGs nodes can be properly looped', function() {

    injectHTML('<loop-svg-nodes></loop-svg-nodes>')

    var tag = riot.mount('loop-svg-nodes')[0]

    expect($$('svg circle', tag.root).length).to.be.equal(3)

    tag.unmount()
  })

  it('the root keyword should be protected also in the loops', function() {

    injectHTML('<loop-root></loop-root>')
    var tag = riot.mount('loop-root')[0]

    expect($$('li', tag.root).length).to.be.equal(3)

    tag.splice()
    tag.update()

    expect($$('li', tag.root).length).to.be.equal(2)

    tag.unmount()

  })

  it('avoid to duplicate tags in multiple foreach loops', function() {

    injectHTML([
      '<outer id="outer1"></outer>',
      '<outer id="outer2"></outer>',
      '<outer id="outer3"></outer>'
    ])

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

      return tag

    }

    var outer1 = mountTag('#outer1'),
      outer2 = mountTag('#outer2'),
      outer3 = mountTag('#outer3')

    expect(outer1.root.getElementsByTagName('outer-inner').length).to.be.equal(5)
    expect(outer1.root.getElementsByTagName('span').length).to.be.equal(5)
    expect(outer1.root.getElementsByTagName('p').length).to.be.equal(5)
    expect(outer2.root.getElementsByTagName('outer-inner').length).to.be.equal(5)
    expect(outer2.root.getElementsByTagName('span').length).to.be.equal(5)
    expect(outer2.root.getElementsByTagName('p').length).to.be.equal(5)
    expect(outer3.root.getElementsByTagName('outer-inner').length).to.be.equal(5)
    expect(outer3.root.getElementsByTagName('span').length).to.be.equal(5)
    expect(outer3.root.getElementsByTagName('p').length).to.be.equal(5)

    outer1.unmount()
    outer2.unmount()
    outer3.unmount()

  })

  it('the each loops update correctly the DOM nodes', function() {

    injectHTML('<loop></loop>')

    var onItemClick = function(e) {
        var elIndex = Array.prototype.slice.call(children).indexOf(e.currentTarget)
        expect(tag.items[elIndex]).to.be.equal(e.item.item)
      },
      removeItemClick = function(e) {
        var index = tag.removes.indexOf(e.item)
        if (index < 0) return
        tag.removes.splice(index, 1)
      },
      tag = riot.mount('loop', { onItemClick: onItemClick, removeItemClick: removeItemClick })[0],
      root = tag.root,
      button = root.getElementsByTagName('button')[0],
      children,
      itemsCount = 5

    tag.items = []
    tag.removes = []

    while (itemsCount--) {
      tag.removes.push({
        value: 'remove item #' + tag.items.length
      })
      tag.items.push({
        value: 'item #' + tag.items.length
      })
    }
    tag.update()

    // remove item make sure item passed is correct
    for (var i = 0; i < tag.items.length; i++) {
      var curItem = tag.removes[0],
        ev = {},
        el = root.getElementsByTagName('dt')[0]
      el.onclick(ev)
      expect(curItem).to.be.equal(ev.item)
    }

    children = root.getElementsByTagName('li')
    Array.prototype.forEach.call(children, function(child) {
      child.onclick({})
    })
    expect(children.length).to.be.equal(5)

    // no update is required here
    button.onclick({})
    children = root.getElementsByTagName('li')
    expect(children.length).to.be.equal(10)

    Array.prototype.forEach.call(children, function(child) {
      child.onclick({})
    })

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>0 item #0 </li><li>1 item #1 </li><li>2 item #2 </li><li>3 item #3 </li><li>4 item #4 </li><li>5 item #5 </li><li>6 item #6 </li><li>7 item #7 </li><li>8 item #8 </li><li>9 item #9 </li>')

    tag.items.reverse()
    tag.update()
    children = root.getElementsByTagName('li')
    expect(children.length).to.be.equal(10)
    Array.prototype.forEach.call(children, function(child) {
      child.onclick({})
    })

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>0 item #9 </li><li>1 item #8 </li><li>2 item #7 </li><li>3 item #6 </li><li>4 item #5 </li><li>5 item #4 </li><li>6 item #3 </li><li>7 item #2 </li><li>8 item #1 </li><li>9 item #0 </li>'.trim())

    var tempItem = tag.items[1]
    tag.items[1] = tag.items[8]
    tag.items[8] = tempItem
    tag.update()

    Array.prototype.forEach.call(children, function(child) {
      child.onclick({})
    })

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>0 item #9 </li><li>1 item #1 </li><li>2 item #7 </li><li>3 item #6 </li><li>4 item #5 </li><li>5 item #4 </li><li>6 item #3 </li><li>7 item #2 </li><li>8 item #8 </li><li>9 item #0 </li>'.trim())

    tag.items = null
    tag.update()
    expect(root.getElementsByTagName('li').length).to.be.equal(0)

    tag.unmount()

  })

  it('the event.item property gets handled correctly also in the nested loops', function() {

    injectHTML('<loop-events></loop-events>')

    var tag = riot.mount('loop-events', {
        cb: function(e, item) {
          eventsCounter++
          if (e.stopPropagation)
            e.stopPropagation()
          expect(JSON.stringify(item)).to.be.equal(JSON.stringify(testItem))
        }
      })[0],
      eventsCounter = 0,
      testItem

    // 1st test
    testItem = { outerCount: 'out', outerI: 0 }
    tag.root.getElementsByTagName('inner-loop-events')[0].onclick({})
    // 2nd test inner contents
    testItem = { innerCount: 'in', innerI: 0 }
    tag.root.getElementsByTagName('button')[1].onclick({})
    tag.root.getElementsByTagName('li')[0].onclick({})

    expect(eventsCounter).to.be.equal(3)

    tag.unmount()

  })

  it('can loop also collections including null items', function() {

    injectHTML('<loop-null-items></loop-null-items>')

    var tag = riot.mount('loop-null-items')[0]
    expect($$('li', tag.root).length).to.be.equal(7)
    tag.unmount()
  })

  it('each loop creates correctly a new context', function() {

    injectHTML('<loop-child></loop-child>')

    var tag = riot.mount('loop-child')[0],
      root = tag.root,
      children = root.getElementsByTagName('looped-child')

    expect(children.length).to.be.equal(2)
    expect(tag.tags['looped-child'].length).to.be.equal(2)
    expect(tag.tags['looped-child'][0].hit).to.be.a('function')
    expect(normalizeHTML(children[0].innerHTML)).to.be.equal('<h3>one</h3><button>one</button>')
    expect(normalizeHTML(children[1].innerHTML)).to.be.equal('<h3>two</h3><button>two</button>')

    tag.items = [ {name: 'one'}, {name: 'two'}, {name: 'three'} ]
    tag.update()
    expect(root.getElementsByTagName('looped-child').length).to.be.equal(3)

    expect(tag.tags['looped-child'][2].isMounted).to.be.equal(true)
    expect(tag.tags['looped-child'].length).to.be.equal(3)

    expect(root.getElementsByTagName('looped-child')[0].style.color).to.be.equal('red')
    root.getElementsByTagName('looped-child')[0].getElementsByTagName('button')[0].onclick({})
    expect(root.getElementsByTagName('looped-child')[0].style.color).to.be.equal('blue')

    tag.unmount()

  })


  it('the loop children tags must fire the \'mount\' event when they are already injectend into the parent', function(done) {

    injectHTML('<loop-child></loop-child>')

    var tag = tag = riot.mount('loop-child')[0],
      root = tag.root

    setTimeout(function() {
      tag.tags['looped-child'].forEach(function(child) {
        expect(child.mountWidth).to.be.above(0)
      })

      tag.childrenMountWidths.forEach(function(width) {
        expect(width).to.be.above(0)
      })

      tag.unmount()

      done()
    }, 100)

  })

  it('the `array.unshift` method does not break the loop', function() {

    injectHTML('<loop-unshift></loop-unshift>')

    var tag = riot.mount('loop-unshift')[0]

    expect(tag.tags['loop-unshift-item'].length).to.be.equal(2)
    expect(normalizeHTML(tag.root.getElementsByTagName('loop-unshift-item')[0].innerHTML)).to.be.equal('<p>woo</p>')
    tag.items.unshift({ name: 'baz' })
    tag.update()
    expect(normalizeHTML(tag.root.getElementsByTagName('loop-unshift-item')[0].innerHTML)).to.be.equal('<p>baz</p>')

    tag.unmount()

  })

  it('each loop adds and removes items in the right position (when multiple items share the same html)', function() {

    injectHTML('<loop-manip></loop-manip>')

    var tag = riot.mount('loop-manip')[0],
      root = tag.root,
      children = root.getElementsByTagName('loop-manip')

    tag.top()
    tag.update()
    tag.bottom()
    tag.update()
    tag.top()
    tag.update()
    tag.bottom()
    tag.update()

    expect(normalizeHTML(root.getElementsByTagName('ul')[0].innerHTML)).to.be.equal('<li>100 <a>remove</a></li><li>100 <a>remove</a></li><li>0 <a>remove</a></li><li>1 <a>remove</a></li><li>2 <a>remove</a></li><li>3 <a>remove</a></li><li>4 <a>remove</a></li><li>5 <a>remove</a></li><li>100 <a>remove</a></li><li>100 <a>remove</a></li>'.trim())

    tag.unmount()

  })


  it('tags in different each loops dont collide', function() {

    injectHTML('<loop-combo></loop-combo>')

    var tag = riot.mount('loop-combo')[0]

    expect(normalizeHTML(tag.root.innerHTML))
      .to.be.equal('<lci x="a"></lci><div><lci x="y"></lci></div>')

    tag.update({b: ['z']})

    expect(normalizeHTML(tag.root.innerHTML))
      .to.be.equal('<lci x="a"></lci><div><lci x="z"></lci></div>')

    tag.unmount()

  })

  it('iterate over an object, then modify the property and update itself', function() {

    injectHTML('<loop-object></loop-object>')

    var tag = riot.mount('loop-object')[0]
    var root = tag.root

    expect(normalizeHTML(root.getElementsByTagName('div')[0].innerHTML))
      .to.be.equal('<p>zero = 0</p><p>one = 1</p><p>two = 2</p><p>three = 3</p>')

    for (var key in tag.obj) { // eslint-disable-line guard-for-in
      tag.obj[key] = tag.obj[key] * 2
    }

    tag.update()
    expect(normalizeHTML(root.getElementsByTagName('div')[0].innerHTML))
      .to.be.equal('<p>zero = 0</p><p>one = 2</p><p>two = 4</p><p>three = 6</p>')

    tag.unmount()
  })

  it('the loop children instances get correctly removed in the right order', function() {

    injectHTML('<loop-ids></loop-ids>')

    var tag = riot.mount('loop-ids')[0],
      thirdItemId = tag.tags['loop-ids-item'][2]._riot_id

    tag.items.splice(0, 1)
    tag.update(tag.tags['loop-ids-item'])
    expect(tag.items.length).to.be.equal(2)
    // the second tag instance got removed
    // so now the third tag got moved to the second position
    expect(tag.tags['loop-ids-item'][1]._riot_id).to.be.equal(thirdItemId)

    tag.unmount()

  })

  it('each tag in the "tags" property can be looped', function() {

    injectHTML('<loop-single-tags></loop-single-tags>')

    var tag = riot.mount('loop-single-tags')[0]

    expect($$('ul li', tag.root).length).to.be.equal(4)

    tag.unmount()

  })

  it('loop option tag', function() {
    injectHTML('<loop-option></loop-option>')

    var tag = riot.mount('loop-option')[0],
      root = tag.root,
      options = root.getElementsByTagName('select')[0],
      html = normalizeHTML(root.innerHTML).replace(/ selected="selected"/, '')

    expect(html).to.match(/<select><option value="1">Peter<\/option><option value="2">Sherman<\/option><option value="3">Laura<\/option><\/select>/)

    //expect(options[0].selected).to.be.equal(false)
    expect(options[1].selected).to.be.equal(true)
    expect(options[2].selected).to.be.equal(false)
    expect(options.selectedIndex).to.be.equal(1)

    tag.unmount()

  })

  it('the named on a select tag gets', function() {

    injectHTML('<named-select></named-select>')

    var tag = riot.mount('named-select')[0]

    expect(tag.daSelect).to.not.be.equal(undefined)
    expect(tag.daSelect.length).to.be.equal(2)

    tag.unmount()
  })

  it('loop optgroup tag', function() {

    injectHTML('<loop-optgroup></loop-optgroup>')

    var tag = riot.mount('loop-optgroup')[0],
      root = tag.root,
      html = normalizeHTML(root.innerHTML).replace(/(value="\d") (selected="selected")/, '$2 $1')

    expect(html).to.match(/<select><optgroup label="group 1"><option value="1">Option 1.1<\/option><option value="2">Option 1.2<\/option><\/optgroup><optgroup label="group 2"><option value="3">Option 2.1<\/option><option selected="selected" value="4">Option 2.2<\/option><\/optgroup><\/select>/)

    tag.unmount()

  })

  it('loop optgroup tag (outer option, no closing option tags)', function() {

    injectHTML('<loop-optgroup2></loop-optgroup2>')

    var tag = riot.mount('loop-optgroup2')[0],
      root = tag.root,
      html = normalizeHTML(root.innerHTML).replace(/(value="\d") (disabled="disabled")/g, '$2 $1')

    expect(html).to
      .match(/<select><option selected="selected">&lt;Select Option&gt; ?(<\/option>)?<optgroup label="group 1"><option value="1">Option 1.1 ?(<\/option>)?<option disabled="disabled" value="2">Option 1.2 ?(<\/option>)?<\/optgroup><optgroup label="group 2"><option value="3">Option 2.1 ?(<\/option>)?<option disabled="disabled" value="4">Option 2.2 ?<\/option><\/optgroup><\/select>/)

    tag.unmount()

  })

  it('loop tr table tag', function() {

    injectHTML('<table-data></table-data>')

    var tag = riot.mount('table-data')[0],
      root = tag.root

    expect(normalizeHTML(root.innerHTML)).to.match(/<h3>Cells<\/h3><table border="1"><tbody><tr><th>One<\/th><th>Two<\/th><th>Three<\/th><\/tr><tr><td>One<\/td><td>Two<\/td><td>Three<\/td><\/tr><\/tbody><\/table><h3>Rows<\/h3><table border="1"><tbody><tr><td>One<\/td><td>One another<\/td><\/tr><tr><td>Two<\/td><td>Two another<\/td><\/tr><tr><td>Three<\/td><td>Three another<\/td><\/tr><\/tbody><\/table>/)

    tag.unmount()

  })

  it('loop tr in tables preserving preexsisting rows', function() {

    injectHTML('<table-loop-extra-row></table-loop-extra-row>')

    var tag = riot.mount('table-loop-extra-row')[0],
      root = tag.root,
      tr = root.querySelectorAll('table tr')

    expect(tr.length).to.be.equal(5)
    expect(normalizeHTML(tr[0].innerHTML)).to.be.equal('<td>Extra</td><td>Row1</td>')
    expect(normalizeHTML(tr[4].innerHTML)).to.be.equal('<td>Extra</td><td>Row2</td>')

    tag.unmount()
  })

  it('loop reorder dom nodes', function() {

    injectHTML('<loop-reorder></loop-reorder>')

    var tag = riot.mount('loop-reorder')[0]
    expect(tag.root.querySelectorAll('span')[0].className).to.be.equal('nr-0')
    expect(tag.root.querySelectorAll('div')[0].className).to.be.equal('nr-0')
    tag.items.reverse()
    tag.update()
    expect(tag.root.querySelectorAll('span')[0].className).to.be.equal('nr-5')
    expect(tag.root.querySelectorAll('div')[0].className).to.be.equal('nr-0')

    tag.unmount()
  })

  it('tags property in loop, varying levels of nesting', function() {

    injectHTML([
      '<ploop-tag></ploop-tag>',
      '<ploop1-tag></ploop1-tag>',
      '<ploop2-tag></ploop2-tag>',
      '<ploop3-tag></ploop3-tag>'
    ])

    var tag = riot.mount('ploop-tag, ploop1-tag, ploop2-tag, ploop3-tag', {
      elements: [{
        foo: 'foo',
        id: 0
      }, {
        foo: 'bar',
        id: 1
      }]
    })

    expect(tag[0].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[0].tags['ploop-another']).to.be.an('object')
    expect(tag[1].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[1].tags['ploop-another'].length).to.be.equal(2)
    expect(tag[2].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[2].tags['ploop-another']).to.be.an('object')
    expect(tag[3].tags['ploop-child'].length).to.be.equal(2)
    expect(tag[3].tags['ploop-another']).to.be.an('object')

    tag.forEach(tag => tag.unmount())
  })

  it('dynamically named elements in a loop', function() {

    injectHTML('<loop-named></loop-named>')

    var tag = riot.mount('loop-named')[0]
    tag.on('mount', function () {
      expect(tag.first).name.to.be.equal('first')
      expect(tag.two).name.to.be.equal('two')
    })
    tag.unmount()
  })


})