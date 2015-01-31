

function parse(html, tag, expressions) {

  var root = mkdom(html)

  tag.children = []

  function addExpr(dom, value, data) {
    if (value ? value.indexOf('{') >= 0 : data) {
      var expr = { dom: dom, expr: value }
      expressions.push(extend(expr, data || {}))
    }
  }

  walk(root, function(dom) {

    var type = dom.nodeType,
        value = dom.nodeValue

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') {
      addExpr(dom, value)

    // element
    } else if (type == 1) {

      // loop
      var attr = dom.getAttribute('each')
      if (attr) return loop(dom, tag, attr)

      // child tag
      var impl = tag_impl[dom.tagName.toLowerCase()]
      if (impl) return tag.children.push(new Tag(impl, { root: dom, parent: tag }))

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

    }

  })

  return root

}