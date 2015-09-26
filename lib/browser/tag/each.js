
/**
 * Parse the each expression to detect how to map the collection data to the children tags
 * @param   { String } expr - string passed in the each attribute
 * @returns { Object } object needed to check how the items in the collection
 * should be mapped to the children tags
 *
 * { key, i in items} -> { key, pos, val }
 *
 */
function loopKeys(expr) {
  var b0 = brackets(0),
    els = expr.trim().slice(b0.length).match(/^\s*(\S+?)\s*(?:,\s*(\S+))?\s+in\s+(.+)$/)
  return els ? { key: els[1], pos: els[2], val: b0 + els[3] } : { val: expr }
}

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { *  } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables "key" and "val" are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

/**
 * Unmount the reduntant tags
 * @param   { Array } oldItems - array containing the old items already looped
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(oldItems, items, tags) {

  var i = oldItems.length

  while (i--) {
    if (!contains(items, oldItems[i])) {
      var t = tags[i]
      tags.splice(i, 1)
      t.unmount()
    }
  }
}

/**
 * Manage tags having the "each"
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the "each" attribute
 */
function _each(dom, parent, expr) {

  // remove the each property from the original tag
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

    unmountRedundant(oldItems, items, tags)

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
      } else tag.update(_item)


      tag._item = _item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)

    }

    root.insertBefore(frag, ref)

    if (child) parent.tags[tagName] = tags

    oldItems = items.slice()

  })

}
