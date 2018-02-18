import getPropDescriptor from '../misc/get-prop-descriptor'
import isUndefined from './is-undefined'
/**
 * Check whether object's property could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } true if writable
 */
export default function isWritable(obj, key) {
  const descriptor = getPropDescriptor(obj, key)
  return isUndefined(obj[key]) || descriptor && descriptor.writable
}
