var glob = require('glob')
var sdom = require('../../lib/sdom')

describe('Node/io.js', function() {

  it('require tags', function() {
    glob('../tag/*.tag', { cwd: __dirname }, function (err, tags) {
      expect(err).to.be(null)
      tags.forEach(function(tag) {
        expect(require(tag)).to.be.ok()
      })
    })
  })

  it('render tag: timer', function() {
    var tmr = riot.render('timer', { start: 42 })
    expect(tmr).to.be('<timer><p>Seconds Elapsed: 42</p></timer>')
  })

  it('render tag: if-test', function() {
    var ift = riot.render('if-test')
    var doc = sdom.parse(ift)
    var els = querySelectorAll(doc, 'if-child')
    expect(els.length).to.be(1)
    expect(els[0].attributes.length).to.be(1)
    expect(els[0].attributes[0].name).to.be('style')
    expect(els[0].attributes[0].value).to.be('display: none;')
  })

  it('render tag: loop-child', function() {
    var lpc = riot.render('loop-child')
    var doc = sdom.parse(lpc)
    var els = querySelectorAll(doc, 'looped-child')
    expect(els.length).to.be(2)
    var h3s = querySelectorAll(doc, 'h3')
    expect(h3s.length).to.be(2)
    expect(h3s[0].firstChild.nodeValue).to.be('one')
    expect(h3s[1].firstChild.nodeValue).to.be('two')
  })

})

// support functions
//
function querySelectorAll(dom, selector) {
  var nodes = []
  walk(dom, function(node) {
    if (node && node.tagName) {
      var tagName = node.tagName.toLowerCase()
      if (selector.indexOf(tagName) != -1) {
        nodes.push(node)
      }
    }
  })
  return nodes
}
// `riot.util.walk`
function walk(dom, fn) {
  if (dom) {
    if (fn(dom) === false) walk(dom.nextSibling, fn)
    else {
      dom = dom.firstChild
      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}