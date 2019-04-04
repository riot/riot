import * as riot from '../../src/riot'

import DashedAttributeParent from '../tags/dashed-attribute-parent.riot'
import GlobalComponents from '../tags/global-components.riot'
import MergeAttributes from '../tags/merge-attributes.riot'
import NamedSlotsParent from '../tags/named-slots-parent.riot'
import NestedAliasedImportsComponent from '../tags/nested-aliased-imports.riot'
import NestedImportsComponent from '../tags/nested-imports.riot'
import ParentWithSlotsComponent from '../tags/parent-with-slots.riot'
import RuntimeIsDirective from '../tags/runtime-is-directive.riot'
import SimpleComponent from '../tags/simple.riot'
import SimpleSlot from '../tags/simple-slot.riot'
import SpreadAttribute from '../tags/spread-attribute.riot'
import TitleProps from '../tags/title-prop.riot'

import {expect} from 'chai'
import {spy} from 'sinon'
import {template} from '@riotjs/dom-bindings'

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
      riot.register('global-components', GlobalComponents)

      const element = document.createElement('global-components')

      const component = riot.component(SimpleComponent)(element, {message: 'hello'})
      expect(component.$('p').innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(component.$('p').innerHTML).to.be.equal('goodbye')

      component.unmount()
      riot.unregister('global-components')
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

    it('spread attributes can be properly evaluated', () => {
      const element = document.createElement('spread-attribute')
      const component = riot.component(SpreadAttribute)(element)

      expect(component.$('p').getAttribute('hidden')).to.be.ok

      component.unmount()
    })

    it('dashed attributes will be camelized', () => {
      const element = document.createElement('dashed-attribute-parent')
      const component = riot.component(DashedAttributeParent)(element)

      expect(component.$('dashed-attribute-child p').innerHTML).to.be.equal('hello')

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
  })
})