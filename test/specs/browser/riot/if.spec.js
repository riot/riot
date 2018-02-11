import {
  injectHTML,
  expectHTML,
  $$,
  fireEvent
} from '../../../helpers/index'


// include special tags to test specific features
import '../../../tag/if-mount.tag'
import '../../../tag/nested-child.tag'
import '../../../tag/if-unmount.tag'
import '../../../tag/named-unmount.tag'
import '../../../tag/bug-2229.tag'

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

    expectL2(tag.refs.ff, false)
    expectL2(tag.refs.ft, false)

    expectL2(tag.refs.tf, true)
    expectCond(tag.refs.tf, false)

    expectL2(tag.refs.tt, true)
    expectCond(tag.refs.tt, true)

    tag.refs.tf.tags['if-level2'].toggleCondition()
    expectCond(tag.refs.tf, true)

    tag.refs.ft.toggleCondition()
    expectL2(tag.refs.ft, true)
    expectCond(tag.refs.ft, true)

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

  it('refs are removed from parent when element leaves DOM', function() {
    injectHTML('<named-unmount></named-unmount>')
    var tag = riot.mount('named-unmount')[0]

    expect(tag.refs.first).to.be.undefined
    expect(tag.refs.second).to.be.undefined

    tag.update({cond: true, items: ['third']})

    expect(tag.refs.first).to.be.ok
    expect(tag.refs.second).to.be.ok
    expect(tag.refs.third).to.be.ok

    tag.update({cond: false, items: []})

    expect(tag.refs.first).to.be.undefined
    expect(tag.refs.second).to.be.undefined
    expect(tag.refs.third).to.be.undefined

    tag.unmount()
  })

  it('Conditional tags should not inherit from the parent unless they are in a loop', function() {
    injectHTML('<nested-child></nested-child>')
    var tag = riot.mount('nested-child')[0]
    expect(tag.tags.child[0].name).to.be.equal(undefined)

    tag.unmount()
  })

  it('A custom tag with an if dispatches the "mount", "update" and "updated" properly', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    var spy = sinon.spy(), tag

    riot.tag('inner', '<br>', function() {
      this.on('mount', spy)
      this.on('update', spy)
      this.on('updated', spy)
    })
    riot.tag('riot-tmp', '<inner if="{cond}" />', function() {
      this.cond = false
    })

    tag = riot.mount('riot-tmp')[0]
    expect(spy).to.not.have.been.called

    tag.update({cond: true})
    expect(spy).to.have.been.calledOnce // only 'mount' event

    tag.update({cond: true})
    expect(spy).to.have.been.calledThrice // 'update' and 'updated'

    tag.unmount()
  })

  it('Custom tags with an if will dispatch the "mount" event only when the flag is', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('inner', '<br>')
    riot.tag('riot-tmp', '<inner each="{item in items}" if="{cond}" />', function() {
      this.items = [1]
      this.cond = true
    })
    var tag = riot.mount('riot-tmp')[0]

    expectHTML(tag).to.be.equal('<inner><br></inner>')

    tag.update({cond: false})
    expectHTML(tag).to.be.equal('')
    expect(tag.tags.inner).to.be.equal(undefined)

    tag.update({cond: true})
    expectHTML(tag).to.be.equal('<inner><br></inner>')
    expect(tag.tags.inner).not.to.be.equal(undefined)

    tag.unmount()
  })

  it('Custom tags with an if and multiple mixins will not throw (see #2100)', function() {
    injectHTML('<riot-tmp></riot-tmp>')

    var myMixin = {}
    var myMixin2 = {}

    riot.tag('inner', '<div>I am child</div>', function() {
      this.mixin(myMixin)
      this.mixin(myMixin2)
    })

    riot.tag('riot-tmp', '<inner if="{cond}" />', function() {
      this.cond = true
    })

    var tag = riot.mount('riot-tmp')[0]

    expectHTML(tag).to.be.equal('<inner><div>I am child</div></inner>')

    tag.update({cond: false})
    expectHTML(tag).to.be.equal('')
    expect(tag.tags.inner).to.be.equal(undefined)

    tag.update({cond: true})
    expectHTML(tag).to.be.equal('<inner><div>I am child</div></inner>')
    expect(tag.tags.inner).not.to.be.equal(undefined)

    tag.unmount()
  })


  it('each anonymous with an if', function() {
    injectHTML('<riot-tmp></riot-tmp>')
    riot.tag('riot-tmp', `
      <div each="{item, i in items}" if="{item.cond}">{i}</div>
    `, function() {
      this.items = [{cond: true}, {cond: false}]
    })
    var tag = riot.mount('riot-tmp')[0]
    expectHTML(tag).to.be.equal('<div>0</div>')
    tag.items[1].cond = true
    tag.update()
    expectHTML(tag).to.be.equal('<div>0</div><div>1</div>')
    tag.unmount()
  })

  it('if directive on a select should update properly the dom', function() {
    injectHTML('<bug-2229></bug-2229>')
    var tag = riot.mount('bug-2229')[0]

    expectHTML(tag.root).to.be.equal('<div><select><option value="1">One</option><option value="2">Two</option></select></div>')
    tag.flag = false
    tag.update()
    expectHTML(tag.root).to.be.equal('<div></div>')
    tag.flag = true
    tag.update()
    expectHTML(tag.root).to.be.equal('<div><select><option value="1">One</option><option value="2">Two</option></select></div>')

    tag.unmount()
  })

  it('conditional custom tags shouldn\'t dispatch only one "mount" event if toggled mounted', () => {
    injectHTML('<riot-tmp></riot-tmp>')
    const mountEvent = sinon.spy()

    riot.tag('riot-tmp', `
      <riot-tmp-sub if="{ showChild }"></riot-tmp-sub>
      <button ref="button" onclick="{ toggle }">btn</button>
    `, function() {
      this.showChild = true
      this.on('mount', () => {
        this.update()
      })
      this.toggle = () => this.update()
    })

    riot.tag('riot-tmp-sub', '<p>subtag</p>', function() {
      this.on('mount', mountEvent)
    })

    const [tag] = riot.mount('riot-tmp')

    fireEvent(tag.refs.button, 'click')
    expect(mountEvent, 'mount event').to.have.been.calledOnce
    tag.unmount()
  })
})
