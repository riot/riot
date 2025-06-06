import {
  MOUNT_METHOD_KEY,
  UNMOUNT_METHOD_KEY,
  UPDATE_METHOD_KEY,
} from '@riotjs/util'

/**
 * Wrap the Riot.js core API methods using a mapping function
 * @param   {Function} mapFunction - lifting function
 * @returns {object} an object having the { mount, update, unmount } functions
 */
export function createCoreAPIMethods(mapFunction) {
  return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce(
    (acc, method) => {
      acc[method] = mapFunction(method)

      return acc
    },
    {},
  )
}
