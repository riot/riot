import { assign, create, panic } from '../utils/misc'
import { getName } from '../utils/dom'
import { COMPONENTS_IMPLEMENTATION_MAP, COMPONENTS_CREATION_MAP } from '../globals'

const COMPONENT_STRUCT = {
  update() {

  },
  render() {

  },
  mixin() {

  },
  unmount() {

  }
}

/**
 * Component definition factory function
 * @param   {object} implementation - component custom implementation
 * @returns {object} a new component implementation object
 */
export function define(implementation) {
  const component = assign({}, create(COMPONENT_STRUCT), implementation)
  return component
}

/**
 * Component initialization function
 * @param   {HTMLElement} element - element to upgrade
 * @param   {object} options - [description]
 * @returns {object} a new component instance bound to a DOM node
 */
export function initialize(element, options) {
  const name = getName(element)
  if (!COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component named "${name}" was never registered`)
  const component = assign(
    create(COMPONENTS_IMPLEMENTATION_MAP.get(name)),
    {
      options
    }
  )
  COMPONENTS_CREATION_MAP.set(element, component)
  return component
}
