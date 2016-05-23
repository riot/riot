import {
  injectHTML,
  $,
  $$,
  normalizeHTML,
  getRiotStyles
} from '../../helpers/index'

import riot from 'riot'

// include special tags to test specific features
import '../../tag/style-tag.tag'
import '../../tag/style-tag2.tag'
import '../../tag/style-tag4.tag'
import '../../tag/style-tag5.tag'

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
    var stag = document.querySelector('style[type=riot]')
    expect(stag).to.be.equal(null)
  })

  it('scoped css tag supports htm5 syntax, multiple style tags', function () {

    injectHTML('<style-tag5></style-tag5><style-tag4></style-tag4>')

    checkCSS(riot.mount('style-tag5')[0], '3px')
    checkCSS(riot.mount('style-tag4')[0], '2px', 1)

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
      t.unmount()
    }
  })

})