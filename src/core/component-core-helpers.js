import $ from 'bianco.query'

export const COMPONENT_CORE_HELPERS = Object.freeze({
  // component helpers
  $(selector){ return $(selector, this.root)[0] },
  $$(selector){ return $(selector, this.root) }
})
