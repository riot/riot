
// { key, i in items} -> { key, i, items }
function parseKeys(expr) {
  var ret = { val: expr },
      els = expr.split(/\s+in\s+/)

  if (els[1]) {
    ret.val = '{ ' + els[1]
    els = els[0].slice(1).trim().split(/,\s*/)
    ret.key = els[0]
    ret.pos = els[1]
  }
  return ret
}

function loop(dom, parent, expr) {

  remAttr(dom, 'each')

  function startPos() {
    return Array.prototype.indexOf.call(root.childNodes, prev) + 1
  }

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = []

  // clean template code
  root.removeChild(dom)

  expr = parseKeys(expr)

  parent.on('update', function() {

    var items = riot._tmpl(expr.val, parent)

    // remove redundant
    arrDiff(rendered, items).map(function(item) {
      var pos = rendered.indexOf(item)
      root.removeChild(root.childNodes[startPos() + pos])
      rendered.splice(pos, 1)
    })

    // add new
    arrDiff(items, rendered).map(function(item, i) {
      var pos = items.indexOf(item)

      if (expr.key) {
        var obj = {}
        obj[expr.key] = item
        obj[expr.pos] = pos
        item = obj
      }

      var tag = new Tag({ tmpl: template }, {
        before: root.childNodes[startPos() + pos],
        parent: parent,
        root: root,
        item: item
      })

    })

    // assign rendered
    rendered = items.slice()

  })

}