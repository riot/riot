import {PLUGINS_SET, isFunction, panic} from '@riotjs/util'

/**
 * Define a riot plugin
 * @param   {Function} plugin - function that will receive all the components created
 * @returns {Set} the set containing all the plugins installed
 */
export function install(plugin) {
  if (!isFunction(plugin)) panic('Plugins must be of type function')
  if (PLUGINS_SET.has(plugin)) panic('This plugin was already installed')

  PLUGINS_SET.add(plugin)

  return PLUGINS_SET
}
