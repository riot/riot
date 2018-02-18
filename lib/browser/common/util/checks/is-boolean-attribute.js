import { RE_BOOL_ATTRS } from './../../global-variables'
/**
 * Check if the passed argument is a boolean attribute
 * @param   { String } value -
 * @returns { Boolean } -
 */
export default function isBoolAttr(value) {
  return RE_BOOL_ATTRS.test(value)
}