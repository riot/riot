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
      'version',
      '__',
      // compiler API
      'compile',
      'compileFromString',
      'compileFromUrl'
    ])
  })

  it('compiler can load asynchronously tags via url', async function() {
    const {code} = await riot.compileFromUrl('/tags/simple.riot')

    expect(code).to.match(/scope\.state\.message/)
  })
})