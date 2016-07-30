import {
  isArray,
  isUndefined,
  isFunction,
  isWritable
} from './check'

/**
 * Specialized function for looping an array-like collection or object with `each={}`
 * @param   { Array } list - collection of items
 * @param   {Function} cb - callback function
 * @returns { Array } the array looped
 */
export function each(list, cb) {
  if (!list)
    return list

  // not an array-like collection
  if (isUndefined(list.length)) {
    for (let key in list) {
      if (list.hasOwnProperty(key)) {
        let value = list[key]

        if (isFunction(cb))
          cb(value, key)
      }
    }
  } else {
    const len = list ? list.length : 0

    for (let i = 0, value; i < len; ++i) {
      value = list[i]
      // return false -> current item was removed by fn during the loop
      if (isFunction(cb) && cb(value, i) === false)
        i--
    }
  }

  return list
}

export function clear(obj) {
  each(obj, (value, key) => {
    delete obj[key]
  })
}

/**
 * Check whether an array contains an item
 * @param   { Array } array - target array
 * @param   { * } item - item to test
 * @returns { Boolean } -
 */
export function contains(array, item) {
  return ~array.indexOf(item)
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } str - input string
 * @returns { String } my-string -> myString
 */
export function toCamel(str) {
  return str.replace(/-(\w)/g, (_, c) => c.toUpperCase())
}

/**
 * Faster String startsWith alternative
 * @param   { String } str - source string
 * @param   { String } value - test string
 * @returns { Boolean } -
 */
export function startsWith(str, value) {
  return str.slice(0, value.length) === value
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
 * @param   { Object } [options] - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
export function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options))
  return el
}

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
export function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          src[key] = obj[key]
      }
    }
  }
  return src
}

/**
 * Simple object prototypal inheritance
 * @param   { Object } parent - parent object
 * @returns { Object } child instance
 */
export function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 */
export function arrayishAdd(obj, key, value, ensureArray) {
  var dest = obj[key]
  var isArr = isArray(dest)

  if (dest && dest === value) return

  // if the key was never set, set it once
  if (!dest && ensureArray) obj[key] = [value]
  else if (!dest) obj[key] = value
  // if it was an array and not yet set
  else if (!isArr || isArr && !contains(dest, value)) {
    if (isArr) dest.push(value)
    else obj[key] = [dest, value]
  }
}

/**
 * Removes an item from an object at a given key. If the key points to an array,
 * then the item is just removed from the array.
 * @param { Object } obj - object on which to remove the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be removed
 * @param { Boolean } ensureArray - ensure that the property remains an array
*/
export function arrayishRemove(obj, key, value, ensureArray) {
  if (isArray(obj[key])) {
    each(obj[key], function(item, i) {
      if (item === value) obj[key].splice(i, 1)
    })
    if (!obj[key].length) delete obj[key]
    else if (obj[key].length == 1 && !ensureArray) obj[key] = obj[key][0]
  } else
    delete obj[key] // otherwise just delete the key
}
