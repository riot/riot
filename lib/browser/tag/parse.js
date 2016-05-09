import IfExpr from './if'
import NamedExpr from './named'

export default function parseExpressions(root, tag, expressions, includeRoot) {
  var base = {parent: {children: expressions}}

  walk(root, function(dom, ctx) {
    var type = dom.nodeType, parent = ctx.parent, attr, expr, childTag

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

    // attribute expressions
    var allAttrs = [], nameExps = []
    each(dom.attributes, function(attr) {
      var name = attr.name, bool = BOOL_ATTRS.test(name)
      var hasExp = tmpl.hasExpr(attr.value)

      if (name === 'name' || name === 'id') {
        expr = new NamedExpr(dom, name, attr.value, tag)
        parent.children.push(expr)
        nameExps.push(expr)
        allAttrs.push(expr)
        return
      }

      expr = {dom: dom, expr: attr.value, attr: attr.name, bool: bool}
      allAttrs.push(expr) // stores all attributes, even without expressions

      if (!hasExp) return // no expressions here
      parent.children.push(expr)
      if (bool) { remAttr(dom, name); return false }
    })

    if (expr = getAttr(dom, RIOT_TAG)) {
      if (tmpl.hasExpr(expr)) {
        attr = {isRtag: true, expr: expr, dom: dom, children: []}
        parent.children.push(attr)
        parent = attr
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    var tagImpl = getTag(dom)
    if (tagImpl && (dom !== root || includeRoot)) {
      var conf = {root: dom, parent: tag, hasImpl: true, ownAttrs: allAttrs}
      childTag = initChildTag(tagImpl, conf, dom.innerHTML, tag)

      parent.children.push(childTag)
      each(nameExps, function(ex) { ex.tag = childTag })
      return false
    }

    // whatever the parent is, all child elements get the same parent.
    // If this element had an if-attr, that's the parent for all child elements
    return {parent: parent}
  }, base)
}
