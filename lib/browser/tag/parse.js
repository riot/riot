import IfExpr from './if'
import RefExpr from './ref'
import _each from './each'
import { tmpl } from 'riot-tmpl'
import {
  CONDITIONAL_DIRECTIVE,
  LOOP_DIRECTIVE,
  IS_DIRECTIVE,
  REF_DIRECTIVES
} from './../common/global-variables'
import { isBoolAttr } from './../common/util/check'
import { walkNodes, getAttr, setAttr } from './../common/util/dom'
import { each, contains } from './../common/util/misc'
import { getTag, initChildTag } from './../common/util/tags'
import Tag from './tag'

/**
 * Walk the tag DOM to detect the expressions to evaluate
 * @this Tag
 * @param   { HTMLElement } root - root tag where we will start digging the expressions
 * @param   { Array } expressions - empty array where the expressions will be added
 * @param   { Boolean } mustIncludeRoot - flag to decide whether the root must be parsed as well
 * @returns { Object } an object containing the root noode and the dom tree
 */
export function parseExpressions(root, expressions, mustIncludeRoot) {
  var tree = {parent: {children: expressions}}

  walkNodes(root, (dom, ctx) => {
    let type = dom.nodeType, parent = ctx.parent, attr, expr, tagImpl
    if (!mustIncludeRoot && dom === root) return {parent: parent}

    // text node
    if (type === 3 && dom.parentNode.tagName !== 'STYLE' && tmpl.hasExpr(dom.nodeValue))
      parent.children.push({dom: dom, expr: dom.nodeValue})

    if (type !== 1) return ctx // not an element

    var isVirtual = dom.tagName === 'VIRTUAL'

    // loop. each does it's own thing (for now)
    if (attr = getAttr(dom, LOOP_DIRECTIVE)) {
      if(isVirtual) setAttr(dom, 'loopVirtual', true) // ignore here, handled in _each
      parent.children.push(_each(dom, this, attr))
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr(dom, CONDITIONAL_DIRECTIVE)) {
      parent.children.push(Object.create(IfExpr).init(dom, this, attr))
      return false
    }

    if (expr = getAttr(dom, IS_DIRECTIVE)) {
      if (tmpl.hasExpr(expr)) {
        parent.children.push({isRtag: true, expr: expr, dom: dom, attrs: [].slice.call(dom.attributes)})
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

        var tag = new Tag({ tmpl: dom.outerHTML },
          {root: dom, parent: this},
          dom.innerHTML)
        parent.children.push(tag) // no return, anonymous tag, keep parsing
      } else {
        var conf = {root: dom, parent: this, hasImpl: true}
        parent.children.push(initChildTag(tagImpl, conf, dom.innerHTML, this))
        return false
      }
    }

    // attribute expressions
    parseAttributes.apply(this, [dom, dom.attributes, function(attr, expr) {
      if (!expr) return
      parent.children.push(expr)
    }])

    // whatever the parent is, all child elements get the same parent.
    // If this element had an if-attr, that's the parent for all child elements
    return {parent: parent}
  }, tree)
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
    var name = attr.name, bool = isBoolAttr(name), expr

    if (contains(REF_DIRECTIVES, name)) {
      expr =  Object.create(RefExpr).init(dom, this, name, attr.value)
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom: dom, expr: attr.value, attr: name, bool: bool}
    }

    fn(attr, expr)
  })
}
