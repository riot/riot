import {
  IS_PURE_SYMBOL,
  MOUNT_METHOD_KEY,
  defineDefaults,
  defineProperty,
  panic,
} from '@riotjs/util'
import { PURE_COMPONENT_API } from './pure-component-api.js'
import { bindDOMNodeToComponentInstance } from './bind-dom-node-to-component-instance.js'
import { createCoreAPIMethods } from './create-core-api-methods.js'

/**
 * Create a pure component
 * @param   {Function} pureFactoryFunction - pure component factory function
 * @param   {object} options - pure component options
 * @param   {string} options.css - pure component can't have css
 * @param   {Array} options.slots - component slots
 * @param   {Array} options.attributes - component attributes
 * @param   {Array} options.template - template factory function
 * @param   {any} options.props - initial component properties
 * @returns {object} pure component object
 */
export function createPureComponent(
  pureFactoryFunction,
  { slots, attributes, props, css, template },
) {
  if (template) panic('Pure components can not have html')
  if (css) panic('Pure components do not have css')

  const component = defineDefaults(
    pureFactoryFunction({ slots, attributes, props }),
    PURE_COMPONENT_API,
  )

  return createCoreAPIMethods((method) => (...args) => {
    // intercept the mount calls to bind the DOM node to the pure object created
    // see also https://github.com/riot/riot/issues/2806
    if (method === MOUNT_METHOD_KEY) {
      const [element] = args
      // mark this node as pure element
      defineProperty(element, IS_PURE_SYMBOL, true)
      bindDOMNodeToComponentInstance(element, component)
    }

    component[method](...args)

    return component
  })
}
