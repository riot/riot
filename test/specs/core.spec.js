import * as riot from '../../src/riot'
import {bindingTypes, expressionTypes, template} from '@riotjs/dom-bindings'
import CommentsAndExpressions from '../components/comments-and-expressions.riot'
import ConditionalSelectOption from '../components/conditional-select-option.riot'
import ConditionalSlotParent from '../components/conditional-slot-parent.riot'
import DashedAttributeParent from '../components/dashed-attribute-parent.riot'
import EachAndSpreadAttribute from '../components/each-and-spread-attribute.riot'
import EachCustomChildrenComponents from '../components/each-custom-children-components.riot'
import EachRootAttributes from '../components/each-root-attributes.riot'
import ExpressionParts from '../components/expression-parts.riot'
import GlobalComponents from '../components/global-components.riot'
import InvalidPureCssComponent from '../components/invalid-pure-css-component.riot'
import InvalidPureHtmlComponent from '../components/invalid-pure-html-component.riot'
import MergeAttributes from '../components/merge-attributes.riot'
import MessageConsumer from '../components/message-consumer.riot'
import NamedSlotsParent from '../components/named-slots-parent.riot'
import NativeAttributes from '../components/native-attributes.riot'
import NativeInlineEvents from '../components/native-inline-events.riot'
import NestedAliasedImportsComponent from '../components/nested-aliased-imports.riot'
import NestedHoc from '../components/nested-hoc.riot'
import NestedImportsComponent from '../components/nested-imports.riot'
import NestedSlot from '../components/nested-slot.riot'
import ParentValueProp from '../components/parent-value-prop.riot'
import ParentWithSlotsComponent from '../components/parent-with-slots.riot'
import PureComponent from '../components/pure-component.riot'
import PureObject from '../components/pure-object.riot'
import RuntimeIsDirective from '../components/runtime-is-directive.riot'
import ShorthandAttribute from '../components/shorthand-attribute.riot'
import SimpleComponent from '../components/simple.riot'
import SimpleSlot from '../components/simple-slot.riot'
import SpreadAttribute from '../components/spread-attribute.riot'
import StaticAttribute from '../components/static-attribute.riot'
import TitleProps from '../components/title-prop.riot'
import VirtualEach from '../components/virtual-each.riot'

import {expect} from 'chai'
import {fireEvent} from '../utils'
import {spy} from 'sinon'

function normalizeInnerHTML(string) {
  return string.replace(/\n/g, '').trim()
}

