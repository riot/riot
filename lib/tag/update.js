
function setEventHandler(name, handler, dom, tag, item) {

  dom[name] = function(e) {

    // cross browser event fix
    e = e || window.event
    e.which = e.which || e.charCode || e.keyCode
    e.target = e.target || e.srcElement
    e.currentTarget = dom
    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true) {
      e.preventDefault && e.preventDefault()
      e.returnValue = false
    }

    tag.update()
  }

}

// item = currently looped item
function update(expressions, tag, item) {

  each(expressions, function(expr) {
    var dom = expr.dom,
        attr_name = expr.attr,
        value = tmpl(expr.expr, tag)

    if (value == null) value = ''

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attr_name) return dom.nodeValue = value

    // remove attribute
    if (!value && expr.bool || /obj|func/.test(typeof value)) remAttr(dom, attr_name)

    // event handler
    if (typeof value == 'function') {
      setEventHandler(attr_name, value, dom, tag, item)

    // show / hide / if
    } else if (/^(show|hide|if)$/.test(attr_name)) {
      remAttr(dom, attr_name)
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