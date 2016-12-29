
import {
  injectHTML,
  $$,
  $
} from '../../helpers/index'

import '../../tag/show-bug-2125.tag'

const expect = chai.expect

const getterSetterMixin = {
  _isVisible: false
}

Object.defineProperty(getterSetterMixin, 'isVisible', {
  get: function() {
    return this._isVisible
  },
  set: function(val) {
    this._isVisible = val
  }
})

it('the show directive evaluates also the parent properties', function() {
  injectHTML('<show-bug-2125></show-bug-2125>')
  var tag = riot.mount('show-bug-2125')[0],
    children = $$('show-bug-2125-child', tag.root)

  expect(tag.tags['show-bug-2125-child']).to.have.length(2)
  expect(children).to.have.length(2)
  expect(children[0].style.display).to.be.not.equal('none')
  expect(children[1].style.display).to.be.equal('none')

  tag.unmount()
})

it('the show directive works as expected', function() {
  riot.tag('riot-show-tmp', '<p show="{ isVisible }">foo</p>')
  injectHTML('<riot-show-tmp></riot-show-tmp>')
  var tag = riot.mount('riot-show-tmp')[0],
    p = $('p', tag.root)

  expect(p.style.display).to.be.equal('none')
  tag.isVisible = true
  tag.update()
  expect(p.style.display).to.be.not.equal('none')
  tag.isVisible = false
  tag.update()
  expect(p.style.display).to.be.equal('none')

  // teardown
  riot.unregister('riot-show-tmp')
  tag.unmount()
})

it('the show directive works as expected with mixins using getter / setter descriptors', function() {
  riot.tag('riot-show-tmp', '<p show="{ isVisible }">foo</p>')
  injectHTML('<riot-show-tmp></riot-show-tmp>')
  var tag = riot.mount('riot-show-tmp')[0],
    p = $('p', tag.root)

  tag.mixin(getterSetterMixin)

  expect(p.style.display).to.be.equal('none')
  tag.isVisible = true
  tag.update()
  expect(p.style.display).to.be.not.equal('none')
  tag.isVisible = false
  tag.update()
  expect(p.style.display).to.be.equal('none')

  // teardown
  riot.unregister('riot-show-tmp')
  tag.unmount()
})