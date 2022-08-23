import {
  bindingTypes,
  expressionTypes,
  template
} from '@riotjs/dom-bindings'
import {COMPONENTS_IMPLEMENTATION_MAP} from '@riotjs/util'
import {generateSlotsFromString} from '@riotjs/compiler/dist/compiler.essential.esm'

/**
 * Create slots reading the inner HTML of the node
 * @param {HTMLElement} el element we are going to mount
 * @returns {[]|null} Slots array
 */
export default function createRuntimeSlots(el) {
  if (!el.innerHTML.trim()) return null
  const slotsCode = generateSlotsFromString(el.outerHTML)

  // clear the DOM node once read
  el.innerHTML = ''

  // parse the element html to create the runtime bindings
  return Function(`return ${slotsCode}`)()(
    template,
    expressionTypes,
    bindingTypes,
    name => COMPONENTS_IMPLEMENTATION_MAP.get(name)
  )
}
