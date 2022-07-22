import {PLUGINS_SET, panic} from '@riotjs/util'

/**
 * Uninstall a riot plugin
 * @param   {Function} plugin - plugin previously installed
 * @returns {Set} the set containing all the plugins installed
 */
export function uninstall(plugin) {
  if (!PLUGINS_SET.has(plugin)) panic('This plugin was never installed')

  PLUGINS_SET.delete(plugin)

  return PLUGINS_SET
}
