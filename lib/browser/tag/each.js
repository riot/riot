
/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @param   { Object } base - prototype object for the new item
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
export function mkitem(expr, key, val, base) {
  var item = base ? Object.create(base) : {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 * @param   { String } tagName - key used to identify the type of tag
 * @param   { Object } parent - parent tag to remove the child from
 */
export function unmountRedundant(items, tags, tagName, parent) {

  var i = tags.length,
    j = items.length,
    t

  while (i > j) {
    t = tags[--i]
    tags.splice(i, 1)
    t.unmount()
    arrayishRemove(parent.tags, tagName, t, true)
  }
}

/**
 * Move the nested custom tags in non custom loop tags
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
export function moveNestedTags(child, i) {
  Object.keys(child.tags).forEach(function(tagName) {
    var tag = child.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag(t, tagName, i)
      })
    else
      moveChildTag(tag, tagName, i)
  })
}

/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
export function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, 'each')

  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __tagImpl[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
    root = dom.parentNode,
    ref = document.createTextNode(''),
    child = getTag(dom),
    isOption = tagName.toLowerCase() === 'option', // the option tags must be treated differently
    tags = [],
    oldItems = [],
    hasKeys,
    isVirtual = dom.tagName == 'VIRTUAL'

  // parse the each expression
  expr = tmpl.loopKeys(expr)
  expr.isLoop = true

  var ifExpr = getAttr(dom, 'if')
  if (ifExpr) remAttr(dom, 'if')

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)
  root.removeChild(dom)

  expr.update = function updateEach() {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      // create a fragment to hold the new DOM nodes to inject in the parent tag
      frag = document.createDocumentFragment()
    root = ref.parentNode

    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        }) : []
    }

    if (ifExpr) {
      items = items.filter(function(item, i) {
        var context = mkitem(expr, item, i, parent)
        return !!tmpl(ifExpr, context)
      })
    }

    // loop all the new items
    items.forEach(function(item, i) {
      // reorder only if the items are objects
      var _mustReorder = mustReorder && item instanceof Object && !hasKeys,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos], domToInsert

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
      ) {

        tag = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!__tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: item
        }, dom.innerHTML)

        tag.mount()
        domToInsert = tag.root
        // this tag must be appended
        if (i == tags.length) {
          if (isVirtual)
            makeVirtual(tag, frag)
          else frag.appendChild(domToInsert)
        }
        // this tag must be insert
        else {
          if (isVirtual)
            makeVirtual(tag, root, tags[i])
          else root.insertBefore(domToInsert, tags[i].root)
          oldItems.splice(i, 0, item)
        }

        tags.splice(i, 0, tag)
        if (child) arrayishAdd(parent.tags, tagName, tag, true)
        pos = i // handled here so no move
      } else tag.update(item)

      // reorder the tag if it's not located in its previous position
      if (pos !== i && _mustReorder) {
        // update the DOM
        if (isVirtual)
          moveVirtual(tag, root, tags[i])
        else root.insertBefore(tag.root, tags[i].root)
        // update the position attribute if it exists
        if (expr.pos)
          tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)

    })

    // remove the redundant tags
    unmountRedundant(items, tags, tagName, parent)

    // insert the new nodes
    if (isOption) {
      root.appendChild(frag)

      // #1374 FireFox bug in <option selected={expression}>
      if (FIREFOX && !root.multiple) {
        for (var n = 0; n < root.length; n++) {
          if (root[n].__riot1374) {
            root.selectedIndex = n  // clear other options
            delete root[n].__riot1374
            break
          }
        }
      }
    }
    else root.insertBefore(frag, ref)

    // clone the items array
    oldItems = items.slice()
  }

  expr.unmount = function() {
    each(tags, function(t) { t.unmount() })
  }

  return expr
}
