/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } list - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
export default function each(list, fn) {
  const len = list ? list.length : 0
  let i = 0
  for (; i < len; i++) fn(list[i], i)
  return list
}