
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var ret = { val: expr },
      els = expr.split(/\s+in\s+/)

  if (els[1]) {
    ret.val = expr_begin + els[1]
    els = els[0].slice(expr_begin.length).trim().split(/,\s*/)
    ret.key = els[0]
    ret.pos = els[1]
  }

  return ret
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = [],
      tags = [],
      checksum

  expr = loopKeys(expr)

  // clean template code after update (and let walk finish it's parse)
  parent.one('update', function() {
    root.removeChild(dom)

  }).one('mount', function() {
    if (root.stub) root = parent.root

  }).on('update', function() {

    var items = tmpl(expr.val, parent)
    if (!items) return

    // object loop. any changes cause full redraw
    if (!Array.isArray(items)) {
      var testsum = JSON.stringify(items)
      if (testsum == checksum) return
      checksum = testsum

      // clear old items
      tags.map(function(tag) { tag.unmount() })
      tags = rendered = []

      items = Object.keys(items).map(function(key) {
        return mkitem(expr, key, items[key])
      })

    }

    // unmount redundant
    arrDiff(rendered, items).map(function(item) {
      var pos = rendered.indexOf(item),
          tag = tags[pos]

      if (tag) {
        tag.unmount()
        rendered.splice(pos, 1)
        tags.splice(pos, 1)
      }

    })

    // mount new
    var nodes = root.childNodes,
        prev_index = [].indexOf.call(nodes, prev)

    arrDiff(items, rendered).map(function(item, i) {

      var pos = items.indexOf(item)

      if (!checksum && expr.key) item = mkitem(expr, item, pos)

      var tag = new Tag({ tmpl: template }, {
        before: nodes[prev_index + 1 + pos],
        parent: parent,
        root: root,
        loop: true,
        item: item
      })

      tags.splice(pos, 0, tag)

    })

    rendered = items.slice()

  })

}