import $ from 'bianco.query'
import {get as getAttr} from 'bianco.attr'
import {template} from '@riotjs/dom-bindings'

/**
 * Binding responsible for the slots
 */
export const Slot = Object.seal({
  // dynamic binding properties
  node: null,
  name: null,
  template: null,

  // API methods
  mount(scope) {
    if (!this.template) {
      this.node.parentNode.removeChild(this.node)
    } else {
      this.template.mount(this.node, scope)
      moveSlotInnerContent(this.node)
    }

    return this
  },
  update(scope) {
    if (!this.template) return this
    this.template.update(scope)

    return this
  },
  unmount(scope) {
    if (!this.template) return this
    this.template.unmount(scope)

    return this
  }
})

/**
 * Move the inner content of the slots outside of them
 * @param   {HTMLNode} slot - slot node
 * @returns {undefined} it's a void function
 */
function moveSlotInnerContent(slot) {
  if (slot.firstChild) {
    slot.parentNode.insertBefore(slot.firstChild, slot)
    moveSlotInnerContent(slot)
  }

  if (slot.parentNode) {
    slot.parentNode.removeChild(slot)
  }
}

/**
 * Create a single slot binding
 * @param   {HTMLElement} root - component root
 * @param   {HTMLElement} node - slot node
 * @param   {string} options.name - slot id
 * @param   {Array} options.slots - component slots
 * @returns {Object} Slot binding object
 */
function createSlot(root, node, { name, slots }) {
  const templateData = slots.find(({id}) => id === name)

  return {
    ...Slot,
    node,
    name,
    template: templateData && template(
      templateData.html,
      templateData.bindings
    ).createDOM(root)
  }
}

/**
 * Create the object that will manage the slots
 * @param   {HTMLElement} root - component root element
 * @param   {Array} slots - slots objects containing html and bindings
 * @return  {Object} tag like interface that will manage all the slots
 */
export default function createSlots(root, slots) {
  const slotNodes = $('slot', root)
  const slotsBindings = slotNodes.map(node => {
    const name = getAttr(node, 'name') || 'default'
    return createSlot(root, node, { name, slots })
  })

  return {
    mount(scope) {
      slotsBindings.forEach(s => s.mount(scope))
      return this
    },
    update(scope) {
      slotsBindings.forEach(s => s.update(scope))
      return this
    },
    unmount(scope) {
      slotsBindings.forEach(s => s.unmount(scope))
      return this
    }
  }

}