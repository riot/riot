import { isArray } from './../common/util/check'
import { remAttr, getAttr, getOuterHTML } from './../common/util/dom'
import { defineProperty, each } from './../common/util/misc'
import { tmpl } from 'riot-tmpl'
import Tag from './tag'

import {
  T_STRING,
  T_OBJECT,
  __TAG_IMPL,
  RE_SPECIAL_TAGS,
  FIREFOX
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

const MOVE = 'MOVE'
const INSERT = 'INSERT'
const UPDATE = 'UPDATE'

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
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(child, i) {
  each(Object.keys(child.tags), function(tagName) {
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
 * Move a child tag
 * @param { Object } patch - all the data needed to handle the move
 */
function move(patch) {
  var { i, tags, isVirtual, tag, root, prevBase } = patch

  // update the DOM
  if (isVirtual)
    moveVirtual(tag, root, tags[i])
  else if (tags[i].root.parentNode)
    root.insertBefore(tag.root, root.childNodes[prevBase + i])
}


/**
 * Insert and mount a child tag
 * @param { Object } patch - all the data needed to handle the insertion
 */
function insert(patch) {
  var { i, tags, isVirtual, tag, frag, root, mustAppend, prevBase } = patch,
    dom

  // mount the tag
  tag.mount()
  dom = tag.root

  if (isVirtual)
    makeVirtual(tag, frag, mustAppend ? null : tags[i])
  else
    if (mustAppend)
      frag.appendChild(dom)
    else
      root.insertBefore(dom, root.childNodes[prevBase + i])
}

/**
 * Update option nodes that seem to be buggy on Firefox see also #1374
 * @param   { Object } root - <select> tag
 */
function updateSelect(root) {
  for (var n = 0; n < root.length; n++) {
    if (root[n].__riot1374) {
      root.selectedIndex = n  // clear other options
      delete root[n].__riot1374
      break
    }
  }
}

/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
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
    prevBase = [].indexOf.call(root.childNodes, dom.previousSibling) + 1,
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
      patches = [],
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
    each(items, function(item, i) {
      // reorder only if the items are objects
      var
        _mustReorder = mustReorder && typeof item == T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos]

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
      ) {

        tag = new Tag(impl, {
          parent,
          isLoop: true,
          anonymous: !__TAG_IMPL[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item
        }, dom.innerHTML)

        patches.push({
          type: INSERT,
          mustAppend: i == tags.length,
          root, i, tags, isVirtual, tag, frag, prevBase
        })

        if (i != tags.length) oldItems.splice(i, 0, item)
        tags.splice(i, 0, tag)
        if (child) arrayishAdd(parent.tags, tagName, tag, true)
        pos = i // handled here so no move
      } else patches.push({ tag, item, type: UPDATE })

      // reorder the tag if it's not located in its previous position
      if (pos !== i && _mustReorder) {
        patches.push({
          type: MOVE,
          i, tags, isVirtual, tag, dom, frag, root, prevBase
        })

        // update the position attribute if it exists
        if (expr.pos) tag[expr.pos] = i
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

    // update the DOM
    each(patches, (patch) => {
      switch (patch.type) {
      case MOVE:
        move(patch)
        break
      case INSERT:
        insert(patch)
        break
      default:
        patch.tag.update(patch.item)
      }
    })

    // remove the redundant tags
    unmountRedundant(items, tags, tagName, parent)

    // insert the new nodes
    if (frag.childNodes) root.insertBefore(frag, ref)

    // #1374 FireFox bug in <option selected={expression}>
    if (isOption && FIREFOX && !root.multiple) updateSelect(root)

    // clone the items array
    oldItems = items.slice()
  }

  expr.unmount = function() {
    each(tags, function(t) { t.unmount() })
  }

  return expr
}
