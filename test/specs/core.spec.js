import * as riot from '../../src/riot.js'
import { expect } from 'chai'

describe('Riot core api', () => {
  it('riot exports properly its public api', () => {
    expect(riot).to.be.ok
    expect(riot).to.have.all.keys([
      'register', 'unregister', 'mount', 'unmount', 'mixin', 'install', 'component', 'version', '__'
    ])
  })
})