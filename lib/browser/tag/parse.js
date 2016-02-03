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

    // attribute expressions
    var allAttrs = [], nameHasExpression = false
    each(dom.attributes, function(attr) {
      var name = attr.name, bool = name.split('__')[1]
      var hasExp = tmpl.hasExpr(attr.value)
      if (name === 'if') return // already handled

      // dirty dirty hack until we can clean up named tags
      if (name === 'name' && hasExp) nameHasExpression = true

      expr = {dom: dom, expr: attr.value, attr: bool || attr.name, bool: bool}
      allAttrs.push(expr) // stores all attributes, even without expressions

      if (!hasExp) return // no expressions here
      parent.children.push(expr)
      if (bool) { remAttr(dom, name); return false }
    })

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    var tagImpl = getTag(dom)
    if (tagImpl && dom !== root) {
      attr = {dom: dom, impl: tagImpl,
        ownAttrs: allAttrs, nameHasExpression: nameHasExpression}
      if (dom.tagName == 'VIRTUAL') attr.isVirtual = true; else attr.isTag = true

      parent.children.push(attr)
      return false
    }

    // whatever the parent is, all child elements get the same parent.
    // If this element had an if-attr, that's the parent for all child elements
    return {parent: parent}
  }, base)
}
