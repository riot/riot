import isUndefined from './is-undefined'

/**
 * Check against the null and undefined values
 * @param   { * }  value -
 * @returns {Boolean} -
 */
export default function isNil(value) {
  return isUndefined(value) || value === null
}