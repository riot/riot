/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = (function() {

  if (!window) return // skip injection on the server

  var styleNode,
    placeholder

  /**
   * Inject stuff in the DOM only if it's really needed
   * @returns { Object } DOM style node object
   */
  function init() {
    // create the style node
    styleNode = mkEl('style')
    placeholder = $('style[type=riot]')

    setAttr(styleNode, 'type', 'text/css')

    // inject the new node into the DOM -- in head
    if (placeholder) {
      placeholder.parentNode.replaceChild(styleNode, placeholder)
      placeholder = null
    }
    else document.getElementsByTagName('head')[0].appendChild(styleNode)

    // extends the <style> node for dynamic CSS
    styleNode.stylesToInject = ''
    styleNode.needUpdate = false

    styleNode.updateStyles = function() {
      if (styleNode.stylesToInject) {
        var css = styleNode.stylesToInject
        if (styleNode.parser) {
          css = styleNode.parser(css)
        }
        if (styleNode.styleSheet) styleNode.styleSheet.cssText = css
        else styleNode.innerHTML = css
      }
    }

    return styleNode

  }

  /**
   * Public api
   */
  return {

    /**
      * Save a tag style to be later injected into DOM
      * @param   { String } css [description]
      */
    add: function(css) {
      /**
      * Export the DOM node where the css will be injected
      * @type { DOM Object }
      */
      if (!styleNode) this.styleNode = init() // only if the styleNode was not created yet
      styleNode.stylesToInject += css
      styleNode.needUpdate = true
    },

    /**
      * Inject all previously saved tag styles into DOM
      * innerHTML seems slow: http://jsperf.com/riot-insert-style
      */
    inject: function() {
      if (!styleNode.needUpdate) return
      styleNode.updateStyles()
      styleNode.needUpdate = false
    }
  }

})()
