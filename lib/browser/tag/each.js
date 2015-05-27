
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
      els = expr.slice(b0.length).match(/\s*(\S+)(?:,\s*(\S)+)?\s+in\s+(.+)/)
  return els ? { val: b0 + els[3], key: els[1], pos: els[2] } : { val: expr }
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = [],
      tags = [],
      checksum

  expr = loopKeys(expr)

  function add(pos, item, tag) {
    rendered.splice(pos, 0, item)
    tags.splice(pos, 0, tag)
  }

  function newItemCount(newItems, item) {
    var i, count = 0
    for (i = 0; i < newItems.length; ++i) { if (newItems[i] === item) ++count }
    for (i = 0; i < rendered.length; ++i) { if (rendered[i] === item) --count }
    return count
  }

  // clean template code
  parent.one('update', function() {
    root.removeChild(dom)

  }).one('premount', function() {
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
      each(tags, function(tag) { tag.unmount() })
      rendered = []
      tags = []

      items = Object.keys(items).map(function(key) {
        return mkitem(expr, key, items[key])
      })

    }

    // unmount redundant
    each(rendered, function(item) {
      if (item instanceof Object) {
        // skip existing items
        if (items.indexOf(item) > -1) {
          return
        }
      } else {
        // find all non-objects
        // if more or equal amount, no need to remove
        if (newItemCount(items, item) >= 0) {
          return
        }
      }
      var pos = rendered.indexOf(item),
          tag = tags[pos]

      if (tag) {
        tag.unmount()
        rendered.splice(pos, 1)
        tags.splice(pos, 1)
        // to let "each" know that this item is removed
        return false
      }

    })

    // mount new / reorder
    var prevBase = [].indexOf.call(root.childNodes, prev) + 1
    each(items, function(item, pos) {

      // start index search from position based on the current i
      var oldPos = 0
      if (!(item instanceof Object) && newItemCount(items, item) > 0) {
        // find all non-objects
        // if more, should mount one new
        oldPos = -1
      }
      if (!oldPos && (oldPos = rendered.indexOf(item, pos)) < 0) {
        // if not found, search backwards from current i position
        oldPos = rendered.lastIndexOf(item, pos)
      }

      // mount new
      var nodes = root.childNodes
      if (oldPos < 0) {
        var _item = (!checksum && expr.key) ? mkitem(expr, item, pos) : item

        var tag = new Tag({ tmpl: template }, {
          before: nodes[prevBase + pos],
          parent: parent,
          root: root,
          item: _item
        })

        tag.mount()

        add(pos, item, tag)
        return true
      }

      // change pos value
      if (expr.pos && tags[oldPos][expr.pos] != pos) {
        tags[oldPos].one('update', function(item) {
          item[expr.pos] = pos
        })
        tags[oldPos].update()
      }

      // reorder
      if (pos != oldPos) {
        root.insertBefore(nodes[prevBase + oldPos], nodes[prevBase + (pos > oldPos ? pos + 1 : pos)])
        return add(pos, rendered.splice(oldPos, 1)[0], tags.splice(oldPos, 1)[0])
      }

    })

    rendered = items.slice()

  }).one('updated', function() {
    walk(root, function(dom) {
      each(dom.attributes, function(attr) {
        if (attr.name === 'id' || attr.name === 'name') parent[attr.value] = dom
      })
    })
  })

}
