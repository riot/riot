

function parse(html, tag, expressions) {

  var root = mkdom(html)

  tag.children = []

  function addExpr(dom, value, data) {
    if (riot._tmpl(value) || data) {
      var expr = { dom: dom, expr: value }
      expressions.push(extend(expr, data || {}))
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
    if (attr) {
      loop(dom, tag, attr)
      return false
    }

    // child tag
    var impl = tag_impl[dom.tagName.toLowerCase()]
    if (impl) {
      tag.children.push(new Tag(impl, { root: dom, parent: tag }))
      return false
    }

    // attributes
    each(dom.attributes, function(attr) {
      var name = attr.name,
          value = attr.value

      // named elements
      if (/^(name|id)$/.test(name)) tag[value] = dom

      // expressions
      var bool = name.split('__')[1]
      addExpr(dom, value, { attr: bool || name, bool: bool })

      if (bool) {
        remAttr(dom, name)
        return false
      }

    })

  })

  return root

}