
/**
 * Quick type checking
 * @param   {*} element - anything
 * @param   {string} type - type definition
 * @returns {boolean}
 */
export function checkType(element, type) {
  return typeof element === type
}
/**
 * Check if passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
export function isFunction(value) {
  return checkType(value, 'function')
}
