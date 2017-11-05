import createTag from './../../tag/tag'
import { getAttr, createDOMPlaceholder, createFrag } from './dom'
import { contains, each, defineProperty, extend } from './misc'
import { isArray, isUndefined } from './check'
import { tmpl } from 'riot-tmpl'

import {
  __TAG_IMPL,
  __TAGS_CACHE,
  IS_DIRECTIVE
} from './../global-variables'

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
export function getTag(dom) {
  return dom.tagName && __TAG_IMPL[getAttr(dom, IS_DIRECTIVE) ||
    getAttr(dom, IS_DIRECTIVE) || dom.tagName.toLowerCase()]
}

/**
 * Move the position of a custom tag in its parent tag
 * @this Tag
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
export function moveChildTag(tagName, newPos) {
  const parent = this.parent
  let tags
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0])
  else arrayishAdd(parent.tags, tagName, this)
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
export function initChildTag(child, opts, innerHTML, parent) {
  const tag = createTag(child, opts, innerHTML)
  const tagName = opts.tagName || getTagName(opts.root, true)
  const ptag = getImmediateCustomParentTag(parent)
  // fix for the parent attribute in the looped elements
  defineProperty(tag, 'parent', ptag)
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag.__.parent = parent

  // add this tag to the custom parent tag
  arrayishAdd(ptag.tags, tagName, tag)

  // and also to the real parent tag
  if (ptag !== parent)
    arrayishAdd(parent.tags, tagName, tag)

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
export function getImmediateCustomParentTag(tag) {
  let ptag = tag
  while (ptag.__.isAnonymous) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

/**
 * Trigger the unmount method on all the expressions
 * @param   { Array } expressions - DOM expressions
 */
export function unmountAll(expressions) {
  each(expressions, expr => {
    if (expr.unmount) expr.unmount(true)
    else if (expr.tagName) expr.tag.unmount(true)
    else if (expr.unmount) expr.unmount()
  })
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
export function getTagName(dom, skipDataIs) {
  const child = getTag(dom)
  const namedTag = !skipDataIs && getAttr(dom, IS_DIRECTIVE)
  return namedTag && !tmpl.hasExpr(namedTag) ?
    namedTag : child ? child.name : dom.tagName.toLowerCase()
}

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 * @param { Number } index - add the new item in a certain array position
 */
export function arrayishAdd(obj, key, value, ensureArray, index) {
  const dest = obj[key]
  const isArr = isArray(dest)
  const hasIndex = !isUndefined(index)

  if (dest && dest === value) return

  // if the key was never set, set it once
  if (!dest && ensureArray) obj[key] = [value]
  else if (!dest) obj[key] = value
  // if it was an array and not yet set
  else {
    if (isArr) {
      const oldIndex = dest.indexOf(value)
      // this item never changed its position
      if (oldIndex === index) return
      // remove the item from its old position
      if (oldIndex !== -1) dest.splice(oldIndex, 1)
      // move or add the item
      if (hasIndex) {
        dest.splice(index, 0, value)
      } else {
        dest.push(value)
      }
    } else obj[key] = [dest, value]
  }
}

/**
 * Removes an item from an object at a given key. If the key points to an array,
 * then the item is just removed from the array.
 * @param { Object } obj - object on which to remove the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be removed
 * @param { Boolean } ensureArray - ensure that the property remains an array
*/
export function arrayishRemove(obj, key, value, ensureArray) {
  if (isArray(obj[key])) {
    let index = obj[key].indexOf(value)
    if (index !== -1) obj[key].splice(index, 1)
    if (!obj[key].length) delete obj[key]
    else if (obj[key].length === 1 && !ensureArray) obj[key] = obj[key][0]
  } else if (obj[key] === value)
    delete obj[key] // otherwise just delete the key
}

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @param   { Object } ctx - optional context that will be used to extend an existing class ( used in riot.Tag )
 * @returns { Tag } a new Tag instance
 */
export function mountTo(root, tagName, opts, ctx) {
  const impl = __TAG_IMPL[tagName]
  const implClass = __TAG_IMPL[tagName].class
  const context = ctx || (implClass ? Object.create(implClass.prototype) : {})
  // cache the inner HTML to fix #855
  const innerHTML = root._innerHTML = root._innerHTML || root.innerHTML
  const conf = extend({ root, opts, context }, { parent: opts ? opts.parent : null })
  let tag

  if (impl && root) tag = createTag(impl, conf, innerHTML)

  if (tag && tag.mount) {
    tag.mount(true)
    // add this tag to the virtualDom variable
    if (!contains(__TAGS_CACHE, tag)) __TAGS_CACHE.push(tag)
  }

  return tag
}

/**
 * makes a tag virtual and replaces a reference in the dom
 * @this Tag
 * @param { tag } the tag to make virtual
 * @param { ref } the dom reference location
 */
export function makeReplaceVirtual(tag, ref) {
  const frag = createFrag()
  makeVirtual.call(tag, frag)
  ref.parentNode.replaceChild(frag, ref)
}

/**
 * Adds the elements for a virtual tag
 * @this Tag
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
export function makeVirtual(src, target) {
  const head = createDOMPlaceholder()
  const tail = createDOMPlaceholder()
  const frag = createFrag()
  let sib
  let el

  this.root.insertBefore(head, this.root.firstChild)
  this.root.appendChild(tail)

  this.__.head = el = head
  this.__.tail = tail

  while (el) {
    sib = el.nextSibling
    frag.appendChild(el)
    this.__.virts.push(el) // hold for unmounting
    el = sib
  }

  if (target)
    src.insertBefore(frag, target.__.head)
  else
    src.appendChild(frag)
}

/**
 * Return a temporary context containing also the parent properties
 * @this Tag
 * @param { Tag } - temporary tag context containing all the parent properties
 */
export function inheritParentProps() {
  if (this.parent) return extend(Object.create(this), this.parent)
  return this
}

/**
 * Move virtual tag and all child nodes
 * @this Tag
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
export function moveVirtual(src, target) {
  let el = this.__.head
  let sib
  const frag = createFrag()

  while (el) {
    sib = el.nextSibling
    frag.appendChild(el)
    el = sib
    if (el === this.__.tail) {
      frag.appendChild(el)
      src.insertBefore(frag, target.__.head)
      break
    }
  }
}

/**
 * Get selectors for tags
 * @param   { Array } tags - tag names to select
 * @returns { String } selector
 */
export function selectTags(tags) {
  // select all tags
  if (!tags) {
    const keys = Object.keys(__TAG_IMPL)
    return keys + selectTags(keys)
  }

  return tags
    .filter(t => !/[^-\w]/.test(t))
    .reduce((list, t) => {
      const name = t.trim().toLowerCase()
      return list + `,[${IS_DIRECTIVE}="${name}"]`
    }, '')
}
