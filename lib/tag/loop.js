
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

function loop(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = [],
      tags = [],
      checksum

  function startPos() {
    return Array.prototype.indexOf.call(root.childNodes, prev) + 1
  }

  expr = loopKeys(expr)

  // clean template code after update (and let walk finish it's parse)
  parent.one('update', function() {
    root.removeChild(dom)

  }).one('mount', function() {
    if (!root.parentNode) root = parent.root

  }).on('updated', function() {

    var items = riot._tmpl(expr.val, parent)
    if (!items) return

    // object loop
    if (!Array.isArray(items)) {
      var testsum = JSON.stringify(items)
      if (testsum == checksum) return
      checksum = testsum

      items = Object.keys(items).map(function(key, i) {
        var obj = {}
        obj[expr.key] = key
        obj[expr.pos] = items[key]
        return obj
      })

    }

    // remove redundant
    arrDiff(rendered, items).map(function(item) {
      var pos = rendered.indexOf(item)
      root.removeChild(root.childNodes[startPos() + pos])

      var tag = tags[pos]
      tag.unmount()

      rendered.splice(pos, 1)
    })

    // add new
    arrDiff(items, rendered).map(function(item, i) {
      var pos = items.indexOf(item)

      if (!checksum && expr.key) {
        var obj = {}
        obj[expr.key] = item
        obj[expr.pos] = pos
        item = obj
      }

      var tag = new Tag({ tmpl: template }, {
        before: root.childNodes[startPos() + pos],
        parent: parent,
        root: root,
        loop: true,
        item: item
      })

      parent.children.push(tag)
      tags[pos] = tag

    })

    rendered = items.slice()

  })

}