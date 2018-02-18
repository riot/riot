/**
 * Convert a style object to a string
 * @param   { Object } style - style object we need to parse
 * @returns { String } resulting css string
 * @example
 * styleObjectToString({ color: 'red', height: '10px'}) // => 'color: red; height: 10px'
 */
export default function styleObjectToString(style) {
  return Object.keys(style).reduce((acc, prop) => {
    return `${acc} ${prop}: ${style[prop]};`
  }, '')
}