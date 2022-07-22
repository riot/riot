import {IS_DIRECTIVE} from '@riotjs/util'
import {getName} from '../utils/dom'
import {set as setAttr} from 'bianco.attr'

/**
 * Add eventually the "is" attribute to link this DOM node to its css
 * @param {HTMLElement} element - target root node
 * @param {string} name - name of the component mounted
 * @returns {undefined} it's a void function
 */


export function addCssHook(element, name) {
  if (getName(element) !== name) {
    setAttr(element, IS_DIRECTIVE, name)
  }
}
