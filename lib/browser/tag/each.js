
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
    .one('update', function() {
      dom.parentNode.removeChild(dom)
    })
    .one('premount', function() {
      if (root.stub) root = parent.root
    })
    .on('update', function() {
      var items = tmpl(expr.val, parent),
          batch = []

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

        if (!tags[i]) {

          var tag = new Tag({ tmpl: template }, {
            parent: parent,
            placeholder: root,
            root: dom,
            data: item
          })

          batch.push(function() {
            tag.mount()
          })

          tags.push(tag)

          return true
        } else {
          batch.push(function() {
            tags[i].update(item)
          })
        }

      })

      if(cachedItems.length != items.length) {
        var i = cachedItems.length
        while (i--) {
          tags[i].unmount()
        }
      }

      cachedItems = items

      each(batch, function(action) { action() })


    })
    .one('updated', function() {
      walk(root, function(dom) {
        each(dom.attributes, function(attr) {
          if (/^(name|id)$/.test(attr.name)) parent[attr.value] = dom
        })
      })
    })

}
