import { SVG_NS } from './../../global-variables'

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we'll inject new html
 * @param { String } html - html to inject
 * @param { Boolean } isSvg - svg tags should be treated a bit differently
 */
/* istanbul ignore next */
export default function setInnerHTML(container, html, isSvg) {
  // innerHTML is not supported on svg tags so we neet to treat them differently
  if (isSvg) {
    const node = container.ownerDocument.importNode(
      new DOMParser()
        .parseFromString(`<svg xmlns="${ SVG_NS }">${ html }</svg>`, 'application/xml')
        .documentElement,
      true
    )

    container.appendChild(node)
  } else {
    container.innerHTML = html
  }
}