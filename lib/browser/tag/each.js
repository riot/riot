
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


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      tags = [],
      cachedItems = [],
      checksum

  expr = loopKeys(expr)

  // clean template code
  parent
    .one('premount', function() {
      if (root.stub) root = parent.root
      // remove the original DOM node
      dom.parentNode.removeChild(dom)
    })
    .on('update', function() {
      var items = tmpl(expr.val, parent),
          batch = [],
          frag = document.createDocumentFragment()

      if (!items) return

      // object loop. any changes cause full redraw
      if (!Array.isArray(items)) {
        var testsum = JSON.stringify(items)

        if (testsum == checksum) return
        checksum = testsum

        items = Object.keys(items).map(function(key) {
          return mkitem(expr, key, items[key])
        })

      }

      each(items, function(item, i) {
        // start index search from position based on the current i
        var _item = !checksum && expr.key ? mkitem(expr, item, i) : item

        if (!tags[i]) {
          // mount new
          var tag = new Tag({ tmpl: template }, {
            parent: parent,
            frag: frag,
            root: root,
            item: _item
          })

          batch.push(function() {
            tag.mount()
            tags.push(tag)
          })

          return true

        } else {
          batch.push(function() {
            tags[i].update(_item)
          })
        }

      })

      if(cachedItems.length > items.length) {
        var i =  cachedItems.length - items.length
        while (i--) {
          tags[tags.length - 1].unmount()
          tags.splice(tags.length - 1, 1)
        }
      }

      each(batch, function(action) { action() })

      root.appendChild(frag)

      cachedItems = items.slice()

    })

    rendered = items.slice()

  }).one('updated', function() {
    var keys = Object.keys(parent)// only set new values
    walk(root, function(dom) {
      setNamed(dom, parent, keys)
    })
  })

}
