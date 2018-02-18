import { RE_HTML_ATTRS } from './../../global-variables'
/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
export default function walkAttributes(html, fn) {
  if (!html) return
  let m
  while (m = RE_HTML_ATTRS.exec(html))
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
}
