import * as riot from '../../src/riot.js'
import { fireEvent, normalizeInnerHTML } from '../utils.js'

import ConditionalSlotParent from '../components/conditional-slot-parent.riot'
import LoopWithSlots from '../components/loop-with-slots.riot'
import MessageConsumer from '../components/message-consumer.riot'
import NamedSlotsParent from '../components/named-slots-parent.riot'
import NestedHoc from '../components/nested-hoc.riot'
import NestedSlot from '../components/nested-slot.riot'
import ParentWithSlotsComponent from '../components/parent-with-slots.riot'
import SimpleSlot from '../components/simple-slot.riot'
import TemplateSlot from '../components/template-slot.riot'
import DefaultContentSlot from '../components/default-content-slot.riot'
import Issue3055Parent from '../components/issue-3055-parent.riot'
import Issue3055Combined from '../components/issue-3055-combined.riot'

import { expect } from 'chai'

describe('slots', () => {
  it('default slots will be properly rendered', () => {
    const element = document.createElement('parent-with-slots')
    const component = riot.component(ParentWithSlotsComponent)(element, {
      message: 'hello',
    })

    expect(
      normalizeInnerHTML(component.$('simple-slot').innerHTML),
    ).to.be.equal('hello')

    component.unmount()
  })

  it('named slots will be properly rendered', () => {
    const element = document.createElement('named-slots-parent')
    const component = riot.component(NamedSlotsParent)(element)

    expect(
      normalizeInnerHTML(component.$('named-slots header span').innerHTML),
    ).to.be.equal(component.state.header)
    expect(
      normalizeInnerHTML(component.$('named-slots footer span').innerHTML),
    ).to.be.equal(component.state.footer)
    expect(
      normalizeInnerHTML(component.$('named-slots main').innerHTML),
    ).to.be.equal(component.state.main)

    component.update({ header: 'hello' })

    expect(
      normalizeInnerHTML(component.$('named-slots header span').innerHTML),
    ).to.be.equal(component.state.header)

    component.unmount()
  })

  it('<slot> tags will be removed if there will be no markup to inject', () => {
    const element = document.createElement('simple-slot')
    const component = riot.component(SimpleSlot)(element)

    expect(component.$('slot')).to.be.not.ok
    expect(component.root.innerHTML).to.be.not.ok

    component.update({}, { header: 'hello' })

    expect(component.$('slot')).to.be.not.ok
    expect(component.root.innerHTML).to.be.not.ok

    component.unmount()
  })

  it("<slot>s shouldn't throw if the parent scope is not defined", () => {
    const element = document.createElement('conditional-slot-parent')
    const component = riot.component(ConditionalSlotParent)(element)

    expect(component.$('slot')).to.be.not.ok
    expect(component.$('p')).to.be.not.ok

    expect(() => component.update({ mustShowSlot: true })).to.not.throw()

    expect(component.$('slot')).to.be.not.ok
    expect(component.$('p')).to.be.ok

    component.unmount()
  })

  it('<slot> tags in if directives will be properly mounted', () => {
    const element = document.createElement('conditional-slot-parent')
    const component = riot.component(ConditionalSlotParent)(element)

    expect(component.$('slot')).to.be.not.ok
    expect(component.$('p')).to.be.not.ok

    component.update({ mustShowSlot: true })

    expect(component.$('slot')).to.be.not.ok
    expect(component.$('p')).to.be.ok

    component.unmount()
  })

  it('<slot>s can be used as data providers', () => {
    const element = document.createElement('message-consumer')
    const component = riot.component(MessageConsumer)(element)

    expect(component.$('p').innerHTML).to.be.equal('hello world')

    fireEvent(component.$('article'), 'click')

    expect(component.$('p').innerHTML).to.be.equal('goodbye world')

    component.unmount()
  })

  it('Nested HOC <slot>s scope gets preserved', () => {
    const element = document.createElement('nested-hoc')

    const component = riot.component(NestedHoc)(element, {
      isVisible: true,
    })

    expect(component.$('p').innerHTML).to.be.equal('hello world')

    component.update({ subject: 'developer' })

    expect(component.$('p').innerHTML).to.be.equal('hello developer')

    fireEvent(component.$('article'), 'click')

    expect(component.$('p').innerHTML).to.be.equal('goodbye developer')

    component.update({
      isVisible: false,
    })

    expect(component.$('p')).to.be.not.ok

    component.unmount()
  })

  it('Nested <slot>s scope gets preserved', () => {
    const element = document.createElement('nested-slot')

    const component = riot.component(NestedSlot)(element, {
      message: 'hello',
    })

    expect(component.$('simple-slot').innerHTML).to.be.equal('hello')

    component.update({ message: 'goodbye' })

    expect(component.$('simple-slot').innerHTML).to.be.equal('goodbye')

    component.unmount()
  })

  it('Loop index can be passed to slot content', () => {
    const element = document.createElement('loop-with-slots')
    const component = riot.component(LoopWithSlots)(element)

    const bTagsBefore = component.$$('b')

    expect(bTagsBefore).to.have.length(component.state.people.length)

    bTagsBefore.forEach((node, index) => {
      expect(node.innerHTML).to.be.equal(String(index))
    })

    component.state.people.reverse() // eslint-disable-line
    component.update()

    const bTagsAfter = component.$$('b')

    expect(bTagsAfter).to.have.length(component.state.people.length)

    bTagsAfter.forEach((node, index) => {
      expect(node.innerHTML).to.be.equal(String(index))
    })
  })

  it('template slot tags will be removed', () => {
    const element = document.createElement('template-slot')
    const component = riot.component(TemplateSlot)(element, {
      message: 'hello',
    })

    expect(
      normalizeInnerHTML(component.$('simple-slot').innerHTML),
    ).to.be.equal('hello')
    expect(component.$('template')).to.be.not.ok

    component.unmount()
  })

  it('slots fallback expressions can be properly rendered and have access to own component context (https://github.com/riot/riot/issues/3014, https://github.com/riot/riot/issues/3024)', () => {
    const element = document.createElement('default-content-slot')
    const component = riot.component(DefaultContentSlot)(element)

    expect(component.root.textContent.replace(/\s+/g, '')).to.be.equal(
      'One.Two.Three.Four.',
    )

    component.update()

    expect(component.root.textContent.replace(/\s+/g, '')).to.be.equal(
      'One.Two.Three.Four.',
    )

    component.unmount()
  })

  it('slots can be forwarded (https://github.com/riot/riot/issues/3055)', () => {
    const element = document.createElement('issue-3055-parent')
    const component = riot.component(Issue3055Parent)(element)

    expect(component.root.querySelector('my-button').textContent).to.be.equal(
      'Default Text',
    )

    component.unmount()
  })

  it('slots can be forwarded and overwritten (https://github.com/riot/riot/issues/3055)', () => {
    const element = document.createElement('issue-3055-combined')
    const component = riot.component(Issue3055Combined)(element)

    const buttons = component.root.querySelectorAll('my-button')

    expect(buttons[0].textContent).to.be.equal('Default Text')
    expect(buttons[1].textContent).to.be.equal('Hello there')
    expect(buttons[2].textContent).to.be.equal('foo')
    expect(buttons[3].textContent).to.be.equal('bar')

    component.unmount()
  })
})
