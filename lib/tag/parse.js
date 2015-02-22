
function parseNamedElements(root, tag, expressions) {
  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      each(dom.attributes, function(attr) {
        if (/^(name|id)$/.test(attr.name)) tag[attr.value] = dom
      })
    }
  })
}

function parseLayout(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (val.indexOf(brackets(0)) >= 0) {
      var expr = { dom: dom, expr: val }
      expressions.push(extend(expr, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    var attr = dom.getAttribute('each')
    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
          bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // custom child tag
    var impl = tag_impl[dom.tagName.toLowerCase()]

    if (impl) {
      impl = new Tag(impl, { root: dom, parent: tag })
      return false
    }

  })
}
