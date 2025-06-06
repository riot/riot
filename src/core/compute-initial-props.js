import { DOMattributesToObject, callOrAssign } from '@riotjs/util'

/**
 * Evaluate the component properties either from its real attributes or from its initial user properties
 * @param   {HTMLElement} element - component root
 * @param   {object}  initialProps - initial props
 * @returns {object} component props key value pairs
 */
export function computeInitialProps(element, initialProps = {}) {
  return {
    ...DOMattributesToObject(element),
    ...callOrAssign(initialProps),
  }
}
