
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
      els = expr.slice(b0.length).match(/\s*(\S+?)\s*(?:,\s*(\S)+)?\s+in\s+(.+)/)
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
      var items = tmpl(expr.val, parent),
          frag = document.createDocumentFragment(),
          i, length

      // object loop. any changes cause full redraw
      if (!Array.isArray(items)) {

        if (!items) items = []

        var oldsum = checksum
        if ((checksum = JSON.stringify(items)) === oldsum) return

        items = Object.keys(items).map(function(key) {
          return mkitem(expr, key, items[key])
        })
      }
      length = items.length

      // unmount leftover items
      i = tags.length
      while (i > length) tags[--i].unmount()
      tags.length = length

      for (i = 0; i < length; ++i) {
        // start index search from position based on the current i
        var _item = !checksum && expr.key ? mkitem(expr, items[i], i) : items[i]

        if (!tags[i]) {
          // mount new
          (tags[i] = new Tag({ tmpl: template }, {
            parent: parent,
            frag: frag,
            root: root,
            item: _item
            })
          ).mount()
        }

        tags[i].update(_item)
      }

      root.insertBefore(frag, placeholder)

    }).one('updated', function() {
      var keys = Object.keys(parent)// only set new values
      walk(root, function(dom) {
        setNamed(dom, parent, keys)
      })
    })

    rendered = items.slice()

  }).one('updated', function() {
    var keys = Object.keys(parent)// only set new values
    walk(root, function(dom) {
      setNamed(dom, parent, keys)
    })
  })

}
