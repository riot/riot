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
      'mixin',
      'install',
      'component',
      'version',
      '__',
      'compile',
      'compileFromString',
      'compileFromUrl'
    ])
  })
})