import isNil from './is-nil'

/**
 * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
export default function isBlank(value) {
  return isNil(value) || value === ''
}
