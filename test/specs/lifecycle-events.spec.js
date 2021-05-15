import * as riot from '../../src/riot'
import {bindingTypes, expressionTypes, template} from '@riotjs/dom-bindings'
import CommentsAndExpressions from '../components/comments-and-expressions.riot'
import ConditionalSelectOption from '../components/conditional-select-option.riot'
import EachCustomChildrenComponents from '../components/each-custom-children-components.riot'
import ExpressionParts from '../components/expression-parts.riot'
import InvalidPureCssComponent from '../components/invalid-pure-css-component.riot'
import InvalidPureHtmlComponent from '../components/invalid-pure-html-component.riot'
import NativeAttributes from '../components/native-attributes.riot'
import NativeInlineEvents from '../components/native-inline-events.riot'
import ParentContext from '../components/parent-context.riot'
import ParentValueProp from '../components/parent-value-prop.riot'
import PureComponent from '../components/pure-component.riot'
import PureObject from '../components/pure-object.riot'
import SimpleComponent from '../components/simple.riot'

import {expect} from 'chai'
import {spy} from 'sinon'

describe('lifecycle events', () => {
  it('riot.component can mount anonymous components', () => {
    const mountedSpy = spy()
    const MyComponent = {
      exports: {
        onMounted() {
          mountedSpy()
        }
      }
    }

    const element = document.createElement('div')
    const component = riot.component(MyComponent)(element, {isActive: true})
    expect(component.root).to.be.equal(element)
    expect(component.props.isActive).to.be.ok
    expect(mountedSpy).to.have.been.calledOnce
    component.unmount()
  })

  it('unmounting components should not preserve the root tag', () => {
    const component = riot.component(SimpleComponent)
    const element = document.createElement('div')
    document.body.appendChild(element)

    const tag = component(element)

    expect(element.parentNode).to.be.ok

    tag.unmount()
    expect(element.parentNode).to.be.not.ok
  })

  it('unmounting components can preserve the root tag', () => {
    const component = riot.component(SimpleComponent)
    const element = document.createElement('div')
    document.body.appendChild(element)

    const tag = component(element, {})

    expect(element.parentNode).to.be.ok
    tag.unmount(true)
    expect(element.parentNode).to.be.ok

    document.body.removeChild(element)
  })

  it('the shouldUpdate method can block all the components updates', () => {
    const updatedSpy = spy()
    const MyComponent = {
      exports: {
        onUpdated() {
          updatedSpy()
        },
        shouldUpdate() {
          return false
        }
      }
    }

    const element = document.createElement('my-component')
    const component = riot.component(MyComponent)(element)

    component.update()
    component.update()
    component.update()

    expect(updatedSpy).to.not.have.been.called

    component.unmount()
  })

  it('expressions will be evaluated only once', () => {
    const handler = spy()
    const element = document.createElement('each-custom-children-components')
    const component = riot.component(EachCustomChildrenComponents)(element, {
      onClick: handler,
      items: [{value: 'hello'}, {value: 'there'}]
    })

    expect(handler).to.be.callCount(component.state.items.length)
    component.unmount()
  })

  it('children components can be updated without throwing (see bug #2728)', () => {
    const handler = spy()
    const element = document.createElement('each-custom-children-components')
    const component = riot.component(EachCustomChildrenComponents)(element, {
      onClick: handler,
      items: [{value: 'hello'}, {value: 'there'}]
    })

    expect(() => {
      component.update({
        items: [{value: 'goodbye'}]
      })
    }).to.not.throw()

    component.unmount()
  })

  it('expression mixed with static text will be properly evaluated', () => {
    const element = document.createElement('expression-parts')
    const component = riot.component(ExpressionParts)(element, {
      val: 'hello'
    })

    expect(component.$('p').innerHTML).to.be.equal('hellothere')
    expect(component.$('p').getAttribute('attr')).to.be.equal('hellothere')
    component.unmount()
  })

  it('the value attribute will be passed as prop to children tags', () => {
    const element = document.createElement('parent-value-prop')
    const component = riot.component(ParentValueProp)(element, {
      onClick() {
      },
      value: 'hello'
    })

    expect(component.$('input').value).to.be.equal('hello')
    component.unmount()
  })

  it('native Element attributes will be properly rendered', () => {
    const element = document.createElement('native-attributes')
    const component = riot.component(NativeAttributes)(element, {
      isHidden: true,
      myId: 'hello',
      remove: 'remove'
    })
    const p = component.$('p')
    expect(p.hidden).to.be.ok
    expect(p.remove).to.be.a('function')
    component.unmount()
  })

  it('static attributes get preserved', () => {
    const element = document.createElement('conditional-select-option')
    const component = riot.component(ConditionalSelectOption)(element)

    const select = component.$('select')

    expect(select.value).to.be.equal('Due')

    component.unmount()
  })

  it('inline native events do not crash compilation', () => {
    expect(NativeInlineEvents).to.be.ok
  })

  it('riot.component accepts custom slots and attributes', () => {
    const mountedSpy = spy()
    const MyComponent = {
      template: () => template('<slot/>', [{
        type: bindingTypes.SLOT,
        selector: 'slot',
        name: 'default'
      }]),
      exports: {
        onMounted() {
          mountedSpy()
        }
      }
    }

    const element = document.createElement('div')
    const component = riot.component(MyComponent)(element, {}, {
      slots: [{
        id: 'default',
        html: 'hello'
      }],
      attributes: [{
        type: expressionTypes.ATTRIBUTE,
        name: 'class',
        evaluate() {
          return 'hello'
        }
      }]
    })
    expect(component.root).to.be.equal(element)
    expect(component.root.getAttribute('class')).to.be.equal('hello')
    expect(component.root.innerHTML).to.be.equal('hello')
    expect(mountedSpy).to.have.been.calledOnce
    component.unmount()
  })

  it('riot.pure doesn\'t accept objects', () => {
    const element = document.createElement('pure-object')
    expect(() => {
      riot.component(PureObject)(element)
    }).to.throw('riot.pure accepts only arguments of type "function"')
  })

  it('riot.pure components can not have html', () => {
    const element = document.createElement('invalid-pure-html-component')
    expect(() => {
      riot.component(InvalidPureHtmlComponent)(element)
    }).to.throw('Pure components can not have html')
  })

  it('riot.pure components can not have css', () => {
    const element = document.createElement('invalid-pure-css-component')
    expect(() => {
      riot.component(InvalidPureCssComponent)(element)
    }).to.throw('Pure components do not have css')
  })

  it('riot.pure components get properly rendered', () => {
    const element = document.createElement('pure-component')
    const component = riot.component(PureComponent)(element)

    expect(element.getAttribute('is-pure')).to.be.equal('is-pure')
    component.unmount()

    expect(element.getAttribute('is-pure')).to.be.not.ok
  })

  it('html comments do not break the expressions rendering', () => {
    const element = document.createElement('comments-and-expressions')
    const component = riot.component(CommentsAndExpressions)(element)
    const h1 = component.$('h1')

    expect(h1.innerHTML).to.be.equal('above the commentbelow the comment')

    component.unmount()
  })

  it('child components have access to the parent scope throughout their entire lifecycle', () => {
    const element = document.createElement('parent-context')
    const component = riot.component(ParentContext)(element)

    component.update()
    component.unmount()

    expect([...component.test]).to.be.deep.equal(['onBeforeMount', 'onMounted', 'onBeforeUpdate', 'onUpdated', 'onBeforeUnmount', 'onUnmounted'])
  })
})
