import { COMPONENTS_IMPLEMENTATION_MAP, panic } from '@riotjs/util'
import { createComponentFromWrapper } from '../core/create-component-from-wrapper.js'

/**
 * Register a custom tag by name
 * @param   {string} name - component name
 * @param   {object} implementation - tag implementation
 * @param   {string} implementation.css - component css as string
 * @param   {TemplateChunk} implementation.template - component template chunk rendering function
 * @param   {object} implementation.exports - component default export
 * @returns {Map} map containing all the components implementations
 */
export function register(name, { css, template, exports }) {
  if (COMPONENTS_IMPLEMENTATION_MAP.has(name))
    panic(`The component "${name}" was already registered`)

  COMPONENTS_IMPLEMENTATION_MAP.set(
    name,
    createComponentFromWrapper({ name, css, template, exports }),
  )

  return COMPONENTS_IMPLEMENTATION_MAP
}
