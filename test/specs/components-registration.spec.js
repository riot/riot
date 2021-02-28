import * as riot from '../../src/riot'
import {fireEvent, normalizeInnerHTML} from '../utils'

import GlobalComponents from '../components/global-components.riot'
import NestedAliasedImportsComponent from '../components/nested-aliased-imports.riot'
import OldSyntaxComponent from '../components/old-syntax.riot'
import PureComponent from '../components/pure-component.riot'
import RecursiveTreeComponent from '../components/recursive-tree.riot'
import RuntimeIsDirective from '../components/runtime-is-directive.riot'
import SimpleComponent from '../components/simple.riot'

import {expect} from 'chai'
import {spy} from 'sinon'
import {template} from '@riotjs/dom-bindings'

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

  it('old Riot.js syntax is supported', () => {
    const element = document.createElement('old-syntax')
    const component = riot.component(OldSyntaxComponent)(element)

    expect(component.$('p').innerHTML).to.be.equal('Hello')

    fireEvent(component.$('button'), 'click')

    expect(component.$('p').innerHTML).to.be.equal('Goodbye')

    component.unmount()
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

  it('recursive components are properly supported', () => {
    const element = document.createElement('recursive-tree')
    const component = riot.component(RecursiveTreeComponent)(element, {
      name: 'Hello',
      children: [{
        name: 'There',
        children: [{
          name: 'Child'
        }]
      }]
    })

    expect(component.$$('p')).to.have.length(3)
    expect(component.$$('recursive-tree')).to.have.length(2)

    component.unmount()
  })
})
