import * as riot from '../../src/riot'
import {expect} from 'chai'
import {spy} from 'sinon'

describe('Riot core api', () => {
  it('riot exports properly its public api', () => {
    expect(riot).to.be.ok
    expect(riot).to.have.all.keys([
      'register',
      'unregister',
      'mount',
      'unmount',
      'mixin',
      'install',
      'version',
      '__'
    ])
  })

  it('a custom component can be registered and unregistered properly', () => {
    const createComponentSpy = spy()
    riot.register('my-component', {
      css: 'my-component { color: red; }',
      tag: {
        onMounted() {
          createComponentSpy()
        }
      }
    })
    riot.mount(document.createElement('my-component'))
    expect(createComponentSpy).to.have.been.calledOnce
    riot.unregister('my-component')
  })

  it('a custom component can be mounted and unmounted properly', () => {
    const destroyComponentSpy = spy()
    riot.register('my-component', {
      css: 'my-component { color: red; }',
      tag: {
        onUnmounted() {
          destroyComponentSpy()
        }
      }
    })
    const element = document.createElement('my-component')
    riot.mount(element)
    riot.unmount(element)
    expect(destroyComponentSpy).to.have.been.calledOnce
    riot.unregister('my-component')
  })
})