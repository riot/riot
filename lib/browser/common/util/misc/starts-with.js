/**
 * Faster String startsWith alternative
 * @param   { String } str - source string
 * @param   { String } value - test string
 * @returns { Boolean } -
 */
export default function startsWith(str, value) {
  return str.slice(0, value.length) === value
}