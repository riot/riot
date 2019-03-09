import * as riot from '../../src/riot'

import GlobalComponents from '../tags/global-components.riot'
import NamedSlotsParent from '../tags/named-slots-parent.riot'
import NestedAliasedImportsComponent from '../tags/nested-aliased-imports.riot'
import NestedImportsComponent from '../tags/nested-imports.riot'
import ParentWithSlotsComponent from '../tags/parent-with-slots.riot'
import RuntimeIsDirective from '../tags/runtime-is-directive.riot'
import SimpleComponent from '../tags/simple.riot'
import SimpleSlot from '../tags/simple-slot.riot'
import SpreadAttribute from '../tags/spread-attribute.riot'

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
      const component = riot.component({
        exports:  {
          onMounted() {
            mountedSpy()
          }
        }
      })

      const element = document.createElement('div')
      const tag = component(element, { isActive: true })
      expect(tag.root).to.be.equal(element)
      expect(tag.props.isActive).to.be.ok
      expect(mountedSpy).to.have.been.calledOnce
      tag.unmount()
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
      riot.register('my-component', {
        exports: {
          onUpdated() {
            updatedSpy()
          },
          shouldUpdate() {
            return false
          }
        }
      })

      const element = document.createElement('my-component')
      const [component] = riot.mount(element)

      component.update()
      component.update()
      component.update()

      expect(updatedSpy).to.not.have.been.called

      component.unmount()
      riot.unregister('my-component')
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
      riot.mount(document.createElement('my-component'))
      expect(mountedSpy).to.have.been.calledOnce
      riot.unregister('my-component')
    })

    it('custom components have core helpers and the root property', () => {
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onMounted() {
            expect(this.root).to.be.ok
            expect(this.$('div')).to.be.ok
            expect(this.$$('div')).to.be.ok
          }
        },
        template: () => template('<div>hello</div>')
      })
      const [tag] = riot.mount(document.createElement('my-component'))
      tag.unmount()
      riot.unregister('my-component')
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
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports() {
          return {
            onMounted() {
              mountedSpy()
            }
          }
        }
      })

      riot.mount(document.createElement('div'), {}, 'my-component')
      riot.mount(document.createElement('div'), {}, 'my-component')

      expect(mountedSpy).to.have.been.calledTwice

      riot.unregister('my-component')
    })

    it('custom components be also classes', () => {
      const mountedSpy = spy()
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: class MyComponent {
          onMounted() {
            mountedSpy()
          }
        }
      })

      riot.mount(document.createElement('div'), {}, 'my-component')
      riot.mount(document.createElement('div'), {}, 'my-component')

      expect(mountedSpy).to.have.been.calledTwice

      riot.unregister('my-component')
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
      riot.register('nested-aliased-imports', NestedAliasedImportsComponent)

      const element = document.createElement('nested-aliased-imports')

      document.body.appendChild(element)

      const [component] = riot.mount(element, {message: 'hello'})
      const p = component.$('p')
      expect(p.innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(p.innerHTML).to.be.equal('goodbye')

      expect(window.getComputedStyle(p).color).to.be.equal('rgb(255, 0, 0)')

      component.unmount()
      riot.unregister('nested-aliased-imports')
    })

    it('nested global components can be loaded and mounted', () => {
      riot.register('simple', SimpleComponent)
      riot.register('global-components', GlobalComponents)

      const element = document.createElement('global-components')

      const [component] = riot.mount(element, {message: 'hello'})
      expect(component.$('p').innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(component.$('p').innerHTML).to.be.equal('goodbye')

      component.unmount()
      riot.unregister('global-components')
      riot.unregister('simple')
    })


    it('is directives can be evaluated in runtime', () => {
      riot.register('runtime-is-directive', RuntimeIsDirective)
      const element = document.createElement('runtime-is-directive')

      const [component] = riot.mount(element)
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
      riot.unregister('runtime-is-directive')
    })
  })


  describe('plugins API', () => {
    it('riot can install plugins', () => {
      function hello(component) {
        component.hello = 'hello'
      }

      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onBeforeMount() {
            expect(this.hello).to.be.ok
          }
        }
      })

      riot.install(hello)
      riot.mount(document.createElement('my-component'))
      riot.uninstall(hello)
      riot.unregister('my-component')
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
      riot.register('simple-component', SimpleComponent)

      const element = document.createElement('simple-component')

      const [component] = riot.mount(element, {message: 'hello'})
      const p = component.$('p')
      expect(p.innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(p.innerHTML).to.be.equal('goodbye')

      riot.unregister('simple-component')
    })

    it('nested components can be loaded in runtime via imports statements', () => {
      riot.register('nested-imports', NestedImportsComponent)

      const element = document.createElement('nested-imports')

      const [component] = riot.mount(element, {message: 'hello'})
      const p = component.$('p')
      expect(p.innerHTML).to.be.equal('hello')

      component.update({message: 'goodbye'})

      expect(p.innerHTML).to.be.equal('goodbye')

      component.unmount()
      riot.unregister('nested-imports')
    })

    it('nested components can update properly their internal state', () => {
      riot.register('nested-imports', NestedImportsComponent)

      const element = document.createElement('nested-imports')

      const [component] = riot.mount(element, {message: 'hello'})
      const p = component.$('p')

      expect(p.innerHTML).to.be.equal('hello')
      p.click()
      expect(p.innerHTML).to.be.equal('clicked')

      component.unmount()
      riot.unregister('nested-imports')
    })

    it('simple attribute can be properly evaluated', () => {
      const mountedSpy = spy()
      riot.register('my-component', {
        css: 'my-component { color: red; }',
        exports: {
          onMounted() {
            expect(this.props.name).to.be.equal('foo')
            mountedSpy()
          }
        }
      })

      const element = document.createElement('my-component')

      element.setAttribute('name', 'foo')

      const [tag] = riot.mount(element)

      expect(mountedSpy).to.have.been.calledOnce
      tag.unmount()
      riot.unregister('my-component')
    })

    it('spread attributes can be properly evaluated', () => {
      riot.register('spread-attribute', SpreadAttribute)
      const element = document.createElement('spread-attribute')

      const [component] = riot.mount(element)

      expect(component.$('p').getAttribute('hidden')).to.be.ok

      component.unmount()
      riot.unregister('spread-attribute')
    })
  })

  describe('slots', () => {
    it('default slots will be properly rendered', () => {
      riot.register('parent-with-slots', ParentWithSlotsComponent)
      const element = document.createElement('parent-with-slots')

      const [component] = riot.mount(element, { message: 'hello' })

      expect(normalizeInnerHTML(component.$('simple-slot').innerHTML)).to.be.equal('hello')

      component.unmount()
      riot.unregister('parent-with-slots')
    })

    it('named slots will be properly rendered', () => {
      riot.register('named-slots-parent', NamedSlotsParent)
      const element = document.createElement('named-slots-parent')

      const [component] = riot.mount(element)

      expect(normalizeInnerHTML(component.$('named-slots header span').innerHTML)).to.be.equal(component.state.header)
      expect(normalizeInnerHTML(component.$('named-slots footer span').innerHTML)).to.be.equal(component.state.footer)
      expect(normalizeInnerHTML(component.$('named-slots main').innerHTML)).to.be.equal(component.state.main)

      component.update({ header: 'hello' })

      expect(normalizeInnerHTML(component.$('named-slots header span').innerHTML)).to.be.equal(component.state.header)

      component.unmount()
      riot.unregister('named-slots-parent')
    })

    it('<slot> tags will be removed if there will be no markup to inject', () => {
      riot.register('simple-slot', SimpleSlot)
      const element = document.createElement('simple-slot')

      const [component] = riot.mount(element)

      expect(component.$('slot')).to.be.not.ok
      expect(component.root.innerHTML).to.be.not.ok

      component.update({}, { header: 'hello' })

      expect(component.$('slot')).to.be.not.ok
      expect(component.root.innerHTML).to.be.not.ok

      component.unmount()
      riot.unregister('simple-slot')
    })
  })
})