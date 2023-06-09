import createRuntimeSlots from '../utils/create-runtime-slots.js'
import { component as originalComponent } from '../api/component.js'

// wrap the original riot component function
// to create the slots from the DOM node
export function component(implementation) {
  const factory = originalComponent(implementation)

  return (el, props, { slots, attributes, parentScope } = {}) => {
    return factory(el, props, {
      slots: slots || createRuntimeSlots(el),
      attributes,
      parentScope,
    })
  }
}
