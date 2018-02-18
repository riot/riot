/**
 * Function returning always a unique identifier
 * @returns { Number } - number from 0...n
 */
export default (function uid() {
  let i = -1
  return () => ++i
})()

