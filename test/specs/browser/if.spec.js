import {
  injectHTML,
  $,
  $$,
  normalizeHTML
} from '../../helpers/index'

import riot from 'riot'

// include special tags to test specific features
import '../../tag/if-mount.tag'
import '../../tag/if-unmount.tag'
import '../../tag/named-unmount.tag'

const expect = chai.expect

describe('Riot if', function() {
  it('child tags are only rendered when if-condition is truthy', function() {

    injectHTML('<if-mount></if-mount>')

    var tag = riot.mount('if-mount')[0]

    var expectL2 = function(base, exist) {
      var ex = expect(base.tags['if-level2'])
      exist ? ex.to.not.be.undefined : ex.to.be.undefined
      expect($$('if-level2', base.root).length).to.be.equal(exist ? 1 : 0)
    }

    var expectCond = function(base, exist) {
      var ex = expect(base.tags['if-level2'].tags['conditional-tag'])
      exist ? ex.to.not.be.undefined : ex.to.be.undefined
      expect($$('conditional-tag', base.root).length).to.be.equal(exist ? 1 : 0)
    }

    expectL2(tag.ff, false)
    expectL2(tag.ft, false)

    expectL2(tag.tf, true)
    expectCond(tag.tf, false)

    expectL2(tag.tt, true)
    expectCond(tag.tt, true)

    tag.tf.tags['if-level2'].toggleCondition()
    expectCond(tag.tf, true)

    tag.ft.toggleCondition()
    expectL2(tag.ft, true)
    expectCond(tag.ft, true)

    tag.unmount()
  })

  it('tags under a false if statement are unmounted', function() {

    injectHTML('<if-unmount></if-unmount>')

    var cb = sinon.spy()
    var tag = riot.mount('if-unmount', {cb: cb})[0]

    // check that our child tags exist, and record their ids
    expect(tag.tags['if-uchild'].length).to.be.equal(3)
    var firstIds = tag.tags['if-uchild'].map(function(c) { return c._riot_id })

    // set if conditions to false
    tag.items[0].bool = false
    tag.update({cond: false})

    // ensure the tags are gone, and that their umount callbacks were triggered
    expect(tag.tags['if-uchild']).to.be.undefined
    expect(cb).to.have.been.calledThrice

    // set conditions back to true
    tag.items[0].bool = true
    tag.update({cond: true})

    // ensure the tags exist, and get their ids
    expect(tag.tags['if-uchild'].length).to.be.equal(3)
    var secondIds = tag.tags['if-uchild'].map(function(c) { return c._riot_id })

    // ensure that all of the new tags are different instances from the first time
    var intersection = secondIds.filter(function(id2) {
      return firstIds.indexOf(id2) > -1
    })
    expect(intersection.length).to.be.equal(0)

    tag.unmount()
  })

  it('named refs are removed from parent when element leaves DOM', function() {
    injectHTML('<named-unmount></named-unmount>')
    var tag = riot.mount('named-unmount')[0]

    expect(tag.first).to.be.undefined
    expect(tag.second).to.be.undefined

    tag.update({cond: true, items: ['third']})

    expect(tag.first).to.be.an.instanceof(HTMLElement)
    expect(tag.second).to.be.an.instanceof(HTMLElement)
    expect(tag.third).to.be.an.instanceof(HTMLElement)

    tag.update({cond: false, items: []})

    expect(tag.first).to.be.undefined
    expect(tag.second).to.be.undefined
    expect(tag.third).to.be.undefined

    tag.unmount()
  })


})