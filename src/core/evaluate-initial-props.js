import {DOMattributesToObject} from '@riotjs/util/dom'
import {callOrAssign} from '@riotjs/util/functions'

/**
 * Evaluate the component properties either from its real attributes or from its initial user properties
 * @param   {HTMLElement} element - component root
 * @param   {Object}  initialProps - initial props
 * @returns {Object} component props key value pairs
 */
export function evaluateInitialProps(element, initialProps = {}) {
  return {
    ...DOMattributesToObject(element),
    ...callOrAssign(initialProps)
  }
}
