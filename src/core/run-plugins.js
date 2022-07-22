import {PLUGINS_SET} from '@riotjs/util'

/**
 * Run the component instance through all the plugins set by the user
 * @param   {Object} component - component instance
 * @returns {Object} the component enhanced by the plugins
 */
export function runPlugins(component) {
  return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component)
}
