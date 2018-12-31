import {IS_DIRECTIVE} from '../globals'
import {isString} from './checks'

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   {string} selector - DOM selector
 * @param   {Object} context - DOM node where the targets of our search will is located
 * @returns {Array} dom nodes found
 */
export function $$(selector, context) {
  return Array.from((context || document).querySelectorAll(selector))
}

/**
 * Select a single DOM element
 * @param   {string} selector - DOM selector
 * @param   {Object} context - DOM node where the targets of our search will is located
 * @returns {HTMLElement} DOM node found
 */
export function $(selector, context) {
  return (context || document).querySelector(selector)
}

/**
 * Get the value of any DOM attribute on a node
 * @param   {HTMLElement} element - DOM node we want to inspect
 * @param   {string} name - name of the attribute we want to get
 * @returns {string|undefined} the node attribute if it exists
 */
export function getAttribute(element, name) {
  return element.getAttribute(name)
}

/**
 * Set the value of any DOM attribute
 * @param   {HTMLElement} element - DOM node we to update
 * @param   {string} name - name of the attribute we want to set
 * @param   {string} value - the value of the atribute to set
 * @returns {undefined} void function
 */
export function setAttribute(element, name, value) {
  if (isString(value)) {
    element.setAttribute(name, value)
  }
}

/**
 * Get all the element attributes as object
 * @param   {HTMLElement} element - DOM node we want to parse
 * @returns {Object} all the attributes found as a key value pairs
 */
export function getAttributes(element) {
  return Array.from(element.attributes).reduce((acc, attribute) => {
    acc[attribute.name] = attribute.value
    return acc
  }, {})
}

/**
 * Set multiple DOM attributes
 * @param   {HTMLElement} element target element
 * @param   {Object} attributes - object containing the attributes key values
 * @returns {HTMLElement} - the original element received
 */
export function setAttributes(element, attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
    setAttribute(element, key, value)
  })
  return element
}

/**
 * Get the tag name of any DOM node
 * @param   {HTMLElement} element - DOM node we want to inspect
 * @returns {string} name to identify this dom node in riot
 */
export function getName(element) {
  return getAttribute(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
}