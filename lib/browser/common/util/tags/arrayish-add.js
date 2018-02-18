import isArray from '../checks/is-array'
import isUndefined from '../checks/is-undefined'

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 * @param { Number } index - add the new item in a certain array position
 */
export default function arrayishAdd(obj, key, value, ensureArray, index) {
  const dest = obj[key]
  const isArr = isArray(dest)
  const hasIndex = !isUndefined(index)

  if (dest && dest === value) return

  // if the key was never set, set it once
  if (!dest && ensureArray) obj[key] = [value]
  else if (!dest) obj[key] = value
  // if it was an array and not yet set
  else {
    if (isArr) {
      const oldIndex = dest.indexOf(value)
      // this item never changed its position
      if (oldIndex === index) return
      // remove the item from its old position
      if (oldIndex !== -1) dest.splice(oldIndex, 1)
      // move or add the item
      if (hasIndex) {
        dest.splice(index, 0, value)
      } else {
        dest.push(value)
      }
    } else obj[key] = [dest, value]
  }
}