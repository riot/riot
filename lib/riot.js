import { define, initialize } from './core/component'
import { panic, create } from './utils/misc'
import { isFunction } from './utils/checks'
import { $$ } from './utils/dom'
import { COMPONENTS_IMPLEMENTATION_MAP, COMPONENTS_CREATION_MAP, MIXINS_MAP } from './globals'

/**
 * Riot public api
 */

/**
 * Register a custom tag by name
 * @param   {string} name - component name
 * @param   {object} implementation - tag implementation
 * @returns {object} object representing our tag implementation
 */
export function register(name, implementation) {
  if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component "${name}" was already registered`)
  return COMPONENTS_IMPLEMENTATION_MAP.set(name, define(implementation))
}

/**
 * Unregister a riot web component
 * @param   {string} name - component name
 * @returns {boolean} true if deleted
 */
export function unregister(name) {
  if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) return COMPONENTS_IMPLEMENTATION_MAP.delete(name)
  return false
}

/**
 * Mounting function
 * @param   {string|HTMLElement} selector - query for the selection or a DOM element
 * @param   {object} options - options that will be passed to the element instance
 * @returns {array} list of nodes upgraded
 */
export function mount(selector, options) {
  return $$(selector).map((element) => initialize(element, options))
}

/**
 * Unmounting function
 * @param   {string|HTMLElement} selector - query for the selection or a DOM element
 * @returns {array} list of nodes unmounted
 */
export function unmount(selector) {
  return $$(selector).map((element) => {
    if (COMPONENTS_CREATION_MAP.has(element)) {
      COMPONENTS_CREATION_MAP.get(element).unmount()
    }
    return element
  })
}

/**
 * Define a mixin
 * @param   {string} name - mixin id
 * @param   {object|function} mixin - mixin logic
 * @returns {object} a copy of the mixin just created
 */
export function mixin(name, mixin) {
  if (MIXINS_MAP.has(name)) panic(`The mixin "${name}" was already defined`)
  let mix

  if (isFunction(mixin)) {
    mix = create(mixin())
  } else {
    mix = create(mixin)
  }

  MIXINS_MAP.set(name, mix)

  return mix
}
