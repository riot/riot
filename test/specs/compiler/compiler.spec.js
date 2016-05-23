import {
  injectHTML,
  $,
  $$,
  normalizeHTML,
  appendTag,
  getRiotStyles
} from '../../helpers/index'

import riot from 'riot+compiler' // here the compiler is just the riot+compile

// make sure riot is also globally available
// for the compiler
window.riot = riot

// include special tags to test specific features

const expect = chai.expect

describe('Riot compiler', function() {

  before(function() {
    // adding some custom riot parsers
    // css
    riot.parsers.css.myparser = function(tag, css) {
      return css.replace(/@tag/, tag).replace(' 3px ', ' 4px ')
    }
    // js
    riot.parsers.js.myparser = function(js) {
      return js.replace(/@version/, '1.0.0')
    }
  })

  it('compiler performance', function() {
    var src =  [
      '<foo>',
      '  <p>{ opts.baz } { bar }</p>',

      '  this.bar = "romutus"',

      '</foo>',
      '<timetable>',
      '   <timer ontick={ parent.opts.ontick } start={ time } each={ time, i in times }></timer>',
      '   <foo barz="899" baz="90"></foo>',
      '   <p>{ kama }</p>',

      '   this.times = [ 1, 3, 5 ]',
      '   this.kama = "jooo"',
      '<\/timetable>'
    ].join('\n')

    // check compile is actually compiling the source
    expect(riot.compile(src, true)).to.contain("('timetable', '")

    // compile timer 1000 times and see how long it takes
    var begin = Date.now()

    for (var i = 0; i < 1000; i++) {
      riot.compile(src, true)
    }

    expect(Date.now() - begin).to.be.below(1500) // compiler does more now

  })

  it('compile a custom tag using custom css and js parsers', function(done) {

    injectHTML('<custom-parsers></custom-parsers>')

    riot.compile('./tag/~custom-parsers.tag', function() {

      var tag = riot.mount('custom-parsers')[0],
        styles = getRiotStyles(riot)

      expect(tag).to.be.an('object')
      expect(tag.version).to.be.equal('1.0.0')
      expect(styles).to.match(/\bcustom-parsers\ ?\{\s*color: red;}/)

      tag.unmount()
      done()
    })

  })

  // this test in theory goes in style.spec.js
  it('scoped css tag supports htm5 syntax, multiple style tags', function (done) {
    injectHTML('<style-tag3></style-tag3><style-tag4></style-tag4>')
    this.timeout(5000)
    riot.compile(['./tag/~style-tag3.tag', './tag/style-tag4.tag'], function() {
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
        t.unmount()
      }
      done()
    })
  })
})