/**
 * Quick type checking
 * @param   {*} element - anything
 * @param   {string} type - type definition
 * @returns {boolean} true if the type corresponds
 */
export function checkType(element, type) {
  return typeof element === type
}

/**
 * Check that will be passed if its argument is a function
 * @param   {*} value - value to check
 * @returns {boolean} - true if the value is a function
 */
export function isFunction(value) {
  return checkType(value, 'function')
}