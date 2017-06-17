export const assign = Object.assign
export const create = Object.create
export const toArray = Array.from

/**
 * Throw an error
 * @param {string} error - error message
 */
export function panic(error) {
  throw new Error(error)
}