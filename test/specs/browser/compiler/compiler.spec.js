/* global defaultBrackets */

import {
  injectHTML,
  $,
  getRiotStyles
} from '../../../helpers/index'

//import '../../../tag/bug-2369.tag'


describe('Riot compiler', function() {

  beforeEach(function() {
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
      '</timetable>'
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
      expect(styles).to.match(/\bcustom-parsers ?\{\s*color: red;}/)

      tag.unmount()
      done()
    })

  })

  // this test in theory goes in style.spec.js
  it('scoped css tag supports htm5 syntax, multiple style tags', function (done) {
    injectHTML('<style-tag3></style-tag3><style-tag4></style-tag4>')
    this.timeout(5000)
    riot.compile(['./tag/~style-tag3.tag'], function() {
      checkCSS(riot.mount('style-tag3')[0], '4px')
      delete riot.parsers.css.cssup
      function checkCSS(t, x) {
        t.update()
        var e = t.root.firstElementChild
        expect(e.tagName).to.be.equal('P')
        expect(window.getComputedStyle(e, null).borderTopWidth).to.be.equal(x)
        t.unmount()
      }
      done()
    })
  })

  it('Passing options to the compiler through compile (v2.3.12)', function () {
    var str = '<passing-options>\n  <p>\n  </p>\nclick(e){}\n</passing-options>',
      result = riot.compile(str, true, {compact: true, type: 'none'})
    expect(result).to.contain('<p></p>')          // compact: true
    expect(result).to.contain('\nclick(e){}\n')   // type: none
  })

  it('compile detect changes in riot.settings.brackets', function() {
    var compiled

    // change the brackets
    riot.util.brackets.set('{{ }}')
    expect(riot.settings.brackets).to.be.equal('{{ }}')
    compiled = riot.compile('<my>{{ time }} and { time }</my>', true)
    expect(compiled).to.contain("riot.tag2('my', '{{time}} and { time }',")

    // restore using riot.settings
    riot.settings.brackets = defaultBrackets
    compiled = riot.compile('<my>{ time } and { time }</my>', true)
    expect(riot.util.brackets.settings.brackets).to.be.equal(defaultBrackets)
    expect(compiled).to.contain("riot.tag2('my', '{time} and {time}',")

    // change again, now with riot.settings
    riot.settings.brackets = '{{ }}'
    compiled = riot.compile('<my>{{ time }} and { time }</my>', true)
    expect(riot.util.brackets.settings.brackets).to.be.equal('{{ }}')
    expect(compiled).to.contain("riot.tag2('my', '{{time}} and { time }',")

    riot.util.brackets.set(undefined)
    expect(riot.settings.brackets).to.be.equal(defaultBrackets)
    compiled = riot.compile('<my>{ time } and { time }</my>', true)
    expect(compiled).to.contain("riot.tag2('my', '{time} and {time}',")
  })

  it('mount search data-is attributes for tag names only #1463', function () {
    var
      names = ['x-my_tag1', 'x-my-tag2', 'x-my-3tag', 'x-m1-3tag'],
      templ = '<@>X</@>',
      name

    // test browser capability for match unquoted chars in [-_A-Z]
    for (let i = 0; i < names.length; ++i) {
      injectHTML(`<div data-is="${names[i]}"></div>`)
      riot.compile(templ.replace(/@/g, names[i]))
      let tag = riot.mount(names[i])[0]
      expect($('*[data-is=' + names[i] + ']').innerHTML).to.be.equal('X')
      tag.unmount()
    }

    // double quotes work, we can't mount html element named "22"
    name = 'x-my-tag3'
    injectHTML(`<${name} name="22"></${name}>`)
    riot.compile(templ.replace(/@/g, name))
    var tag = riot.mount('*[name="22"]')[0]
    expect($(name).innerHTML).to.be.equal('X')
    tag.unmount()
  })

  it('tags containing regex get properly compiled', function(done) {
    injectHTML('<bug-2369></bug-2369>')
    riot.compile('./tag/bug-2369.tag', function () {
      const tag = riot.mount('bug-2369')[0]
      expect(tag.root).to.be.ok
      tag.unmount()
      done()
    })
  })

  it('throw compile.error in case a file will be not found', function(done) {
    // override the compile error function
    riot.compile.error = () => done()
    riot.compile('./foo/bar.tag')
  })
})
