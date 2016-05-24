import { $, mkEl, setAttr } from '../util'
import { WIN } from '../global-variables'

var styleNode,
// Create cache and shortcut to the correct property
  cssTextProp,
  stylesToInject = ''

// skip the following code on the server
if (WIN) {
  styleNode = (function () {
    // create a new style element with the correct type
    var newNode = mkEl('style')
    setAttr(newNode, 'type', 'text/css')

    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]')
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
   * @param   { String } css [description]
   */
  add: function(css) {
    if (WIN) stylesToInject += css
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject: function() {
    if (stylesToInject && WIN) {
      if (cssTextProp) cssTextProp.cssText += stylesToInject
      else styleNode.innerHTML += stylesToInject
      stylesToInject = ''
    }
  }
}


