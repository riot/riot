import {
  T_STRING,
  T_OBJECT,
  T_FUNCTION,
  T_UNDEF,
  RE_SVG_TAGS
} from './global-variables'

/**
 * Check whether a DOM node must be considered a part of an svg document
 * @param   { String } name -
 * @returns { Boolean } -
 */
export function isSVGTag(name) {
  return RE_SVG_TAGS.test(name)
}

/**
 * Check if the passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
export function isFunction(value) {
  return typeof value === T_FUNCTION || false // avoid IE problems
}

/**
 * Check if the passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
export function isObject(value) {
  return value && typeof value === T_OBJECT // typeof null is 'object'
}

/**
 * Check if the passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
export function isUndefined(value) {
  return typeof value === T_UNDEF
}

/**
 * Check if the passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
export function isString(value) {
  return typeof value === T_STRING
}

/**
 * Check if the passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
export function isBlank(value) {
  return isUndefined(value) || value === null || value === ''
}

/**
 * Check if the passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
export function isArray(value) {
  return Array.isArray(value) || value instanceof Array
}

/**
 * Check if a property of an object could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } -
 */
export function isWritable(obj, key) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key)
  return isUndefined(obj[key]) || descriptor && descriptor.writable
}

/**
 * Check whether an array contains an item
 * @param   { Array } array - target array
 * @param   { * } item - item to test
 * @returns { Boolean } -
 */
export function contains(array, item) {
  return !!~array.indexOf(item)
}

/**
 * Faster String startsWith alternative
 * @param   { String } src - source string
 * @param   { String } str - test string
 * @returns { Boolean } -
 */
export function startsWith(src, str) {
  return src.slice(0, str.length) === str
}
