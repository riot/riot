import * as riot from '../../src/riot+compiler.js'
import { GLOBAL_REGISTRY } from '../../src/compiler/global-registry.js'
import RuntimeSlotComponent from '../components/runtime-slot.riot'
import RuntimeSlotWithChildrenComponent from '../components/runtime-slot-with-children.riot'
import TitlePropComponent from '../components/title-prop.riot'
import { expect } from 'chai'
import { getBaseUrl } from '../utils.js'

describe('Riot compiler api', () => {
  it('riot compiler exports properly its public api', () => {
    expect(riot).to.be.ok
    expect(riot).to.have.all.keys([
      'register',
      'unregister',
      'mount',
      'unmount',
      'install',
      'uninstall',
      'component',
      'createPureComponent',
      'pure',
      'withTypes',
      'version',
      '__',
      // compiler API
      'inject',
      'compile',
      'compileFromUrl',
      'compileFromString',
      'compiler',
    ])
  })

  it('compiler can load asynchronously tags via url', async function () {
    const { code } = await riot.compileFromUrl(
      `${getBaseUrl()}/test/components/simple.riot`,
    )

    expect(code).to.match(/scope\.props\.message/)
  })

  it('compiler can load asynchronously script tags', async function () {
    const script = document.createElement('script')
    script.setAttribute('type', 'riot')
    script.setAttribute(
      'data-src',
      `${getBaseUrl()}/test/components/simple.riot`,
    )
    document.body.appendChild(script)
    await riot.compile()

    expect(window[GLOBAL_REGISTRY]['simple']).to.be.ok

    riot.unregister('simple')
  })

  it('compiler can compile string tags', () => {
    const { code } = riot.compileFromString('<my-tag></my-tag>')

    expect(code).to.be.ok
  })

  it('Runtime slots get properly evaluated with riot.component', () => {
    const el = document.createElement('runtime-slot')
    el.innerHTML = '<p>{message}</p>'

    const component = riot.component(RuntimeSlotComponent)(el, {
      message: 'hello',
    })

    expect(el.querySelector('p').innerHTML).to.be.equal('hello')

    component.unmount()
  })

  it('Runtime slots with children components get properly evaluated with riot.component', () => {
    const el = document.createElement('runtime-slot-with-children')
    el.innerHTML = '<p>{message}</p>'
    riot.register('title-prop', TitlePropComponent)

    const component = riot.component(RuntimeSlotWithChildrenComponent)(el, {
      message: 'hello',
    })

    expect(el.querySelector('p').innerHTML).to.be.equal('hello')
    expect(el.querySelector('child').innerHTML).to.be.not.empty
    expect(el.querySelector('title-prop').innerHTML).to.be.not.empty

    component.unmount()
    riot.unregister('title-prop')
  })

  it('Empty DOM Components will not mount runtime slots', () => {
    const el = document.createElement('runtime-slot')

    const component = riot.component(RuntimeSlotComponent)(el, {
      message: 'hello',
    })

    expect(el.innerHTML).to.be.equal('')

    component.unmount()
  })

  it('Runtime slots get properly evaluated with riot.mount', () => {
    const el = document.createElement('runtime-slot')
    el.innerHTML = '<p>{message}</p>'
    riot.register('runtime-slot', RuntimeSlotComponent)

    const [component] = riot.mount(
      el,
      {
        message: 'hello',
      },
      'runtime-slot',
    )

    expect(el.querySelector('p').innerHTML).to.be.equal('hello')

    component.unmount()
    riot.unregister('runtime-slot')
  })

  it('Runtime slots with children components get properly evaluated with riot.mount', () => {
    const el = document.createElement('runtime-slot')

    el.innerHTML = '<title-prop title="{message}"></title-prop>'

    riot.register('runtime-slot', RuntimeSlotComponent)
    riot.register('title-prop', TitlePropComponent)

    const [component] = riot.mount(el, {
      message: 'hello',
    })

    expect(el.querySelector('h1').innerHTML).to.be.equal('hello')

    component.unmount()
    riot.unregister('runtime-slot')
    riot.unregister('title-prop')
  })
})
