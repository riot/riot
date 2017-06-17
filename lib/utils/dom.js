import { toArray } from './misc'
import { IS_DIRECTIVE } from '../globals'

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   {string} selector - DOM selector
 * @param   {object} context - DOM node where the targets of our search will is located
 * @returns {array} dom nodes found
 */
export function $$(selector, context) {
  return toArray((context || document).querySelectorAll(selector))
}

/**
 * Get the value of any DOM attribute on a node
 * @param   {object} element - DOM node we want to inspect
 * @param   {string} name - name of the attribute we want to get
 * @returns {string|undefined} the node attribute if it exists
 */
export function getAttr(element, name) {
  return element.getAttribute(name)
}

/**
 * Get the tag name of any DOM node
 * @param   {object} element - DOM node we want to inspect
 * @returns {string} name to identify this dom node in riot
 */
export function getName(element) {
  return getAttr(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
}