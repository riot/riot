/**
 * Check if a DOM node is an svg tag or part of an svg
 * @param   { HTMLElement }  el - node we want to test
 * @returns {Boolean} true if it's an svg node
 */
export default function isSvg(el) {
  const owner = el.ownerSVGElement
  return !!owner || owner === null
}