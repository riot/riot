import {
  injectHTML,
  $,
  $$,
  normalizeHTML
} from '../../helpers/index'

import riot from 'riot'

// include special tags to test specific features
import '../../tag/inner-html.tag'
import '../../tag/yield-no-slash.tag'
import '../../tag/yield-multi.tag'
import '../../tag/yield-multi2.tag'
import '../../tag/yield-from-default.tag'
import '../../tag/yield-nested.tag'

const expect = chai.expect

describe('Riot transclusion', function() {

  before(function() {
    // tag used in multiple tests
    riot.tag('inner', '<p>{opts.value}</p>')
  })

  it('simple html transclusion via <yield> tag', function() {

    injectHTML([
      '<inner-html>',
      '  { greeting }',
      '  <inner value="ciao mondo"></inner>',
      '</inner-html>'
    ])

    var tag = riot.mount('inner-html')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<h1>Hello, World  <inner value="ciao mondo"><p>ciao mondo</p></inner></h1>')

    tag.unmount()

  })

  it('yield without closing slash should be work as expected', function() {

    injectHTML([
      '<yield-no-slash>',
      '  foo',
      '</yield-no-slash>'
    ])

    var tag = riot.mount('yield-no-slash')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('foo')
    tag.unmount()

  })

  it('<yield> from/to multi-transclusion', function() {
    injectHTML('<yield-multi><yield to="content">content</yield><yield to="nested-content">content</yield><yield to="nowhere">content</yield></yield-multi>')
    var tag = riot.mount('yield-multi', {})[0]
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<p>yield the content here</p><div><p>yield the nested content here</p><p>do not yield the unreference content here</p></div>')
    tag.unmount()
  })

  it('<yield> from/to multi-transclusion nested #1458', function() {
    var html = [
      '<yield-multi2>',
      '  <yield to="options">',
      '    <ul>',
      '      <li>Option 1</li>',
      '      <li>Option 2</li>',
      '    </ul>',
      '  </yield>',
      '  <div>',
      '    <yield to="toggle"><span class="icon"></span></yield>',
      '    <yield to="hello">Hello</yield><yield to="world">World</yield>',
      '    <yield to="hello">dummy</yield>',
      '  </div>',
      '</yield-multi2>'
    ]
    injectHTML(html.join('\n'))
    expect($('yield-multi2')).not.to.be.equal(null)
    var tag = riot.mount('yield-multi2', {})[0]
    html = '<ul><li>Option 1</li><li>Option 2</li></ul><span class="icon"></span><p>Hello World</p>'
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal(html)
    tag.unmount()
  })


  it('<yield from> name can be unquoted, without <yield to> default to its content', function () {
    var html = [
      '<yield-from-default>',
      ' <yield to="icon">my-icon</yield>',
      ' <yield to="hello">Hello $1 $2</yield>',
      ' <yield to="loop">[⁗foo⁗,\'bar\']</yield>',
      '</yield-from-default>'
    ]

    injectHTML(html.join('\n'))
    expect($('yield-from-default')).not.to.be.equal(null)
    var tag = riot.mount('yield-from-default')[0]
    html = '<p>(no options)</p><p>Hello $1 $2 <span class="my-icon"></span></p><p>foo</p><p>bar</p>'
    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal(html)
    tag.unmount()
  })


  it('multiple mount <yield> tag', function() {

    injectHTML('<inner-html>World  <inner value="ciao mondo"></inner></inner-html>')

    riot.mount('inner-html')
    riot.mount('inner-html')
    riot.mount('inner-html')
    riot.mount('inner-html')

    var tag = riot.mount('inner-html')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<h1>Hello, World  <inner value="ciao mondo"><p>ciao mondo</p></inner></h1>')
    tag.unmount()

  })

  it('<yield> contents in a child get always compiled using its parent data', function(done) {

    injectHTML('<yield-parent>{ greeting }</yield-parent>')

    var tag = riot.mount('yield-parent', {
      saySomething: done
    })[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.match(/<h1>Hello, from the parent<\/h1><yield-child><h1>Greeting<\/h1><i>from the child<\/i><div(.+|)><b>wooha<\/b><\/div><\/yield-child>/)

    tag.update({
      isSelected: true
    })


    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<h1>Hello, from the parent</h1><yield-child><h1>Greeting</h1><i>from the child</i><div class="selected"><b>wooha</b></div></yield-child>')

    tag.root.getElementsByTagName('i')[0].onclick({})

    tag.unmount()

  })



  it('<yield> contents in a loop get always compiled using its parent data', function(done) {

    injectHTML([
      '<yield-loop>',
      '  { greeting }',
      '  <div>Something else</div>',
      '</yield-loop>'
    ])

    var tag = riot.mount('yield-loop', {
        saySomething: done
      })[0],
      child3

    expect(tag.tags['yield-child-2'].length).to.be.equal(5)

    child3 = tag.tags['yield-child-2'][3]

    expect(child3.root.getElementsByTagName('h2')[0].innerHTML.trim()).to.be.equal('subtitle4')

    child3.root.getElementsByTagName('i')[0].onclick({})

    tag.unmount()

  })

  it('<yield> with dollar signs get replaced correctly', function() {

    injectHTML([
      '<yield-with-dollar-2>',
      '  <yield-with-dollar-1 cost="$25"></yield-with-dollar-1>',
      '</yield-with-dollar-2>'
    ])

    riot.tag('yield-with-dollar-1', '<span>{opts.cost}</span>')
    riot.tag('yield-with-dollar-2', '<yield></yield>')

    var tag = riot.mount('yield-with-dollar-2')[0]

    expect(normalizeHTML(tag.root.innerHTML)).to.be.equal('<yield-with-dollar-1 cost="$25"><span>$25</span></yield-with-dollar-1>')

    tag.unmount()

  })

})