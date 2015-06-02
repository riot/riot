
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
      els = expr.slice(b0.length).match(/\s*(\S+)\s*(?:,\s*(\S)+)?\s+in\s+(.+)/)
  return els ? { key: els[1], pos: els[2], val: b0 + els[3] } : { val: expr }
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
      root = dom.parentNode,
      placeholder = document.createComment('riot placeholder'),
      tags = [],
      cachedItems = 0,
      checksum

  root.insertBefore(placeholder, dom)

  expr = loopKeys(expr)

  // clean template code
  parent
    .one('premount', function() {
      if (root.stub) root = parent.root
      // remove the original DOM node
      dom.parentNode.removeChild(dom)
    })
    .on('update', function() {
      var items = tmpl(expr.val, parent)

      if (!items) items = []

      // object loop. any changes cause full redraw
      if (!Array.isArray(items)) {
        var oldsum = checksum
        if ((checksum = JSON.stringify(items)) === oldsum) return

        items = Object.keys(items).map(function(key) {
          return mkitem(expr, key, items[key])
        })
      }

      var length = items.length,
          batch = new Array(length),
          frag = document.createDocumentFragment(),
          i

      for (i = 0; i < length; ++i) {
        // start index search from position based on the current i
        var _item = !checksum && expr.key ? mkitem(expr, items[i], i) : items[i]

        if (tags[i])
          batch[i] = _item
        else
          tags.push(new Tag({ tmpl: template }, {
            parent: parent,
            frag: frag,
            root: root,
            item: _item
          }))
      }

      while (cachedItems > length) {
        tags[--cachedItems].unmount()
      }
      tags.length = cachedItems = length

      for (i = 0; i < length; ++i) {
        if (!batch[i]) tags[i].mount()
        tags[i].update(batch[i])
      }

      root.insertBefore(frag, placeholder)

    }).one('updated', function() {
      var keys = Object.keys(parent)// only set new values
      walk(root, function(dom) {
        setNamed(dom, parent, keys)
      })
    })

}
