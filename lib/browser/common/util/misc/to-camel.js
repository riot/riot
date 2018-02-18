/**
 * Convert a string containing dashes to camel case
 * @param   { String } str - input string
 * @returns { String } my-string -> myString
 */
export default function toCamel(str) {
  return str.replace(/-(\w)/g, (_, c) => c.toUpperCase())
}