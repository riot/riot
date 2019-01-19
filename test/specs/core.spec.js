import * as riot from '../../src/riot'

import GlobalComponents from '../tags/global-components.riot'
import NestedImportsComponent from '../tags/nested-imports.riot'
import SimpleComponent from '../tags/simple.riot'

import {expect} from 'chai'
import {spy} from 'sinon'
import {template} from '@riotjs/dom-bindings'

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
      'version',
      '__'
    ])
  })

  it('custom components can be registered and unregistered properly', () => {
    const mountedSpy = spy()
    riot.register('my-component', {
      css: 'my-component { color: red; }',
      tag: {
        onMounted() {
          mountedSpy()
        }
      }
    })
    riot.mount(document.createElement('my-component'))
    expect(mountedSpy).to.have.been.calledOnce
    riot.unregister('my-component')
  })

  it('custom components have core helpers', () => {
    riot.register('my-component', {
      css: 'my-component { color: red; }',
      tag: {
        onMounted() {
          expect(this.$('div')).to.be.ok
          expect(this.$$('div')).to.be.ok
        }
      },
      template: () => template('<div>hello</div>')
    })
    riot.mount(document.createElement('my-component'))
    riot.unregister('my-component')
  })

  it('custom components can be mounted and unmounted properly', () => {
    const destroyedSpy = spy()
    riot.register('my-component', {
      css: 'my-component { color: red; }',
      tag: {
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
      tag: {
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
      tag: {
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
      tag() {
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
      tag: class MyComponent {
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

  it('riot can install plugins', () => {
    function hello(component) {
      component.hello = 'hello'
    }

    riot.register('my-component', {
      css: 'my-component { color: red; }',
      tag: {
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

  it('components will receive and update properly their state property', () => {
    riot.register('simple-component', SimpleComponent)

    const element = document.createElement('simple-component')

    const [component] = riot.mount(element, {message: 'hello'})
    expect(component.$('p').innerHTML).to.be.equal('hello')

    component.update({message: 'goodbye'})

    expect(component.$('p').innerHTML).to.be.equal('goodbye')

    component.unmount()
    riot.unregister('simple-component')
  })

  it('nested components can be loaded in runtime via imports statements', () => {
    riot.register('nested-imports', NestedImportsComponent)

    const element = document.createElement('nested-imports')

    const [component] = riot.mount(element, {message: 'hello'})
    expect(component.$('p').innerHTML).to.be.equal('hello')

    component.update({message: 'goodbye'})

    expect(component.$('p').innerHTML).to.be.equal('goodbye')

    component.unmount()
    riot.unregister('nested-imports')
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

  it('the ref method can be used to update children components', () => {
    riot.register('simple', SimpleComponent)
    riot.register('global-components', GlobalComponents)

    const element = document.createElement('global-components')

    const [component] = riot.mount(element, {message: 'hello'})
    // ref could detect children component
    const [child] = component.ref('simple')
    // or it will fall back to normal DOM nodes
    const [p] = component.ref('p')

    expect(p.innerHTML).to.be.equal('hello')

    child.update({message: 'goodbye'})

    expect(p.innerHTML).to.be.equal('goodbye')

    component.unmount()
    riot.unregister('global-components')
    riot.unregister('simple')
  })

  it('the shouldUpdate method can block all the components updates', () => {
    const updatedSpy = spy()
    riot.register('my-component', {
      tag: {
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
    riot.unregister('my-component')
  })
})