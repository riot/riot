import {
  injectHTML,
  getRiotStyles,
  $
} from '../../helpers/index'


// include special tags to test specific features
import '../../tag/style-tag.tag'
import '../../tag/style-tag2.tag'
import '../../tag/style-tag4.tag'
import '../../tag/scoped.tag'

const expect = chai.expect

describe('Riot style', function() {



  it('style injection to single style tag', function() {
    injectHTML('<style-tag></style-tag><style-tag2></style-tag2>')
    var tags = riot.mount('style-tag, style-tag2')
    var styles = getRiotStyles(riot)
    expect(styles).to.match(/\bp\s*\{color: blue;}/)
    expect(styles).to.match(/\bdiv\s*\{color: red;}/)
    tags.forEach(tag => tag.unmount())
  })

  it('style injection removes type riot style tag', function() {
    var stag = $('style[type=riot]')
    expect(stag).to.be.equal(null)
  })

  it('scoped css tag supports htm5 syntax, multiple style tags', function () {

    injectHTML('<style-tag4></style-tag4>')

    checkCSS(riot.mount('style-tag4')[0], '3px')

    function checkCSS(t, x, p2) {
      t.update()
      var e = t.root.firstElementChild
      expect(e.tagName).to.be.equal('P')
      expect(window.getComputedStyle(e, null).borderTopWidth).to.be.equal(x)
      if (p2) {
        e = t.root.getElementsByTagName('P')[1]
        expect(e.innerHTML).to.be.equal('x')
        expect(window.getComputedStyle(e, null).borderTopWidth).to.be.equal('4px')
      }
      t.unmount()
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

    divtag.unmount()
    rtag.unmount()
    tag.unmount()
  })

  it('deferred injection of styles in batch', function() {

    // test riot.util.styleNode
    expect(riot.util.styleNode).to.not.be.equal(undefined)
    expect(riot.util.styleNode.tagName).to.be.equal('STYLE')

    // test style isn't injected yet
    var styles = getRiotStyles(riot)
    expect(styles).not.to.match(/\bparsed-style\s*\{/)

    // define a styled tag
    riot.tag('runtime-style-parsing', '<div></div>', '.parsed-style { color: red; }', '', function() { })

    // test style isn't injected by the simple tag definition
    styles = getRiotStyles(riot)
    expect(styles).not.to.match(/\bparsed-style\s*\{/)

    // mount the tag
    injectHTML(['<runtime-style-parsing></runtime-style-parsing>' ])
    var tag = riot.mount('runtime-style-parsing')[0]

    // test style is correctly injected
    styles = getRiotStyles(riot)
    expect(styles).to.match(/\bparsed-style\s*\{\s*color:\s*red;\s*}/)

    // remount (unmount+mount)
    tag.unmount(true)
    tag = riot.mount('runtime-style-parsing')[0]
    expect(tag).to.not.be.equal(undefined)

    // test remount does not affect style
    styles = getRiotStyles(riot)
    expect(styles).to.match(/\bparsed-style\s*\{\s*color:\s*red;\s*}/)

    // test remount does not duplicate rule
    expect(styles.match(/\bparsed-style\s*\{/g)).to.have.length(1)
  })


})
