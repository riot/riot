import { isArray, isString } from './../common/util/check'
import { remAttr, getAttr, createDOMPlaceholder, safeInsert, createFrag } from './../common/util/dom'
import { each, contains, extend } from './../common/util/misc'
import { tmpl } from 'riot-tmpl'
import Tag from './tag'

import {
  T_STRING,
  T_OBJECT,
  __TAG_IMPL,
  CONDITIONAL_DIRECTIVE,
  LOOP_DIRECTIVE,
  LOOP_NO_REORDER_DIRECTIVE
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
 */
function unmountRedundant(items, tags) {
  var i = tags.length,
    j = items.length

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
 * Manage tags having the 'each'
 * @param   { HTMLElement } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
export default function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, LOOP_DIRECTIVE)

  var mustReorder = typeof getAttr(dom, LOOP_NO_REORDER_DIRECTIVE) !== T_STRING || remAttr(dom, LOOP_NO_REORDER_DIRECTIVE),
    tagName = getTagName(dom),
    impl = __TAG_IMPL[tagName],
    parentNode = dom.parentNode,
    placeholder = createDOMPlaceholder(),
    child = getTag(dom),
    ifExpr = getAttr(dom, CONDITIONAL_DIRECTIVE),
    tags = [],
    oldItems = [],
    hasKeys,
    isLoop = true,
    isAnonymous = !__TAG_IMPL[tagName],
    isVirtual = dom.tagName === 'VIRTUAL'

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

    var frag = createFrag(),
      items = expr.value,
      isObject = !isArray(items) && !isString(items),
      root = placeholder.parentNode

    // object loop. any changes cause full redraw
    if (isObject) {
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
        if (expr.key && !isObject)
          return !!tmpl(ifExpr, mkitem(expr, item, i, parent))

        return !!tmpl(ifExpr, extend(Object.create(parent), item))
      })
    }

    // loop all the new items
    each(items, function(item, i) {
      // reorder only if the items are objects
      var
        doReorder = mustReorder && typeof item === T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        isNew = oldPos === -1,
        pos = !isNew && doReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos],
        mustAppend = i >= oldItems.length,
        mustCreate =  doReorder && isNew || !doReorder && !tag

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (mustCreate) {
        tag = new Tag(impl, {
          parent,
          isLoop,
          isAnonymous,
          tagName,
          root: dom.cloneNode(isAnonymous),
          item,
          index: i,
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
      } else if (pos !== i && doReorder) {
        // move
        if (contains(items, oldItems[pos])) {
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

      if (!mustCreate) tag.update(item)
    })

    // remove the redundant tags
    unmountRedundant(items, tags)

    // clone the items array
    oldItems = items.slice()

    root.insertBefore(frag, placeholder)
  }

  expr.unmount = function() {
    each(tags, function(t) { t.unmount() })
  }

  return expr
}