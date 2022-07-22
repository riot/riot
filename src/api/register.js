import {COMPONENTS_IMPLEMENTATION_MAP, panic} from '@riotjs/util'
import {createComponentFromWrapper} from '../core/create-component-from-wrapper'

/**
 * Register a custom tag by name
 * @param   {string} name - component name
 * @param   {Object} implementation - tag implementation
 * @returns {Map} map containing all the components implementations
 */
export function register(name, {css, template, exports}) {
  if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component "${name}" was already registered`)

  COMPONENTS_IMPLEMENTATION_MAP.set(name, createComponentFromWrapper(
    {name, css, template, exports})
  )

  return COMPONENTS_IMPLEMENTATION_MAP
}
