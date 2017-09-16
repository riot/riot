import { isArray, isString } from './../common/util/check'
import { remAttr, getAttr, createDOMPlaceholder, safeInsert, createFrag } from './../common/util/dom'
import { each, contains, extend } from './../common/util/misc'
import { tmpl } from 'riot-tmpl'
import createTag from './tag'

import {
  T_STRING,
  T_OBJECT,
  __TAG_IMPL,
  CONDITIONAL_DIRECTIVE,
  LOOP_DIRECTIVE,
  LOOP_NO_REORDER_DIRECTIVE,
  KEY_DIRECTIVE
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
  const item = base ? Object.create(base) : {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {
  let i = tags.length
  const j = items.length

  while (i > j) {
    i--
    remove.apply(tags[i], [tags, i])
  }
}


/**
 * Remove a child tag
 * @this Tag
 * @param   { Array } tags - tags collection
 * @param   { Number } i - index of the tag to remove
 */
function remove(tags, i) {
  tags.splice(i, 1)
  this.unmount()
  arrayishRemove(this.parent, this, this.__.tagName, true)
}

/**
 * Move the nested custom tags in non custom loop tags
 * @this Tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(i) {
  each(Object.keys(this.tags), (tagName) => {
    moveChildTag.apply(this.tags[tagName], [tagName, i])
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
 * Return the value we want to use to lookup the postion of our items in the collection
 * @param   { String }  keyAttr         - lookup string or expression
 * @param   { * }       originalItem    - original item from the collection
 * @param   { Object }  keyedItem       - object created by riot via { item, i in collection }
 * @param   { Boolean } hasKeyAttrExpr  - flag to check whether the key is an expression
 * @returns { * } value that we will use to figure out the item position via collection.indexOf
 */
function getItemId(keyAttr, originalItem, keyedItem, hasKeyAttrExpr) {
  if (keyAttr) {
    return hasKeyAttrExpr ?  tmpl(keyAttr, keyedItem) :  originalItem[keyAttr]
  }

  return originalItem
}

/**
 * Manage tags having the 'each'
 * @param   { HTMLElement } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
export default function _each(dom, parent, expr) {
  const mustReorder = typeof getAttr(dom, LOOP_NO_REORDER_DIRECTIVE) !== T_STRING || remAttr(dom, LOOP_NO_REORDER_DIRECTIVE)
  const keyAttr = getAttr(dom, KEY_DIRECTIVE)
  const hasKeyAttrExpr = keyAttr ? tmpl.hasExpr(keyAttr) : false
  const tagName = getTagName(dom)
  const impl = __TAG_IMPL[tagName]
  const parentNode = dom.parentNode
  const placeholder = createDOMPlaceholder()
  const child = getTag(dom)
  const ifExpr = getAttr(dom, CONDITIONAL_DIRECTIVE)
  const tags = []
  const isLoop = true
  const innerHTML = dom.innerHTML
  const isAnonymous = !__TAG_IMPL[tagName]
  const isVirtual = dom.tagName === 'VIRTUAL'
  let oldItems = []
  let hasKeys

  // remove the each property from the original tag
  remAttr(dom, LOOP_DIRECTIVE)
  remAttr(dom, KEY_DIRECTIVE)

  // parse the each expression
  expr = tmpl.loopKeys(expr)
  expr.isLoop = true

  if (ifExpr) remAttr(dom, CONDITIONAL_DIRECTIVE)

  // insert a marked where the loop tags will be injected
  parentNode.insertBefore(placeholder, dom)
  parentNode.removeChild(dom)

  expr.update = function updateEach() {
    // get the new items collection
    expr.value = tmpl(expr.val, parent)

    let items = expr.value
    const frag = createFrag()
    const isObject = !isArray(items) && !isString(items)
    const root = placeholder.parentNode
    const tmpItems = []

    // if this DOM was removed the update here is useless
    // this condition fixes also a weird async issue on IE in our unit test
    if (!root) return

    // object loop. any changes cause full redraw
    if (isObject) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(key => mkitem(expr, items[key], key)) : []
    } else {
      hasKeys = false
    }

    if (ifExpr) {
      items = items.filter((item, i) => {
        if (expr.key && !isObject)
          return !!tmpl(ifExpr, mkitem(expr, item, i, parent))

        return !!tmpl(ifExpr, extend(Object.create(parent), item))
      })
    }

    // loop all the new items
    each(items, (_item, i) => {
      const item = !hasKeys && expr.key ? mkitem(expr, _item, i) : _item
      const itemId = getItemId(keyAttr, _item, item, hasKeyAttrExpr)
      // reorder only if the items are objects
      const doReorder = mustReorder && typeof _item === T_OBJECT && !hasKeys
      const oldPos = oldItems.indexOf(itemId)
      const isNew = oldPos === -1
      const pos = !isNew && doReorder ? oldPos : i
      // does a tag exist in this position?
      let tag = tags[pos]
      const mustAppend = i >= oldItems.length
      const mustCreate =  doReorder && isNew || !doReorder && !tag

      // new tag
      if (mustCreate) {
        tag = createTag(impl, {
          parent,
          isLoop,
          isAnonymous,
          tagName,
          root: dom.cloneNode(isAnonymous),
          item,
          index: i,
        }, innerHTML)

        // mount the tag
        tag.mount()

        if (mustAppend)
          append.apply(tag, [frag || root, isVirtual])
        else
          insert.apply(tag, [root, tags[i], isVirtual])

        if (!mustAppend) oldItems.splice(i, 0, item)
        tags.splice(i, 0, tag)
        if (child) arrayishAdd(parent.tags, tagName, tag, true)
      } else if (pos !== i && doReorder) {
        // move
        if (keyAttr || contains(items, oldItems[pos])) {
          move.apply(tag, [root, tags[i], isVirtual])
          // move the old tag instance
          tags.splice(i, 0, tags.splice(pos, 1)[0])
          // move the old item
          oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        }

        // update the position attribute if it exists
        if (expr.pos) tag[expr.pos] = i

        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags.call(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag.__.item = item
      tag.__.index = i
      tag.__.parent = parent

      tmpItems[i] = itemId

      if (!mustCreate) tag.update(item)
    })

    // remove the redundant tags
    unmountRedundant(items, tags)

    // clone the items array
    oldItems = tmpItems.slice()

    root.insertBefore(frag, placeholder)
  }

  expr.unmount = () => {
    each(tags, t => { t.unmount() })
  }

  return expr
}