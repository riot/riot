/**
 * Check if passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
export default function isArray(value) {
  return Array.isArray(value) || value instanceof Array
}