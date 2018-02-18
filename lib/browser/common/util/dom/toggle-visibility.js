/**
 * Toggle the visibility of any DOM node
 * @param   { Object }  dom - DOM node we want to hide
 * @param   { Boolean } show - do we want to show it?
 */

export default function toggleVisibility(dom, show) {
  dom.style.display = show ? '' : 'none'
  dom.hidden = show ? false : true
}