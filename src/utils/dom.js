import {IS_DIRECTIVE} from '../globals'
import {dashToCamelCase} from './misc'
import {get as getAttr} from 'bianco.attr'

/**
 * Get all the element attributes as object
 * @param   {HTMLElement} element - DOM node we want to parse
 * @returns {Object} all the attributes found as a key value pairs
 */
export function DOMattributesToObject(element) {
  return Array.from(element.attributes).reduce((acc, attribute) => {
    acc[dashToCamelCase(attribute.name)] = attribute.value
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