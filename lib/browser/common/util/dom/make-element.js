import { SVG_NS } from './../../global-variables'
/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
export default function makeElement(name) {
  return name === 'svg' ? document.createElementNS(SVG_NS, name) : document.createElement(name)
}