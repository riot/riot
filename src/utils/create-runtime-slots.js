import {COMPONENTS_IMPLEMENTATION_MAP, DOM_COMPONENT_INSTANCE_PROPERTY} from '@riotjs/util'
import {
  bindingTypes,
  expressionTypes,
  template
} from '@riotjs/dom-bindings'
import {generateSlotsFromString} from '@riotjs/compiler/dist/compiler.essential'

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
    (name) => el[DOM_COMPONENT_INSTANCE_PROPERTY].components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
  )
}
