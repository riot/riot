import * as globals from './globals'
import {callOrAssign, panic} from './utils/misc'
import {defineComponent, mountComponent} from './core/component'
import {$$} from './utils/dom'
import cssManager from './core/css-manager'
import {isFunction} from './utils/checks'

const { COMPONENTS_CREATION_MAP, COMPONENTS_IMPLEMENTATION_MAP, MIXINS_MAP, PLUGINS_SET } = globals

/**
 * Riot public api
 */

/**
 * Register a custom tag by name
 * @param   {string} name - component name
 * @param   {Object} implementation - tag implementation
 * @returns {Object} object representing our tag implementation
 */
export function register(name, {css, template, tag}) {
  if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component "${name}" was already registered`)

  return COMPONENTS_IMPLEMENTATION_MAP.set(name, (...args) => {
    const component = defineComponent({
      css,
      template,
      tag,
      name
    })(...args)

    // this object will be provided to the tag bindings generated via compiler
    // the bindings will not be able to update the components state, they will only pass down
    // the parentScope updates
    return {
      mount(element, parentScope, state) {
        return component.mount(element, state, parentScope)
      },
      update(parentScope, state) {
        return component.update(state, parentScope)
      },
      unmount() {
        return component.unmount()
      }
    }
  })
}

/**
 * Unregister a riot web component
 * @param   {string} name - component name
 * @returns {boolean} true if deleted
 */
export function unregister(name) {
  if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) return COMPONENTS_IMPLEMENTATION_MAP.delete(name)
  cssManager.remove(name)
  return false
}

/**
 * Mounting function that will work only for the components that were globally registered
 * @param   {string|HTMLElement} selector - query for the selection or a DOM element
 * @param   {Object} initialState - the initial component state
 * @param   {string} name - optional component name
 * @returns {Array} list of nodes upgraded
 */
export function mount(selector, initialState, name) {
  return $$(selector).map((element) => mountComponent(element, initialState, name))
}

/**
 * Sweet unmounting helper function for the DOM node mounted manually by the user
 * @param   {string|HTMLElement} selector - query for the selection or a DOM element
 * @returns {Array} list of nodes unmounted
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
 * @param   {Object|Function} mixin - mixin logic
 * @returns {Map} the map containing all the mixins
 */
export function mixin(name, mixin) {
  if (MIXINS_MAP.has(name)) panic(`The mixin "${name}" was already defined`)

  MIXINS_MAP.set(name, callOrAssign(mixin))

  return MIXINS_MAP
}

/**
 * Define a riot plugin
 * @param   {Function} plugin - function that will receive all the components created
 * @returns {Set} the set containing all the plugins installed
 */
export function install(plugin) {
  if (!isFunction(plugin)) panic('Plugins must be of type function')
  if (PLUGINS_SET.has(name)) panic('This plugin was already install')

  PLUGINS_SET.add(plugin)

  return PLUGINS_SET
}

/**
 * Function to define an anonymous component
 * @param   {Object} component - this object should contain the component implementation,
 * like css and/or template/render function
 * @param   {Object} slotsAndAttributes - object containing the slots or attribute expressions
 * you shouldn't normally need it but it might be handy for testing
 * @returns {Riot.Component} a riot component instance
 */
export const component = ({css, template, ...rest}, slotsAndAttributes = {}) => defineComponent({
  css,
  template,
  tag: rest
})(slotsAndAttributes)

/** @type {string} current riot version */
export const version = 'WIP'

// expose some internal stuff that might be used from external tools
export const __ = {
  cssManager,
  globals
}
