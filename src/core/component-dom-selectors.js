import $ from 'bianco.query'

export const COMPONENT_DOM_SELECTORS = Object.freeze({
  // component helpers
  $(selector) {
    return $(selector, this.root)[0]
  },
  $$(selector) {
    return $(selector, this.root)
  },
})
