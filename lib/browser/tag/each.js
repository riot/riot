
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
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
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
 * Unmount the redundant tags
 * @param   { Array } oldItems - array containing the old items already looped
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(oldItems, items, tags) {

  var i = oldItems.length

  while (i--) {
    if (!contains(items, oldItems[i])) {
      var t = tags[i]
      oldItems.splice(i, 1)
      tags.splice(i, 1)
      t.unmount()
    }
  }
}

/**
 * Move the nested custom tags in non custom loop tags
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(child, i) {
  for (var tagName in child.tags) {
    var tag = child.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag(t, tagName, i)
      })
    else
      moveChildTag(tag, tagName, i)
  }
}

/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 */
function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, 'each')

  var tagName = getTagName(dom),
    impl = tagImpl[tagName] || { tmpl: dom.outerHTML },
    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
    root = dom.parentNode,
    mustReorder = getAttr(dom, 'reorder') == 'true',
    ref = document.createTextNode(''),
    child = getTag(dom),
    tags = [],
    oldItems = [],
    checksum

  // remove the reorder attribute
  if (mustReorder)
    remAttr(dom, 'reorder')

  // parse the each expression
  expr = loopKeys(expr)

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)

  // clean template code
  parent.one('premount', function () {

    // remove the original DOM node
    dom.parentNode.removeChild(dom)
    if (root.stub) root = parent.root

  }).on('update', function () {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      // create a fragment to hold the new DOM nodes to inject in the parent tag
      frag = document.createDocumentFragment()

    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      checksum = items ? JSON.stringify(items) : ''
      items = !items ? [] :
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        })
    }

    // remove the redundant tags
    unmountRedundant(oldItems, items, tags)

    // loop all the new items
    each(items, function(item, i) {

      var oldPos = oldItems.indexOf(item),
        pos = ~oldPos && mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos]

      item = !checksum && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (!~oldPos || !tag) {
        tag = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: item
        }, dom.innerHTML)

        tag.mount()
        // this tag must be appended
        if (i == tags.length) {
          frag.appendChild(tag.root)
        }
        // this tag must be insert
        else {
          root.insertBefore(tag.root, tags[i].root)
          oldItems.splice(i, 0, item)
        }


        tags.splice(i, 0, tag)
        pos = i // handled here so no move
      } else tag.update(item)

      // reorder the tag if it's not located in its previous position
      if (pos !== i && mustReorder) {
        // update the DOM
        root.insertBefore(tag.root, tags[i].root)
        // update the position attribute if it exists
        if (expr.pos)
          tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child) moveNestedTags(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)

    })

    // insert the new nodes
    root.insertBefore(frag, ref)

    // set the 'tags' property of the parent tag
    // if child is 'undefined' it means that we don't need to set this property
    // for example:
    // we don't need store the `myTag.tags['div']` property if we are looping a div tag
    // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
    if (child) parent.tags[tagName] = tags

    // clone the items array
    oldItems = items.slice()

  })

}
