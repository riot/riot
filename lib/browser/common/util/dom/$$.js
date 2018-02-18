/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
export default function $$(selector, ctx) {
  return [].slice.call((ctx || document).querySelectorAll(selector))
}