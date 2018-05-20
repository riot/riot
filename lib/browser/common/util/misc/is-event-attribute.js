const EVENT_ATTR_RE = /^on/

/**
 * True if the event attribute starts with 'on'
 * @param   { String } attribute - event attribute
 * @returns { Boolean }
 */
export default function isEventAttribute(attribute) {
  return EVENT_ATTR_RE.test(attribute)
}