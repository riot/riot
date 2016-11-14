import { isArray } from './../common/util/check'
import { remAttr, getAttr, getOuterHTML, createDOMPlaceholder, safeInsert, createFrag } from './../common/util/dom'
import { defineProperty, each, contains } from './../common/util/misc'
import { tmpl } from 'riot-tmpl'
import Tag from './tag'

import {
  T_STRING,
  T_OBJECT,
  __TAG_IMPL,
  RE_SPECIAL_TAGS
} from './../common/global-variables'

import {
  moveChildTag,
  getTag,
  getTagName,
  arrayishAdd,
  arrayishRemove,
  makeVirtual,
  moveVirtual
} from './../common/util/tags'

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
function mkitem(expr, key, val, base) {
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
function unmountRedundant(items, tags, tagName, parent) {

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
 * @this Tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(i) {
  each(Object.keys(this.tags), (tagName) => {
    var tag = this.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag.apply(t, [tagName, i])
      })
    else
      moveChildTag.apply(tag, [tagName, i])
  })
}

/**
 * Move a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to move
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function move(root, nextTag, isVirtual) {
  if (isVirtual)
    moveVirtual.apply(this, [root, nextTag])
  else
    safeInsert(root, this.root, nextTag.root)
}

/**
 * Insert and mount a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to insert
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function insert(root, nextTag, isVirtual) {
  if (isVirtual)
    makeVirtual.apply(this, [root, nextTag])
  else
    safeInsert(root, this.root, nextTag.root)
}

/**
 * Append a new tag into the DOM
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function append(root, isVirtual) {
  if (isVirtual)
    makeVirtual.call(this, root)
  else
    root.appendChild(this.root)
}

/**
 * Manage tags having the 'each'
 * @param   { HTMLElement } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
export default function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, 'each')

  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __TAG_IMPL[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = RE_SPECIAL_TAGS.test(tagName),
    root = dom.parentNode,
    ref = createDOMPlaceholder(),
    child = getTag(dom),
    ifExpr = getAttr(dom, 'if'),
    tags = [],
    oldItems = [],
    hasKeys,
    isLoop = true,
    isAnonymous = !__TAG_IMPL[tagName],
    isVirtual = dom.tagName === 'VIRTUAL'

  // parse the each expression
  expr = tmpl.loopKeys(expr)
  expr.isLoop = true

  if (ifExpr) remAttr(dom, 'if')

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)
  root.removeChild(dom)

  expr.update = function updateEach() {

    // get the new items collection
    var items = tmpl(expr.val, parent),
      parentNode,
      frag,
      placeholder


    root = ref.parentNode

    if (parentNode) {
      placeholder = createDOMPlaceholder('')
      parentNode.insertBefore(placeholder, root)
      parentNode.removeChild(root)
    } else {
      frag = createFrag()
    }

    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, items[key], key)
        }) : []
    } else {
      hasKeys = false
    }

    if (ifExpr) {
      items = items.filter(function(item, i) {
        if (expr.key) {
          return !!tmpl(ifExpr, mkitem(expr, item, i, parent))
        }
        // in case it's not a keyed loop
        // we test the validity of the if expression against
        // the item and the parent
        return !!tmpl(ifExpr, parent) || !!tmpl(ifExpr, item)
      })
    }

    // loop all the new items
    each(items, function(item, i) {
      // reorder only if the items are objects
      var
        _mustReorder = mustReorder && typeof item === T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos]

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos // by default we always try to reorder the DOM elements
      ) {

        let mustAppend = i === tags.length

        tag = new Tag(impl, {
          parent,
          isLoop,
          isAnonymous,
          root: useRoot ? root : dom.cloneNode(),
          item
        }, dom.innerHTML)

        // mount the tag
        tag.mount()

        if (mustAppend)
          append.apply(tag, [frag || root, isVirtual])
        else
          insert.apply(tag, [root, tags[i], isVirtual])

        if (!mustAppend) oldItems.splice(i, 0, item)
        tags.splice(i, 0, tag)
        if (child) arrayishAdd(parent.tags, tagName, tag, true)
        pos = i // handled here so no move
      } else tag.update(item)

      // reorder the tag if it's not located in its previous position
      if (pos !== i && _mustReorder) {
        // #closes 2040
        if (contains(items, oldItems[i])) {
          move.apply(tag, [root, tags[i], isVirtual])
        }
        // update the position attribute if it exists
        if (expr.pos) tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags.call(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)
    })

    // remove the redundant tags
    unmountRedundant(items, tags, tagName, parent)

    // clone the items array
    oldItems = items.slice()

    if (frag) {
      root.insertBefore(frag, ref)
    } else {
      parentNode.insertBefore(root, placeholder)
      parentNode.removeChild(placeholder)
    }

  }

  expr.unmount = function() {
    each(tags, function(t) { t.unmount() })
  }

  return expr
}
