/**
 * Check whether an array contains an item
 * @param   { Array } array - target array
 * @param   { * } item - item to test
 * @returns { Boolean } -
 */
export default function contains(array, item) {
  return array.indexOf(item) !== -1
}