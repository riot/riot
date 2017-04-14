
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

    // teardown
    riot.unregister('riot-tmp')
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

    riot.unregister('riot-tmp')
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

    riot.unregister('riot-tmp')
    tag.unmount()
  })
})