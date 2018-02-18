import { T_UNDEF } from './../../global-variables'

/**
 * Check if passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
export default function isUndefined(value) {
  return typeof value === T_UNDEF
}