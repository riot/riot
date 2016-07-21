import {
  RE_SVG_TAGS,
  RE_HTML_ATTRS,
  RE_BOOL_ATTRS
} from './../global-variables'

import {
  isUndefined
} from './check'

/**
 * Check whether a DOM node must be considered a part of an svg document
 * @param   { String } name -
 * @returns { Boolean } -
 */
export function isSVGTag(name) {
  return RE_SVG_TAGS.test(name)
}

/**
 * Check Check if the passed argument is undefined
 * @param   { String } name -
 * @returns { Boolean } -
 */
export function isBoolAttr(value) {
  return RE_BOOL_ATTRS.test(value)
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @param   { Boolean } isSvg - should we use a SVG as parent node?
 * @returns { Object } DOM node just created
 */
export function mkEl(name, isSvg) {
  return isSvg ?
    document.createElementNS('http://www.w3.org/2000/svg', 'svg') :
    document.createElement(name)
}

/**
 * Get the outer html of any DOM node SVGs included
 * @param   { Object } el - DOM node to parse
 * @returns { String } el.outerHTML
 */
export function getOuterHTML(el) {
  if (el.outerHTML)
    return el.outerHTML
  // some browsers do not support outerHTML on the SVGs tags
  else {
    const container = mkEl('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we'll inject new html
 * @param { String } html - html to inject
 */
export function setInnerHTML(container, html) {
  if (!isUndefined(container.innerHTML))
    container.innerHTML = html
    // some browsers do not support innerHTML on the SVGs tags
  else {
    const doc = new DOMParser().parseFromString(html, 'application/xml')
    const node = container.ownerDocument.importNode(doc.documentElement, true)
    container.appendChild(node)
  }
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
export function remAttr(dom, name) {
  dom.removeAttribute(name)
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
export function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
export function setAttr(dom, name, val) {
  dom.setAttribute(name, val)
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
export function walkAttrs(html, fn) {
  if (!html)
    return
  let m
  while (m = RE_HTML_ATTRS.exec(html))
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
}
