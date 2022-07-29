import * as riot from '../../src/riot+compiler'
import {GLOBAL_REGISTRY} from '../../src/compiler/global-registry'
import SimpleSlotComponent from '../components/simple-slot.riot'
import {expect} from 'chai'

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
      'pure',
      'withTypes',
      'version',
      '__',
      // compiler API
      'inject',
      'compile',
      'compileFromUrl',
      'compileFromString',
      'compiler'
    ])
  })

  it('compiler can load asynchronously tags via url', async function() {
    const {code} = await riot.compileFromUrl('/components/simple.riot')

    expect(code).to.match(/scope\.props\.message/)
  })

  it('compiler can load asynchronously script tags', async function() {
    const script = document.createElement('script')
    script.setAttribute('type', 'riot')
    script.setAttribute('data-src', 'components/simple.riot')
    document.body.appendChild(script)
    await riot.compile()

    expect(window[GLOBAL_REGISTRY]['simple']).to.be.ok

    riot.unregister('simple')
  })

  it('compiler can compile string tags', () => {
    const {code} = riot.compileFromString('<my-tag></my-tag>')

    expect(code).to.be.ok
  })

  it.skip('Runtime slots get properly evaluated', () => {
    const el = document.createElement('simple-slot')
    el.innerHTML = '<p>{props.message}</p>'

    const component = riot.component(SimpleSlotComponent)(el, {
      message: 'hello'
    })

    expect(el.querySelector('p').innerHTML).to.be.equal('hello')

    component.unmount()
  })
})
