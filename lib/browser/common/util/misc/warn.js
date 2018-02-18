/**
 * Warn a message via console
 * @param   {String} message - warning message
 */
export default function warn(message) {
  if (console && console.warn) console.warn(message)
}
