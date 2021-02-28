import * as riot from '../../src/riot'

import Issue2895Parent from '../components/issue-2895-parent.riot'
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

  it('avoid recursive child parent infinite event lifecycle loops', () => {
    const element = document.createElement('issue-2895-parent')
    const component = riot.component(Issue2895Parent)(element)

    expect(component.$('p').innerHTML).to.be.equal('hello')
    expect(component.$('h1').innerHTML).to.be.equal('hello')

    component.unmount()
  })
})
