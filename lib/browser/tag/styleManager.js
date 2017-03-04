import { $, mkEl, setAttr } from './../common/util/dom'
import { WIN } from './../common/global-variables'

var styleNode,
// Create cache and shortcut to the correct property
  cssTextProp,
  byName = {},
  remainder = [],
  needsInject = false

// skip the following code on the server
if (WIN) {
  styleNode = (function () {
    // create a new style element with the correct type
    var newNode = mkEl('style')
    setAttr(newNode, 'type', 'text/css')

    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]')
    /* istanbul ignore next */
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id
      userNode.parentNode.replaceChild(newNode, userNode)
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode)

    return newNode
  })()
  cssTextProp = styleNode.styleSheet
}

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
export default {
  styleNode: styleNode,
  /**
   * Save a tag style to be later injected into DOM
   * @param { String } css - css string
   * @param { String } name - if it's passed we will map the css to a tagname
   */
  add(css, name) {
    if (name) byName[name] = css
    else remainder.push(css)
    needsInject = true
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject() {
    if (!WIN || !needsInject) return
    needsInject = false
    var style = Object.keys(byName)
      .map(function(k) { return byName[k] })
      .concat(remainder).join('\n')
    /* istanbul ignore next */
    if (cssTextProp) cssTextProp.cssText = style
    else styleNode.innerHTML = style
  }
}
