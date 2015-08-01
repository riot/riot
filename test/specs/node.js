var glob = require('glob'),
    cheerio = require('cheerio')

describe('Node/io.js', function() {

  it('require tags', function(done) {
    glob('../tag/*.tag', { cwd: __dirname }, function (err, tags) {
      expect(err).to.be(null)
      tags.forEach(function(tag) {
        expect(require(tag)).to.be.ok()
      })
      done()
    })
  })

  it('render tag: timer', function() {
    var tmr = riot.render('timer', { start: 42 })
    expect(tmr).to.be('<timer><p>Seconds Elapsed: 42</p></timer>')
  })

  it('render tag: if-test', function() {
    var ift = riot.render('if-test')
    var $ = cheerio.load(ift)
    var els = $('if-child')
    expect(els.length).to.be(1)
    expect(els.first().attr('style')).to.be('display: none;')
  })

  it('render tag: loop-child', function() {
    var lpc = riot.render('loop-child')
    var $ = cheerio.load(lpc)
    expect($('looped-child').length).to.be(2)
    var h3s = $('h3')
    expect(h3s.length).to.be(2)
    expect(h3s.first().text()).to.be('one')
    expect(h3s.last().text()).to.be('two')
  })

  it('render tag: loop-replace', function() {
    var lpr = riot.render('loop-replace')
    var $ = cheerio.load(lpr)
    var els = $('strong')
    expect(els.length).to.be(3)
    expect(els.first().text()).to.be('a')
    expect(els.first().next().text()).to.be('9')
    expect(els.last().text()).to.be('3')
  })

  it('render tag: blog (using yield)', function() {
    var blg = riot.render('blog')
    var $ = cheerio.load(blg)
    var els = $('h2')
    expect(els.length).to.be(2)
    expect(els.first().text()).to.be('post 1')
    expect(els.last().text()).to.be('post 2')
  })

})
