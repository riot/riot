
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var ret = { val: expr },
      els = expr.split(/\s+in\s+/)

  if (els[1]) {
    ret.val = brackets(0) + els[1]
    els = els[0].slice(brackets(0).length).trim().split(/,\s*/)
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

    // mount new / reorder
    var nodes = root.childNodes,
        prev_index = [].indexOf.call(nodes, prev)

    items.forEach(function (item, i) {
      // start index search from position based on the current i:
      var pos = items.indexOf(item, i),
          oldPos = rendered.indexOf(item, i)

      // if not found, search backwards from current i position:
      !~pos && (pos = items.lastIndexOf(item, i))
      !~oldPos && (oldPos = rendered.lastIndexOf(item, i))

      if (!~oldPos) {
        // mount new
        if (!checksum && expr.key) item = mkitem(expr, item, pos)

        var tag = new Tag({ tmpl: template }, {
          before: nodes[prev_index + 1 + pos],
          parent: parent,
          root: root,
          loop: true,
          item: item
        })
        tags.splice(pos, 0, tag)
        rendered.splice(pos, 0, item)
        return
      }

      // Change pos value if changed
      if (expr.pos && tags[oldPos][expr.pos] !== pos) {
        tags[oldPos].one('update', function (item) {
          item[expr.pos] = pos
        })
        tags[oldPos].update()
      }
      if (pos !== oldPos) {
        // reorder
        root.insertBefore(nodes[prev_index + oldPos + 1], nodes[prev_index + pos + 1])
        rendered.splice(pos, 0, rendered.splice(oldPos, 1)[0])
        tags.splice(pos, 0, tags.splice(oldPos, 1)[0])
        return
      }
    })
    rendered = items.slice()

  })

}
