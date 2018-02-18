import { T_OBJECT } from './../../global-variables'

/**
 * Check if passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
export default function isObject(value) {
  return value && typeof value === T_OBJECT // typeof null is 'object'
}
