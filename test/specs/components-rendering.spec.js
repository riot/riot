import * as riot from '../../src/riot'

import MergeAttributes from '../components/merge-attributes.riot'
import VirtualEach from '../components/virtual-each.riot'

import {expect} from 'chai'

describe('components rendering', () => {
  it('multiple expression on the same attribute will be merged', () => {
    const element = document.createElement('merge-attributes')
    const component = riot.component(MergeAttributes)(element, {
      name: 'Jack',
      surname: 'Black'
    })

    expect(component.root.getAttribute('name')).to.be.equal('Jack-Black')

    component.unmount()
  })

  it('nested template tags will be properly rendered', () => {
    const element = document.createElement('virtual-each')
    const component = riot.component(VirtualEach)(element, {
      items: [
        {title: 'hello', description: 'world'},
        {title: 'hello', description: 'world'},
        {title: 'hello', description: 'world'}
      ]
    })

    expect(component.$$('dd')).to.have.length(3)
    expect(component.$('template')).to.be.not.ok

    component.update({
      items: null
    })

    expect(component.$$('dd')).to.have.length(0)
    expect(component.$('template')).to.be.not.ok

    component.unmount()
  })
})
