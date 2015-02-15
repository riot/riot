var is_node = !this.top

if (is_node) {
  var util = require('./util')
  var each = util.each
  var remAttr = util.remAttr
  module.exports = update
}

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

function insertTo(root, node, before) {
  if (root) {
    root.insertBefore(before, node)
    root.removeChild(node)
  }
}

// item = currently looped item
function update(expressions, tag, item, doc) {

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

    // if- conditional
    } else if (attr_name == 'if') {
      remAttr(dom, attr_name)

      var stub = expr.stub

      // add to DOM
      if (value) {
        stub && insertTo(stub.parentNode, stub, dom)

      // remove from DOM
      } else {
        stub = expr.stub = stub || (doc || document).createTextNode('')
        insertTo(dom.parentNode, dom, stub)
      }

    // show / hide
    } else if (/^(show|hide)$/.test(attr_name)) {
      remAttr(dom, attr_name)
      if (attr_name == 'hide') value = !value
      if (is_node) {
        dom.attributes.style = { display: value ? '' : 'none' }
      } else {
        dom.style.display = value ? '' : 'none'
      }

    // field value
    } else if (attr_name == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (attr_name == 'data-src') {
      value ? dom.setAttribute('src', value) : remAttr(dom, 'src')

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
