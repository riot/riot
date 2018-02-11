import {
  injectHTML,
  $,
  $$
} from '../../../helpers/index'

describe('Riot show/hide', function() {
  it('the show directive works as expected', function() {
    riot.tag('riot-tmp', '<p show="{ isVisible }">foo</p><p hide="{ isVisible }">foo</p>')
    injectHTML('<riot-tmp></riot-tmp>')
    var tag = riot.mount('riot-tmp')[0],
      p = $$('p', tag.root)

    expect(p[0].style.display).to.be.equal('none')
    expect(p[0].hidden).to.be.ok
    expect(p[1].style.display).to.be.not.equal('none')
    expect(p[1].hidden).to.be.not.ok
    tag.isVisible = true
    tag.update()
    expect(p[0].style.display).to.be.not.equal('none')
    expect(p[0].hidden).to.be.not.ok
    expect(p[1].style.display).to.be.equal('none')
    expect(p[1].hidden).to.be.ok
    tag.isVisible = false
    tag.update()
    expect(p[0].style.display).to.be.equal('none')
    expect(p[0].hidden).to.be.ok
    expect(p[1].style.display).to.be.not.equal('none')
    expect(p[1].hidden).to.be.not.ok

    tag.unmount()
  })

  it('the show directive gets preserved also in case of style expressions updates', function() {
    riot.tag('riot-tmp', '<p show="{ isVisible }" riot-style="{ \'color:red\' }">foo</p>')
    injectHTML('<riot-tmp></riot-tmp>')
    var tag = riot.mount('riot-tmp')[0],
      p = $('p', tag.root)

    expect(p.style.display).to.be.equal('none')
    expect(p.hidden).to.be.ok
    expect(p.style.color).to.be.equal('red')
    tag.isVisible = true
    tag.update()

    expect(p.style.display).to.be.not.equal('none')
    expect(p.hidden).to.be.not.ok
    expect(p.style.color).to.be.equal('red')

    tag.unmount()
  })

  it('the show directive works properly also against objects', function() {
    riot.tag('riot-tmp', '<p show="{ obj1 || obj2 }">foo</p>')
    injectHTML('<riot-tmp></riot-tmp>')
    var tag = riot.mount('riot-tmp')[0],
      p = $('p', tag.root)

    tag.obj1 = undefined
    tag.obj2 = undefined

    expect(p.hidden).to.be.ok

    tag.obj1 = { a: 'foo' }
    tag.obj2 = false

    tag.update()

    expect(p.hidden).to.be.not.ok
    tag.unmount()
  })

  it('the show directive evaluates also the parent values', function() {
    riot.tag('riot-tmp', `
      <riot-tmp-sub each="{ item in items }" show="{selected === item}"></riot-tmp-sub>
    `, function() {
      this.items = ['uno', 'due']
      this.selected = 'uno'
    })
    riot.tag('riot-tmp-sub', '<p>{ opts.item }</p>')
    injectHTML('<riot-tmp></riot-tmp>')

    var tag = riot.mount('riot-tmp')[0]

    expect(tag.tags['riot-tmp-sub'].length).to.be.equal(2)

    expect(tag.tags['riot-tmp-sub'][0].root.hidden).to.be.not.ok
    expect(tag.tags['riot-tmp-sub'][1].root.hidden).to.be.ok

    tag.unmount()
  })

  it('the show directive gives priority to the child values (see #2333)', function() {
    riot.tag('riot-tmp', `
      <riot-tmp-sub show="{number === 1}"></riot-tmp-sub>
    `, function() {
      this.number = 1
    })
    riot.tag('riot-tmp-sub', '<p ref="p" if={number === 2}>{ opts.item }</p>', function() {
      this.number = 2
    })
    injectHTML('<riot-tmp></riot-tmp>')

    var tag = riot.mount('riot-tmp')[0]

    expect(tag.tags['riot-tmp-sub'].refs.p.hidden).to.be.not.ok

    tag.unmount()
  })

  it('the show directive combined with yield behaves consistently like the if directive (see #2448)', function() {
    riot.tag('riot-tmp', `<riot-tmp-sub>
        <h1 if='{parent.doIt}'>show</h1>
        <h2 show='{parent.doIt}'>show</h2>
      </riot-tmp-sub>`,
    function() {
      this.doIt = true
    })

    riot.tag('riot-tmp-sub', '<yield/>')

    injectHTML('<riot-tmp></riot-tmp>')

    const tag = riot.mount('riot-tmp')[0],
      subRoot = tag.tags['riot-tmp-sub'].root


    expect($('h1', subRoot)).to.be.ok
    expect($('h2', subRoot).hidden).to.be.not.ok

    tag.doIt = false
    tag.update()

    expect($('h1', subRoot)).to.be.not.ok
    expect($('h2', subRoot).hidden).to.be.ok

    tag.unmount()
  })
})