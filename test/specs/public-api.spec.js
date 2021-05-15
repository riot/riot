import * as riot from '../../src/riot'

import {expect} from 'chai'

describe('Riot public api', () => {
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
      'pure',
      'withTypes',
      'version',
      '__'
    ])
  })
})
