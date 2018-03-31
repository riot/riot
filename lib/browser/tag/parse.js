import _each from './each'
import { tmpl } from 'riot-tmpl'
import {
  CONDITIONAL_DIRECTIVE,
  LOOP_DIRECTIVE,
  IS_DIRECTIVE,
  REF_DIRECTIVES,
  YIELD_TAG
} from './../common/global-variables'

import createRefDirective from './../common/util/tags/create-ref-directive'
import createIfDirective from './../common/util/tags/create-if-directive'
import isBoolAttr from './../common/util/checks/is-boolean-attribute'
import walkNodes from './../common/util/dom/walk-nodes'
import getAttribute from './../common/util/dom/get-attribute'
import setAttribute from './../common/util/dom/set-attribute'
import each from './../common/util/misc/each'
import contains from './../common/util/misc/contains'
import warn from './../common/util/misc/warn'
import getTag from './../common/util/tags/get'
import initChild from './../common/util/tags/init-child'
import createTag from './tag'

/**
 * Walk the tag DOM to detect the expressions to evaluate
 * @this Tag
 * @param   { HTMLElement } root - root tag where we will start digging the expressions
 * @param   { Boolean } mustIncludeRoot - flag to decide whether the root must be parsed as well
 * @returns { Array } all the expressions found
 */
export function parseExpressions(root, mustIncludeRoot) {
  const expressions = []

  walkNodes(root, (dom) => {
    const type = dom.nodeType
    let attr
    let tagImpl

    if (!mustIncludeRoot && dom === root) return

    // text node
    if (type === 3 && dom.parentNode.tagName !== 'STYLE' && tmpl.hasExpr(dom.nodeValue))
      expressions.push({dom, expr: dom.nodeValue})

    if (type !== 1) return

    const isVirtual = dom.tagName === 'VIRTUAL'

    // loop. each does it's own thing (for now)
    if (attr = getAttribute(dom, LOOP_DIRECTIVE)) {
      if(isVirtual) setAttribute(dom, 'loopVirtual', true) // ignore here, handled in _each
      expressions.push(_each(dom, this, attr))
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttribute(dom, CONDITIONAL_DIRECTIVE)) {
      expressions.push(createIfDirective(dom, this, attr))
      return false
    }

    if (attr = getAttribute(dom, IS_DIRECTIVE)) {
      if (tmpl.hasExpr(attr)) {
        expressions.push({
          isRtag: true,
          expr: attr,
          dom,
          attrs: [].slice.call(dom.attributes)
        })

        return false
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    tagImpl = getTag(dom)

    if(isVirtual) {
      if(getAttribute(dom, 'virtualized')) {dom.parentElement.removeChild(dom) } // tag created, remove from dom
      if(!tagImpl && !getAttribute(dom, 'virtualized') && !getAttribute(dom, 'loopVirtual'))  // ok to create virtual tag
        tagImpl = { tmpl: dom.outerHTML }
    }

    if (tagImpl && (dom !== root || mustIncludeRoot)) {
      const hasIsDirective = getAttribute(dom, IS_DIRECTIVE)
      if(isVirtual && !hasIsDirective) { // handled in update
        // can not remove attribute like directives
        // so flag for removal after creation to prevent maximum stack error
        setAttribute(dom, 'virtualized', true)
        const tag = createTag(
          {tmpl: dom.outerHTML},
          {root: dom, parent: this},
          dom.innerHTML
        )

        expressions.push(tag) // no return, anonymous tag, keep parsing
      } else {
        if (hasIsDirective && isVirtual)
          warn(`Virtual tags shouldn't be used together with the "${IS_DIRECTIVE}" attribute - https://github.com/riot/riot/issues/2511`)

        expressions.push(
          initChild(
            tagImpl,
            {
              root: dom,
              parent: this
            },
            dom.innerHTML,
            this
          )
        )
        return false
      }
    }

    // attribute expressions
    parseAttributes.apply(this, [dom, dom.attributes, (attr, expr) => {
      if (!expr) return
      expressions.push(expr)
    }])
  })

  return expressions
}

/**
 * Calls `fn` for every attribute on an element. If that attr has an expression,
 * it is also passed to fn.
 * @this Tag
 * @param   { HTMLElement } dom - dom node to parse
 * @param   { Array } attrs - array of attributes
 * @param   { Function } fn - callback to exec on any iteration
 */
export function parseAttributes(dom, attrs, fn) {
  each(attrs, (attr) => {
    if (!attr) return false

    const name = attr.name
    const bool = isBoolAttr(name)
    let expr

    if (contains(REF_DIRECTIVES, name) && dom.tagName.toLowerCase() !== YIELD_TAG) {
      expr =  createRefDirective(dom, this, name, attr.value)
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom, expr: attr.value, attr: name, bool}
    }

    fn(attr, expr)
  })
}
