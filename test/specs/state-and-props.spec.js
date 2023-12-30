import * as riot from '../../src/riot.js'

import ComponentWithGetters from '../components/component-with-getters.riot'
import DashedAttributeParent from '../components/dashed-attribute-parent.riot'
import EachAndSpreadAttribute from '../components/each-and-spread-attribute.riot'
import EachRootAttributes from '../components/each-root-attributes.riot'
import NestedImportsComponent from '../components/nested-imports.riot'
import ShorthandAttribute from '../components/shorthand-attribute.riot'
import SimpleComponent from '../components/simple.riot'
import SpreadAttribute from '../components/spread-attribute.riot'
import StaticAttribute from '../components/static-attribute.riot'
import TitleProps from '../components/title-prop.riot'
import Issue2978Parent from '../components/issue-2978-parent.riot'

import { expect } from 'chai'
import { spy } from 'sinon'

describe('components state and props', () => {
  it('components will receive and update properly their state property', () => {
    const element = document.createElement('simple-component')
    const component = riot.component(SimpleComponent)(element, {
      message: 'hello',
    })
    const p = component.$('p')
    expect(p.innerHTML).to.be.equal('hello')

    component.update({ message: 'goodbye' })

    expect(p.innerHTML).to.be.equal('goodbye')

    component.unmount()
  })

  it('Initial props should not be lost on the consequent updates', () => {
    const element = document.createElement('title-prop')
    const component = riot.component(TitleProps)(element, { title: 'hello' })

    expect(component.props.title).to.be.equal('hello')

    component.update()

    expect(component.props.title).to.be.equal('hello')

    component.unmount()
  })

  it('Initial props can be also a function', () => {
    const element = document.createElement('title-prop')
    const component = riot.component(TitleProps)(element, () => ({
      title: 'hello',
    }))

    expect(component.props.title).to.be.equal('hello')

    component.update()

    expect(component.props.title).to.be.equal('hello')

    component.unmount()
  })

  it('nested components can be loaded in runtime via imports statements', () => {
    const element = document.createElement('nested-imports')

    const component = riot.component(NestedImportsComponent)(element, {
      message: 'hello',
    })
    const p = component.$('p')
    expect(p.innerHTML).to.be.equal('hello')

    component.update({ message: 'goodbye' })

    expect(p.innerHTML).to.be.equal('goodbye')

    component.unmount()
  })

  it('nested components can update properly their internal state', () => {
    const element = document.createElement('nested-imports')

    const component = riot.component(NestedImportsComponent)(element, {
      message: 'hello',
    })
    const p = component.$('p')

    expect(p.innerHTML).to.be.equal('hello')
    p.click()
    expect(p.innerHTML).to.be.equal('clicked')

    component.unmount()
  })

  it('simple attribute can be properly evaluated', () => {
    const mountedSpy = spy()
    const MyComponent = {
      css: 'my-component { color: red; }',
      exports: {
        onMounted() {
          expect(this.props.name).to.be.equal('foo')
          mountedSpy()
        },
      },
    }

    const element = document.createElement('my-component')

    element.setAttribute('name', 'foo')

    const component = riot.component(MyComponent)(element)

    expect(mountedSpy).to.have.been.calledOnce
    component.unmount()
  })

  it('shorthand attributes can be properly rendered', () => {
    const element = document.createElement('shorthand-attribute')

    const component = riot.component(ShorthandAttribute)(element)
    const a = component.$('a')

    expect(a.getAttribute('href')).to.be.equal(component.href)
    expect(a.getAttribute('target')).to.be.equal(component.target)
    component.unmount()
  })

  it('spread attributes can be properly evaluated', () => {
    const element = document.createElement('spread-attribute')
    const component = riot.component(SpreadAttribute)(element)

    expect(component.$('p').getAttribute('hidden')).to.be.ok
    expect(component.$('child').getAttribute('hidden')).to.be.ok
    expect(component.$('child p')).to.be.ok

    component.unmount()
  })

  it('spread attributes works also together with each directives', () => {
    const element = document.createElement('each-and-spread-attribute')
    const component = riot.component(EachAndSpreadAttribute)(element)

    expect(component.$$('child')[0].getAttribute('name')).to.be.ok
    expect(component.$$('child')[1].getAttribute('name')).to.be.ok

    component.unmount()
  })

  it('dashed attributes will be camelized', () => {
    const element = document.createElement('dashed-attribute-parent')
    const component = riot.component(DashedAttributeParent)(element)

    expect(component.$('dashed-attribute-child p').innerHTML).to.be.equal(
      'hello',
    )

    component.unmount()
  })

  it('static attributes get properly evaluated as props', () => {
    const element = document.createElement('static-attribute')
    const component = riot.component(StaticAttribute)(element)

    expect(component.$('h1').innerHTML).to.be.equal('hello')

    // check if static attributes persist also after an update call
    // see also https://github.com/riot/riot/issues/2985
    component.update()
    expect(component.$('h1').innerHTML).to.be.equal('hello')

    component.unmount()
  })

  it('root attributes in an each loop will be properly rendered', () => {
    const element = document.createElement('each-root-attributes')
    const component = riot.component(EachRootAttributes)(element)

    expect(component.$('p').classList.contains('something')).to.be.ok

    component.unmount()
  })

  it('components with getters should be properly rendered (issue #2908)', () => {
    const element = document.createElement('component-with-getters')
    const component = riot.component(ComponentWithGetters)(element, {
      message: 'hello',
    })
    const h1 = component.$('h1')
    const p = component.$('p')

    expect(h1.innerHTML).to.be.equal(component.state.message)
    expect(p.innerHTML).to.be.equal('hello')

    component.update({ message: 'goodbye' })

    expect(h1.innerHTML).to.be.equal('goodbye')
    expect(p.innerHTML).to.be.equal('hello')
  })

  it("props passed to children shouldn't be merged (issue #2978)", () => {
    const element = document.createElement('issue-2978-parent')
    const component = riot.component(Issue2978Parent)(element)
    const p = component.$('p')

    expect(p.innerHTML).to.be.equal(JSON.stringify(component.state))

    component.state = { b: 'b' }
    component.update()

    expect(p.innerHTML).to.be.equal(JSON.stringify(component.state))
  })
})
