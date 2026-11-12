import * as riot from '../../src/riot.js'

import HmrChildParent from '../components/hmr-child-parent.riot'
import HmrChildV1 from '../components/hmr-child-v1.riot'
import HmrChildV2 from '../components/hmr-child-v2.riot'

import { expect } from 'chai'

const { UPDATE_COMPONENTS_SYMBOL } = riot.__.globals
const nodeEnv = process.env.NODE_ENV

const restoreNodeEnv = () => {
  if (nodeEnv === undefined) {
    Reflect.deleteProperty(process.env, 'NODE_ENV')
  } else {
    process.env.NODE_ENV = nodeEnv
  }
}

describe('components object update via symbol', () => {
  before(() => {
    // enable the Proxy based components update
    process.env.NODE_ENV = 'development'
  })

  after(restoreNodeEnv)

  afterEach(() => {
    // reset the shared components holder for the next test
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)
    parent[UPDATE_COMPONENTS_SYMBOL]('HmrChild', HmrChildV1)
    parent.unmount()
  })

  it('updates the internal components object used by the component template', () => {
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v1 - count: 0',
    )

    // swap the internal HmrChild component with v2
    parent[UPDATE_COMPONENTS_SYMBOL]('HmrChild', HmrChildV2)

    // the mounted child keeps using v1 until it gets remounted
    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v1 - count: 0',
    )

    // unmount the child
    parent.update({ visible: false })
    expect(element.querySelector('hmr-child')).to.be.equal(null)

    // remount the child: it must now be rendered using the v2 factory
    parent.update({ visible: true })
    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v2 - count: 0',
    )

    parent.unmount()
  })

  it('updates the already mounted children components on the next parent update', () => {
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v1 - count: 0',
    )

    // swap the internal HmrChild component with v2
    parent[UPDATE_COMPONENTS_SYMBOL]('HmrChild', HmrChildV2)

    // re-render the parent: its bindings will swap the mounted child with the
    // new component implementation (see @riotjs/dom-bindings TagBinding)
    parent.update()

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v2 - count: 0',
    )

    // the props of the swapped child are still updated by its parent
    parent.update({ count: 3 })
    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v2 - count: 3',
    )

    parent.unmount()
  })

  it('updating the components object affects components not mounted yet', () => {
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)

    expect(element.innerHTML).to.contain('v1 - count: 0')

    parent.update({ visible: false })
    expect(element.querySelector('hmr-child')).to.be.equal(null)

    parent[UPDATE_COMPONENTS_SYMBOL]('HmrChild', HmrChildV2)
    parent.update({ visible: true })

    expect(element.innerHTML).to.contain('v2 - count: 0')

    parent.unmount()
  })

  it('exposes the update components symbol on every component instance', () => {
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)

    expect(typeof parent[UPDATE_COMPONENTS_SYMBOL]).to.be.equal('function')

    parent.unmount()
  })
})

describe('components object update without the Proxy (simple object)', () => {
  before(() => {
    process.env.NODE_ENV = 'production'
  })

  after(restoreNodeEnv)

  it('still updates the components using a simple object', () => {
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v1 - count: 0',
    )

    parent[UPDATE_COMPONENTS_SYMBOL]('HmrChild', HmrChildV2)
    parent.update({ visible: false })
    parent.update({ visible: true })

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v2 - count: 0',
    )

    parent.unmount()
  })

  it('updates the already mounted children components on the next parent update', () => {
    const element = document.createElement('hmr-child-parent')
    const parent = riot.component(HmrChildParent)(element)

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v1 - count: 0',
    )

    parent[UPDATE_COMPONENTS_SYMBOL]('HmrChild', HmrChildV2)
    parent.update()

    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v2 - count: 0',
    )

    // the props of the swapped child are still updated by its parent
    parent.update({ count: 3 })
    expect(element.querySelector('hmr-child').innerHTML).to.contain(
      'v2 - count: 3',
    )

    parent.unmount()
  })
})
