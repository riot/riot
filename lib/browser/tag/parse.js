import IfExpr from './if'
import RefExpr from './ref'
import _each from './each'
import { tmpl } from 'riot-tmpl'
import { RIOT_TAG_IS } from './../common/global-variables'
import { isBoolAttr } from './../common/util/check'
import { walkNodes, getAttr } from './../common/util/dom'
import { each } from './../common/util/misc'
import { getTag, initChildTag } from './../common/util/tags'

export function parseExpressions(root, tag, expressions, includeRoot) {
  var base = {parent: {children: expressions}}

  walkNodes(root, function(dom, ctx) {
    var type = dom.nodeType, parent = ctx.parent, attr, expr, childTag
    if (!includeRoot && dom === root) return {parent: parent}

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE' && tmpl.hasExpr(dom.nodeValue))
      parent.children.push({dom: dom, expr: dom.nodeValue})

    if (type != 1) return ctx // not an element

    // loop. each does it's own thing (for now)
    if (attr = getAttr(dom, 'each')) {
      parent.children.push(_each(dom, tag, attr))
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr(dom, 'if')) {
      parent.children.push(new IfExpr(dom, tag, attr))
      return false
    }

    if (expr = getAttr(dom, RIOT_TAG_IS)) {
      if (tmpl.hasExpr(expr)) {
        parent.children.push({isRtag: true, expr: expr, dom: dom})
        return false
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    var tagImpl = getTag(dom)
    if (tagImpl && (dom !== root || includeRoot)) {
      var conf = {root: dom, parent: tag, hasImpl: true}
      parent.children.push(initChildTag(tagImpl, conf, dom.innerHTML, tag))
      return false
    }

    // attribute expressions
    parseAttributes(dom, dom.attributes, tag, function(attr, expr) {
      if (!expr) return
      parent.children.push(expr)
    })

    // whatever the parent is, all child elements get the same parent.
    // If this element had an if-attr, that's the parent for all child elements
    return {parent: parent}
  }, base)
}

// Calls `fn` for every attribute on an element. If that attr has an expression,
// it is also passed to fn.
export function parseAttributes(dom, attrs, tag, fn) {
  each(attrs, function(attr) {
    var name = attr.name, bool = isBoolAttr(name), expr

    if (~['ref', 'data-ref'].indexOf(name)) {
      expr = new RefExpr(dom, name, attr.value, tag)
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom: dom, expr: attr.value, attr: attr.name, bool: bool}
    }

    fn(attr, expr)
  })
}
