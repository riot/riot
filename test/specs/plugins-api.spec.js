import * as riot from '../../src/riot.js'
import { expect } from 'chai'

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
        },
      },
    }

    riot.install(hello)
    const component = riot.component(MyComponent)(
      document.createElement('my-component'),
    )
    riot.uninstall(hello)
    component.unmount()
  })

  it("the same plugin can't be installed twice", () => {
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
    expect(() => riot.uninstall(function () {})).to.throw()
  })
})
