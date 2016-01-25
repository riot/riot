function parseExpressions(root, tag, expressions) {
  var base = {parent: {children: expressions}}

  walk(root, function(dom, ctx) {
    var type = dom.nodeType, parent = ctx.parent, attr, expr

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
    if (expr = getAttr(dom, 'if')) {
      remAttr(dom, 'if')
      attr = {isIf: true, expr: expr, dom: dom, children: []}
      parent.children.push(attr)
      parent = attr
    }

    if (expr = getNamedKey(dom)) {
      parent.children.push({isNamed: true, dom: dom, expr: expr})
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    var tagImpl = getTag(dom)
    if (tagImpl && dom !== root) {
      parent.children.push({isTag: true, dom: dom, impl: tagImpl})
      return false
    }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name, bool = name.split('__')[1]
      if (!tmpl.hasExpr(attr.value)) return // no expressions here

      expr = {dom: dom, expr: attr.value, attr: bool || attr.name, bool: bool}
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
    // whatever the parent is, all child elements get the same parent.
    // If this element had an if-attr, that's the parent for all child elements
    return {parent: parent}
  }, base)
}
