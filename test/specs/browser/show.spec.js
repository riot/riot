
import {
  injectHTML,
  $$
} from '../../helpers/index'

import '../../tag/show-bug-2125.tag'

const expect = chai.expect

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