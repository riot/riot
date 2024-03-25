import { COMPONENTS_IMPLEMENTATION_MAP, panic } from '@riotjs/util'

/**
 * Get a custom tag implementation by name
 * @param   {string} name - component name
 * @returns {Object} implementation - tag implementation
 */
export function get(name) {
  if (!COMPONENTS_IMPLEMENTATION_MAP.has(name))
    panic(`The component "${name}" was never registered`)

  return COMPONENTS_IMPLEMENTATION_MAP.get(name)
}
