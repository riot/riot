
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
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
    if (!hasParent(root)) root = parent.root

  }).on('update', function() {

    var items = tmpl(expr.val, parent)
    if (!items) return

    // object loop. any changes cause full redraw
    if (!Array.isArray(items)) {
      var testsum = JSON.stringify(items)
      if (testsum == checksum) return
      checksum = testsum

      // clear old items
      tags.map(function(tag) {
        tag.unmount()
      })

      tags = rendered = []

      items = Object.keys(items).map(function(key, i) {
        var obj = {}
        obj[expr.key] = key
        obj[expr.pos] = items[key]
        return obj
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
        prev_index = Array.prototype.indexOf.call(nodes, prev)

    arrDiff(items, rendered).map(function(item, i) {

      var pos = items.indexOf(item)

      if (!checksum && expr.key) {
        var obj = {}
        obj[expr.key] = item
        obj[expr.pos] = pos
        item = obj
      }

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