import isArray from '../checks/is-array'

/**
 * Removes an item from an object at a given key. If the key points to an array,
 * then the item is just removed from the array.
 * @param { Object } obj - object on which to remove the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be removed
 * @param { Boolean } ensureArray - ensure that the property remains an array
*/
export default function arrayishRemove(obj, key, value, ensureArray) {
  if (isArray(obj[key])) {
    let index = obj[key].indexOf(value)
    if (index !== -1) obj[key].splice(index, 1)
    if (!obj[key].length) delete obj[key]
    else if (obj[key].length === 1 && !ensureArray) obj[key] = obj[key][0]
  } else if (obj[key] === value)
    delete obj[key] // otherwise just delete the key
}