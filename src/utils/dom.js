import {IS_DIRECTIVE} from '@riotjs/util/constants'
import {get as getAttr} from 'bianco.attr'

/**
 * Get the tag name of any DOM node
 * @param   {HTMLElement} element - DOM node we want to inspect
 * @returns {string} name to identify this dom node in riot
 */
export function getName(element) {
  return getAttr(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
}