import $ from 'bianco.query'
import createRuntimeSlots from '../utils/create-runtime-slots.js'
import { mountComponent } from '../core/mount-component.js'

/**
 * Mounting function that will work only for the components that were globally registered
 * @param   {string|HTMLElement} selector - query for the selection or a DOM element
 * @param   {Object} initialProps - the initial component properties
 * @param   {string} name - optional component name
 * @returns {Array} list of riot components
 */
export function mount(selector, initialProps, name) {
  return $(selector).map((element) =>
    mountComponent(element, initialProps, name, createRuntimeSlots(element)),
  )
}
