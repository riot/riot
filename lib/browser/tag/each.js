
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
    els = expr.trim().slice(b0.length).match(/^\s*(\S+?)\s*(?:,\s*(\S+))?\s+in\s+(.+)$/)
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

  var tagName = getTagName(dom),
    impl = tagImpl[tagName] || { tmpl: dom.outerHTML },
    root = dom.parentNode,
    ref = document.createTextNode(''),
    child = getTag(dom),
    tags = [],
    oldItems = [],
    checksum

  root.insertBefore(ref, dom)

  expr = loopKeys(expr)

  // clean template code
  parent.one('premount', function () {
    // remove the original DOM node
    dom.parentNode.removeChild(dom)
    if (root.stub) root = parent.root

  }).on('update', function () {
    var items = tmpl(expr.val, parent),
      useRoot = SPECIAL_TAGS_REGEX.test(tagName),
      i, j, frag


    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      checksum = items ? JSON.stringify(items) : ''
      items = !items ? [] :
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        })
    }


    // unmount the old tags
    i = oldItems.length
    while (i-- && tags.length > items.length) {
      if (!~items.indexOf(oldItems[i])) {
        tags[i].unmount()
        tags.splice(i, 1)
      }
    }


    frag = document.createDocumentFragment()
    i = tags.length
    j = items.length

    for (i = 0; i < j; ++i) {
      var _item = !checksum && expr.key ? mkitem(expr, items[i], i) : items[i],
        tag = tags[i]

      if (!tag) {
        // mount new
        tag = tags[i] = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: _item
        }, dom.innerHTML)

        tag.mount()
        frag.appendChild(tag.root)
      } else
        tag.update(_item)

      tag._item = _item
      // cache the real parent tag internally
      tag._parent = parent

    }

    root.insertBefore(frag, ref)

    if (child) parent.tags[tagName] = tags

    oldItems = items.slice()

  })

}
