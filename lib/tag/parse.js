var is_node = !this.top

if (is_node) {
  var util = require('./util')
  var walk = util.walk
  var each = util.each
  var extend = util.extend

  module.exports = {
    parseNamedElements: parseNamedElements,
    parseLayout: parseLayout
  }
}

function parseNamedElements(root, tag, expressions) {
  walk(root, function(dom) {
    if (dom.nodeType != 1) return

    each(dom.attributes, function(attr) {
      if (/^(name|id)$/.test(attr.name)) tag[attr.value] = dom
    })
  })
}

function parseLayout(root, tag, expressions, settings, _tag_impl, _expr_begin) {

  function addExpr(dom, val, extra) {
    if (val.indexOf(expr_begin) >= 0) {
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

    // attributes
    each(dom.attributes, function(attr) {
      var name = attr.name,
          value = attr.value

      // expressions
      var bool = name.split('__')[1]
      addExpr(dom, value, { attr: bool || name, bool: bool })

      if (bool) {
        remAttr(dom, name)
        return false
      }

    })

    if (is_node) {
      Tag = require('./tag')
    }

    tag_impl = _tag_impl || tag_impl
    expr_begin = _expr_begin || expr_begin

    // child tag
    var impl = tag_impl[dom.tagName.toLowerCase()]
    if (impl) impl = new Tag(impl, { root: dom, parent: tag }, settings, tag_impl, expr_begin)

  })

}
