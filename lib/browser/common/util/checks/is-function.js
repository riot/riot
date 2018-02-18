import { T_FUNCTION } from './../../global-variables'
/**
 * Check if passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
export default function isFunction(value) {
  return typeof value === T_FUNCTION
}