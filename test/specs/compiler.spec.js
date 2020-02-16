import {expect} from 'chai'
import riot from '../../src/riot+compiler'

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

    expect(window['__riot_registry__']['simple']).to.be.ok

    riot.unregister('simple')
  })

  it('compiler can compile string tags', () => {
    const {code} = riot.compileFromString('<my-tag></my-tag>')

    expect(code).to.be.ok
  })
})