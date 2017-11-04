import IfExpr from './if'
import RefExpr from './ref'
import _each from './each'
import { tmpl } from 'riot-tmpl'
import {
  CONDITIONAL_DIRECTIVE,
  LOOP_DIRECTIVE,
  IS_DIRECTIVE,
  REF_DIRECTIVES,
  YIELD_TAG
} from './../common/global-variables'
import { isBoolAttr } from './../common/util/check'
import { walkNodes, getAttr, setAttr } from './../common/util/dom'
import { each, contains } from './../common/util/misc'
import { getTag, initChildTag } from './../common/util/tags'
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
    if (attr = getAttr(dom, LOOP_DIRECTIVE)) {
      if(isVirtual) setAttr(dom, 'loopVirtual', true) // ignore here, handled in _each
      expressions.push(_each(dom, this, attr))
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr(dom, CONDITIONAL_DIRECTIVE)) {
      expressions.push(Object.create(IfExpr).init(dom, this, attr))
      return false
    }

    if (attr = getAttr(dom, IS_DIRECTIVE)) {
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
      if(getAttr(dom, 'virtualized')) {dom.parentElement.removeChild(dom) } // tag created, remove from dom
      if(!tagImpl && !getAttr(dom, 'virtualized') && !getAttr(dom, 'loopVirtual'))  // ok to create virtual tag
        tagImpl = { tmpl: dom.outerHTML }
    }

    if (tagImpl && (dom !== root || mustIncludeRoot)) {
      if(isVirtual && !getAttr(dom, IS_DIRECTIVE)) { // handled in update
        // can not remove attribute like directives
        // so flag for removal after creation to prevent maximum stack error
        setAttr(dom, 'virtualized', true)
        const tag = createTag(
          {tmpl: dom.outerHTML},
          {root: dom, parent: this},
          dom.innerHTML
        )

        expressions.push(tag) // no return, anonymous tag, keep parsing
      } else {
        expressions.push(
          initChildTag(
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
      expr =  Object.create(RefExpr).init(dom, this, name, attr.value)
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom, expr: attr.value, attr: name, bool}
    }

    fn(attr, expr)
  })
}
