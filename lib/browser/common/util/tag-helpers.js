import {
  getAttr
} from './dom-helpers'

import {
  contains,
  each,
  arrayishAdd
} from './misc'

import {
  isArray
} from './check'

import {
  __TAG_IMPL,
  RIOT_TAG_IS,
  RIOT_TAG,
  T_FUNCTION,
  __VIRTUAL_DOM,
  RE_RESERVED_NAMES
} from './../global-variables'

import Tag from './../../tag/tag'
import { tmpl } from 'riot-tmpl'

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
export function getTagImpl(dom) {
  return dom.tagName && __TAG_IMPL[getAttr(dom, RIOT_TAG_IS) ||
    getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
}

/**
 * Move the position of a custom tag in its parent tag
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
export function moveChildTag(tag, tagName, newPos) {
  var parent = tag.parent,
    tags
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0])
  else arrayishAdd(parent.tags, tagName, tag)
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @param   { Boolean } skipName - hack to ignore the name attribute when attaching to parent
 * @returns { Object } instance of the new child tag just created
 */
export function initChildTag(child, opts, innerHTML, parent) {
  var tag = new Tag(child, opts, innerHTML),
    tagName = opts.tagName || getTagName(opts.root, true),
    ptag = getImmediateCustomParentTag(parent)
  // fix for the parent attribute in the looped elements
  tag.parent = ptag
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag._parent = parent

  // add this tag to the custom parent tag
  arrayishAdd(ptag.tags, tagName, tag)

  // and also to the real parent tag
  if (ptag !== parent)
    arrayishAdd(parent.tags, tagName, tag)

  // empty the child node once we got its template
  // to avoid that its children get compiled multiple times
  opts.root.innerHTML = ''

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
export function getImmediateCustomParentTag(tag) {
  var ptag = tag
  while (ptag._internal.anonymous) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

export function unmountAll(expressions) {
  var i, expl = expressions.length, expr
  for (i = 0; i < expl; i++) {
    expr = expressions[i]
    if (expr instanceof Tag) expr.unmount(true)
    else if (expr.unmount) expr.unmount()
  }
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipName - hack to ignore the name attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
export function getTagName(dom, skipName) {
  var child = getTagImpl(dom),
    namedTag = !skipName && getAttr(dom, 'name'),
    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

/**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
export function cleanUpData(data) {
  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION))
    return data

  var o = {}
  for (var key in data) {
    if (!RE_RESERVED_NAMES.test(key)) o[key] = data[key]
  }
  return o
}

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @returns { Tag } a new Tag instance
 */
export function mountTo(root, tagName, opts) {
  var tag = __TAG_IMPL[tagName],
    // cache the inner HTML to fix #855
    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  var conf = { root: root, opts: opts }
  if (opts && opts.parent) conf.parent = opts.parent
  if (tag && root) tag = new Tag(tag, conf, innerHTML)

  if (tag && tag.mount) {
    tag.mount(true)
    // add this tag to the virtualDom variable
    if (!contains(__VIRTUAL_DOM, tag)) __VIRTUAL_DOM.push(tag)
  }

  return tag
}


/**
 * Adds the elements for a virtual tag
 * @param { Tag } tag - the tag whose root's children will be inserted or appended
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } [target] - only if inserting, insert before this tag's first child
 */
export function makeVirtual(tag, src, target) {
  tag._virts = tag._virts || Array.prototype.slice.call(tag.root.childNodes)

  const frag = document.createDocumentFragment()

  tag._virts.forEach(node => frag.appendChild(node))

  !target ?
    src.appendChild(frag) :
    src.insertBefore(frag, target._head)
}

/**
 * Move virtual tag and all child nodes
 * @param { Tag } tag - first child reference used to start move
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
export function moveVirtual(tag, src, target) {
  var el = tag._head, sib, frag = document.createDocumentFragment()
  while (el) {
    sib = el.nextSibling
    frag.appendChild(el)
    el = sib
    if (el == tag._tail) {
      frag.appendChild(el)
      src.insertBefore(frag, target._head)
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
    let keys = Object.keys(__TAG_IMPL)
    return keys + selectTags(keys)
  }

  return tags
    .filter(t => !/[^-\w]/.test(t))
    .reduce((list, t) => {
      let name = t.trim().toLowerCase()
      return list + `,[${RIOT_TAG_IS}="${name}"]`
    }, '')
}

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } exprObj - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } pos - value containing the position of the item in the array
 * @param   { Object } base - prototype object for the new item
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'pos' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
export function mkitem(exprObj, key, pos, base) {
  const item = base ? Object.create(base) : {}
  item[exprObj.key] = key
  if (exprObj.pos)
    item[exprObj.pos] = pos
  return item
}

/**
 * Move the nested custom tags in non custom loop tags
 * @param { Object } child - non custom loop tag
 * @param { Number } i - current position of the loop tag
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
