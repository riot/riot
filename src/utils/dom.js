import {IS_DIRECTIVE} from '../globals'
import {get as getAttr} from 'bianco.attr'

/**
 * Get the document window
 * @returns {Object} window object
 */
export function getWindow() {
  return typeof window === 'undefined' ? /* istanbul ignore next */ undefined : window
}


/**
 * Get all the element attributes as object
 * @param   {HTMLElement} element - DOM node we want to parse
 * @returns {Object} all the attributes found as a key value pairs
 */
export function DOMattributesToObject(element) {
  return Array.from(element.attributes).reduce((acc, attribute) => {
    acc[attribute.name] = attribute.value
    return acc
  }, {})
}

/**
 * Get the tag name of any DOM node
 * @param   {HTMLElement} element - DOM node we want to inspect
 * @returns {string} name to identify this dom node in riot
 */
export function getName(element) {
  return getAttr(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
}