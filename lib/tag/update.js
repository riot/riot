

function update(expressions, instance) {

  each(expressions, function(expr) {
    var dom = expr.dom,
        attr_name = expr.attr,
        value = riot._tmpl(expr.expr, instance)

    if (value == null) value = ''

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attr_name) return dom.nodeValue = value

    // attribute
    if (!value && expr.bool || /obj|func/.test(typeof value)) remAttr(attr_name)

    // event handler
    if (typeof value == 'function') {

    // show / hide / if
    } else if (/^(show|hide|if)$/.test(attr_name)) {
      remAttr(attr_name)
      if (attr_name == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // normal attribute
    } else {
      if (expr.bool) {
        dom[attr_name] = value
        if (!value) return
        value = attr_name
      }

      dom.setAttribute(attr_name, value)
    }

  })

}