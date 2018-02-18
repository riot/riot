import { T_STRING } from './../../global-variables'

/**
 * Check if passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
export default function isString(value) {
  return typeof value === T_STRING
}