describe('Riot core api', () => {
  it('riot exports properly its public api', () => {
    expect(riot).to.be.ok
    expect(riot).to.have.all.keys([
      'register',
      'unregister',
      'mount',
      'unmount',
      'install',
      'uninstall',
      'component',
      'pure',
      'version',
      '__'
    ])
  })

  describe('lifecycle events', () => {
    it('riot.component can mount anonymous components', () => {
      const mountedSpy = spy()
      const MyComponent = {
        exports:  {
          onMounted() {
            mountedSpy()
          }
        }
      }

      const element = document.createElement('div')
      const component = riot.component(MyComponent)(element, { isActive: true })
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
        items: [{ value: 'hello'}, { value: 'there'}]
      })

      expect(handler).to.be.callCount(component.state.items.length)
      component.unmount()
    })

    it('children components can be updated without throwing (see bug #2728)', () => {
      const handler = spy()
      const element = document.createElement('each-custom-children-components')
      const component = riot.component(EachCustomChildrenComponents)(element, {
        onClick: handler,
        items: [{ value: 'hello'}, { value: 'there'}]
      })

      expect(() => {
        component.update({
          items: [{ value: 'goodbye'} ]
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
        onClick() {},
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
        exports:  {
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
          evaluate() { return 'hello' }
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
  })

  describe('components registration', () => {
    it('riot.component will mount properly components with css', () => {
      const component = riot.component(SimpleComponent)
      const element = document.createElement('div')
      document.body.appendChild(element)

      const tag = component(element, {})

      expect(tag.root.getAttribute('is')).to.be.equal('simple')
      expect(window.getComputedStyle(tag.root).color).to.be.equal('rgb(255, 0, 0)')

      tag.unmount()
    })

    it('custom components can be registered and unregistered properly', () => {
      const mountedSpy = spy()
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onMounted() {
            mountedSpy()
          }
        }
      })
      const [component] = riot.mount(document.createElement('my-component'))
      expect(mountedSpy).to.have.been.calledOnce
      riot.unregister('my-component')
      component.unmount()
    })

    it('custom components have core helpers and the root property', done => {
      const MyComponent = {
        css: 'my-component { color: red; }',
        exports: {
          onMounted() {
            expect(this.root).to.be.ok
            expect(this.$('div')).to.be.ok
            expect(this.$$('div')).to.be.ok
            done()
          }
        },
        template: () => template('<div>hello</div>')
      }

      const component = riot.component(MyComponent)(document.createElement('my-component'))
      component.unmount()
    })


    it('custom components can be mounted and unmounted properly', () => {
      const destroyedSpy = spy()
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onUnmounted() {
            destroyedSpy()
          }
        }
      })

      const element = document.createElement('my-component')

      riot.mount(element)
      riot.unmount(element)
      expect(destroyedSpy).to.have.been.calledOnce
      riot.unregister('my-component')
    })

    it('custom components can be mounted via "is" attribute', () => {
      const destroyedSpy = spy()

      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onUnmounted() {
            destroyedSpy()
          }
        }
      })
      const element = document.createElement('div')

      element.setAttribute('is', 'my-component')

      riot.mount(element)
      riot.unmount(element)

      expect(destroyedSpy).to.have.been.calledOnce
      riot.unregister('my-component')
    })

    it('pure components can be unmounted', () => {
      const element = document.createElement('div')

      riot.component(PureComponent)(element)

      expect(element.hasAttribute('is-pure')).to.be.ok

      riot.unmount(element)

      expect(element.hasAttribute('is-pure')).to.be.not.ok
    })

    it('custom components can be mounted via user parameter', () => {
      const destroyedSpy = spy()
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onUnmounted() {
            destroyedSpy()
          }
        }
      })
      const element = document.createElement('div')

      riot.mount(element, {}, 'my-component')
      riot.unmount(element)

      expect(destroyedSpy).to.have.been.calledOnce
      riot.unregister('my-component')
    })

    it('custom components can be unmounted by tag keeping the root element', () => {
      const element1 = document.createElement('div')
      const element2 = document.createElement('div')

      document.body.appendChild(element1)
      document.body.appendChild(element2)

      riot.register('my-component-1', SimpleComponent)
      riot.register('my-component-2', SimpleComponent)

      riot.mount(element1, {}, 'my-component-1')
      riot.mount(element2, {}, 'my-component-2')
      riot.unmount(element1, true)
      riot.unmount(element2)

      expect(document.body.contains(element1)).to.be.ok
      expect(document.body.contains(element2)).to.be.not.ok

      element1.parentNode.removeChild(element1)
      riot.unregister('my-component-1')
      riot.unregister('my-component-2')
    })

    it('custom components be also functions', () => {
      const mountedSpy = spy()
      const MyComponent = {
        css: 'my-component { color: red; }',
        exports() {
          return {
            onMounted() {
              mountedSpy()
            }
          }
        }
      }

      const components = [
        riot.component(MyComponent)(document.createElement('div'), {}),
        riot.component(MyComponent)(document.createElement('div'), {})
      ]

      expect(mountedSpy).to.have.been.calledTwice

      components.forEach(c => c.unmount())
    })

    it('custom components be also classes', () => {
      const mountedSpy = spy()
      const MyComponent = {
        css: 'my-component { color: red; }',
        exports: class MyComponent {
          onMounted() {
            mountedSpy()
          }
        }
      }

      const components = [
        riot.component(MyComponent)(document.createElement('div'), {}),
        riot.component(MyComponent)(document.createElement('div'), {})
      ]

      expect(mountedSpy).to.have.been.calledTwice

      components.forEach(c => c.unmount())
    })

    it('unmounting random DOM nodes will not throw', () => {
      expect(riot.unmount(document.createElement('div'))).to.be.ok
    })

    it('mounting unregistered components must throw', () => {
      expect(() => riot.mount(document.createElement('my-component'))).to.throw()
    })

    it('registering the same component twice must throw', () => {
      riot.register('my-component', {})
      expect(() => riot.register('my-component', {})).to.throw()
      riot.unregister('my-component')
    })

    it('unregistering an unknown component must throw', () => {
      expect(() => riot.unregister('my-component')).to.throw()
    })


    it('nested components can be properly styled', () => {
      const element = document.createElement('nested-aliased-imports')

      document.body.appendChild(element)

      const component = riot.component(NestedAliasedImportsComponent)(element, {message: 'hello'})
      const p = component.$('p')
      expect(p.innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(p.innerHTML).to.be.equal('goodbye')

      expect(window.getComputedStyle(p).color).to.be.equal('rgb(255, 0, 0)')

      component.unmount()
    })

    it('nested global components can be loaded and mounted', () => {
      riot.register('simple', SimpleComponent)
      const element = document.createElement('global-components')

      const component = riot.component(GlobalComponents)(element, {message: 'hello'})
      expect(component.$('p').innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(component.$('p').innerHTML).to.be.equal('goodbye')

      component.unmount()
      riot.unregister('simple')
    })


    it('is directives can be evaluated in runtime', () => {
      const element = document.createElement('runtime-is-directive')
      const component = riot.component(RuntimeIsDirective)(element)
      const child = component.$('.child')

      expect(normalizeInnerHTML(child.textContent)).to.be.equal('I am a child')

      component.update({
        message: 'I am a message',
        child: 'simple'
      })

      expect(normalizeInnerHTML(child.textContent)).to.be.equal('I am a message')

      component.update({
        child: 'child'
      })

      expect(normalizeInnerHTML(child.textContent)).to.be.equal('I am a child')

      component.unmount()
    })
  })


  describe('plugins API', () => {
    it('riot can install plugins', () => {
      function hello(component) {
        component.hello = 'hello'
      }

      const MyComponent = {
        name: 'my-component',
        css: 'my-component { color: red; }',
        exports: {
          onBeforeMount() {
            expect(this.hello).to.be.ok
          }
        }
      }

      riot.install(hello)
      const component = riot.component(MyComponent)(document.createElement('my-component'))
      riot.uninstall(hello)
      component.unmount()
    })

    it('the same plugin can\'t be installed twice', () => {
      function hello(component) {
        component.hello = 'hello'
      }

      riot.install(hello)

      expect(() => riot.install(hello)).to.throw()

      riot.uninstall(hello)
    })

    it('plugins must be functions', () => {
      expect(() => riot.install({})).to.throw()
    })

    it('uninstalling plugins never registered before must throw', () => {
      expect(() => riot.uninstall(function() {})).to.throw()
    })
  })


  describe('components state and props', () => {
    it('components will receive and update properly their state property', () => {
      const element = document.createElement('simple-component')
      const component = riot.component(SimpleComponent)(element, {message: 'hello'})
      const p = component.$('p')
      expect(p.innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

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
      const component = riot.component(TitleProps)(element, () => ({ title: 'hello' }))

      expect(component.props.title).to.be.equal('hello')

      component.update()

      expect(component.props.title).to.be.equal('hello')

      component.unmount()
    })

    it('nested components can be loaded in runtime via imports statements', () => {
      const element = document.createElement('nested-imports')

      const component = riot.component(NestedImportsComponent)(element, {message: 'hello'})
      const p = component.$('p')
      expect(p.innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(p.innerHTML).to.be.equal('goodbye')

      component.unmount()
    })

    it('nested components can update properly their internal state', () => {
      const element = document.createElement('nested-imports')

      const component = riot.component(NestedImportsComponent)(element, {message: 'hello'})
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
          }
        }
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

      expect(component.$('dashed-attribute-child p').innerHTML).to.be.equal('hello')

      component.unmount()
    })

    it('static attributes get properly evaluated as props', () => {
      const element = document.createElement('static-attribute')
      const component = riot.component(StaticAttribute)(element)

      expect(component.$('h1').innerHTML).to.be.equal('hello')

      component.unmount()
    })

    it('root attributes in an each loop will be properly rendered', () => {
      const element = document.createElement('each-root-attributes')
      const component = riot.component(EachRootAttributes)(element)

      expect(component.$('p').classList.contains('something')).to.be.ok

      component.unmount()
    })
  })

  describe('slots', () => {
    it('default slots will be properly rendered', () => {
      const element = document.createElement('parent-with-slots')
      const component = riot.component(ParentWithSlotsComponent)(element, { message: 'hello' })

      expect(normalizeInnerHTML(component.$('simple-slot').innerHTML)).to.be.equal('hello')

      component.unmount()
    })

    it('named slots will be properly rendered', () => {
      const element = document.createElement('named-slots-parent')
      const component = riot.component(NamedSlotsParent)(element)

      expect(normalizeInnerHTML(component.$('named-slots header span').innerHTML)).to.be.equal(component.state.header)
      expect(normalizeInnerHTML(component.$('named-slots footer span').innerHTML)).to.be.equal(component.state.footer)
      expect(normalizeInnerHTML(component.$('named-slots main').innerHTML)).to.be.equal(component.state.main)

      component.update({ header: 'hello' })

      expect(normalizeInnerHTML(component.$('named-slots header span').innerHTML)).to.be.equal(component.state.header)

      component.unmount()
    })

    it('<slot> tags will be removed if there will be no markup to inject', () => {
      const element = document.createElement('simple-slot')
      const component = riot.component(SimpleSlot)(element)

      expect(component.$('slot')).to.be.not.ok
      expect(component.root.innerHTML).to.be.not.ok

      component.update({}, { header: 'hello' })

      expect(component.$('slot')).to.be.not.ok
      expect(component.root.innerHTML).to.be.not.ok

      component.unmount()
    })

    it('<slot>s shouldn\'t throw if the parent scope is not defined', () => {
      const element = document.createElement('conditional-slot-parent')
      const component = riot.component(ConditionalSlotParent)(element)

      expect(component.$('slot')).to.be.not.ok
      expect(component.$('p')).to.be.not.ok

      expect(() => component.update({ mustShowSlot: true })).to.not.throw()

      expect(component.$('slot')).to.be.not.ok
      expect(component.$('p')).to.be.ok

      component.unmount()
    })

    it('<slot> tags in if directives will be properly mounted', () => {
      const element = document.createElement('conditional-slot-parent')
      const component = riot.component(ConditionalSlotParent)(element)

      expect(component.$('slot')).to.be.not.ok
      expect(component.$('p')).to.be.not.ok

      component.update({ mustShowSlot: true })

      expect(component.$('slot')).to.be.not.ok
      expect(component.$('p')).to.be.ok

      component.unmount()
    })

    it('<slot>s can be used as data providers', () => {
      const element = document.createElement('message-consumer')
      const component = riot.component(MessageConsumer)(element)

      expect(component.$('p').innerHTML).to.be.equal('hello world')

      fireEvent(component.$('article'), 'click')

      expect(component.$('p').innerHTML).to.be.equal('goodbye world')

      component.unmount()
    })

    it('Nested HOC <slot>s scope gets preserved', () => {
      const element = document.createElement('nested-hoc')

      const component = riot.component(NestedHoc)(element, {
        isVisible: true
      })

      expect(component.$('p').innerHTML).to.be.equal('hello world')

      component.update({ subject: 'developer'})

      expect(component.$('p').innerHTML).to.be.equal('hello developer')

      fireEvent(component.$('article'), 'click')

      expect(component.$('p').innerHTML).to.be.equal('goodbye developer')

      component.update({
        isVisible: false
      })

      expect(component.$('p')).to.be.not.ok

      component.unmount()
    })

    it('Nested <slot>s scope gets preserved', () => {
      const element = document.createElement('nested-slot')

      const component = riot.component(NestedSlot)(element, {
        message: 'hello'
      })

      expect(component.$('simple-slot').innerHTML).to.be.equal('hello')

      component.update({ message: 'goodbye' })

      expect(component.$('simple-slot').innerHTML).to.be.equal('goodbye')

      component.unmount()
    })
  })

  describe('components rendering', () => {
    it('multiple expression on the same attribute will be merged', () => {
      const element = document.createElement('merge-attributes')
      const component = riot.component(MergeAttributes)(element, {
        name: 'Jack',
        surname: 'Black'
      })

      expect(component.root.getAttribute('name')).to.be.equal('Jack-Black')

      component.unmount()
    })

    it('nested template tags will be properly rendered', () => {
      const element = document.createElement('virtual-each')
      const component = riot.component(VirtualEach)(element, {
        items: [
          { title: 'hello', description: 'world' },
          { title: 'hello', description: 'world' },
          { title: 'hello', description: 'world' }
        ]
      })

      expect(component.$$('dd')).to.have.length(3)
      expect(component.$('template')).to.be.not.ok

      component.update({
        items: null
      })

      expect(component.$$('dd')).to.have.length(0)
      expect(component.$('template')).to.be.not.ok

      component.unmount()
    })
  })
})