import $ from 'bianco.query'
import {getWindow} from '../utils/dom'
import {set as setAttr} from 'bianco.attr'

export const WIN = getWindow()
export const CSS_BY_NAME = new Map()
export const STYLE_NODE_SELECTOR = 'style[riot]'

// skip the following code on the server
const styleNode = WIN && ((() => {
  // create a new style element or use an existing one
  const style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style')
  setAttr(style, 'type', 'text/css')

  if (!style.parentNode) document.head.appendChild(style)

  return style
}))()

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
export default {
  /**
   * Save a tag style to be later injected into DOM
   * @param { string } name - if it's passed we will map the css to a tagname
   * @param { string } css - css string
   * @returns {Object} self
   */
  add(name, css) {
    if (!CSS_BY_NAME.has(name)) {
      CSS_BY_NAME.set(name, css)
    }

    this.inject()
    return this
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   * @returns {Object} self
   */
  inject() {
    // a node environment can't rely on css
    /* istanbul ignore next */
    if (!styleNode) return this
    styleNode.innerHTML = [...CSS_BY_NAME.values()].join('\n')
    return this
  },

  /**
   * Remove a tag style from the DOM
   * @param {string} name a registered tagname
   * @returns {Object} self
   */
  remove(name) {
    // a node environment can't rely on css
    /* istanbul ignore next */
    if (!styleNode) return this
    if (CSS_BY_NAME.has(name)) {
      CSS_BY_NAME.delete(name)
      this.inject()
    }

    return this
  }
}
