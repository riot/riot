import {
  getAttr
} from './dom-helpers'

import {
  isArray,
  isWritable,
  contains
} from './check'

import {
  __TAG_IMPL,
  T_STRING,
  T_OBJECT,
  T_UNDEF,
  RIOT_TAG_IS,
  RIOT_TAG,
  T_FUNCTION,
  __VIRTUAL_DOM,
  RE_RESERVED_NAMES
} from './../global-variables'

import Tag from './../../tag/tag'
import { tmpl } from 'riot-tmpl'
/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } els - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
export function each(els, fn) {
  var len = els ? els.length : 0

  for (var i = 0, el; i < len; i++) {
    el = els[i]
    // return false -> current item was removed by fn during the loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } string - input string
 * @returns { String } my-string -> myString
 */
export function toCamel(string) {
  return string.replace(/-(\w)/g, function(_, c) {
    return c.toUpperCase()
  })
}

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
export function getTag(dom) {
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
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
* @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
export function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options))
  return el
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipName - hack to ignore the name attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
export function getTagName(dom, skipName) {
  var child = getTag(dom),
    namedTag = !skipName && getAttr(dom, 'name'),
    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
export function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          src[key] = obj[key]
      }
    }
  }
  return src
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
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 * @param   { Object }   context - fn can optionally return an object, which is passed to children
 */
export function walk(dom, fn, context) {
  if (dom) {
    var res = fn(dom, context), next
    // stop the recursion
    if (res === false) return
    else {
      dom = dom.firstChild

      while (dom) {
        next = dom.nextSibling
        walk(dom, fn, res)
        dom = next
      }
    }
  }
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
export function walkAttributes(html, fn) {
  if (!html) return
  var m,
    re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g

  while (m = re.exec(html)) {
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
  }
}

/**
 * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
 * @param   { Object }  dom - DOM node we want to parse
 * @returns { Boolean } -
 */
export function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
export function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
export function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Simple object prototypal inheritance
 * @param   { Object } parent - parent object
 * @returns { Object } child instance
 */
export function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 */
export function arrayishAdd(obj, key, value, ensureArray) {
  var dest = obj[key]
  var isArr = isArray(dest)

  if (dest && dest === value) return

  // if the key was never set, set it once
  if (!dest && ensureArray) obj[key] = [value]
  else if (!dest) obj[key] = value
  // if it was an array and not yet set
  else if (!isArr || isArr && !contains(dest, value)) {
    if (isArr) dest.push(value)
    else obj[key] = [dest, value]
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
    each(obj[key], function(item, i) {
      if (item === value) obj[key].splice(i, 1)
    })
    if (!obj[key].length) delete obj[key]
    else if (obj[key].length == 1 && !ensureArray) obj[key] = obj[key][0]
  } else
    delete obj[key] // otherwise just delete the key
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
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
export function makeVirtual(tag, src, target) {
  var head = document.createTextNode(''), tail = document.createTextNode(''), sib, el
  tag._head = tag.root.insertBefore(head, tag.root.firstChild)
  tag._tail = tag.root.appendChild(tail)
  el = tag._head
  tag._virts = []
  while (el) {
    sib = el.nextSibling
    if (target)
      src.insertBefore(el, target._head)
    else
      src.appendChild(el)

    tag._virts.push(el) // hold for unmounting
    el = sib
  }
}

/**
 * Move virtual tag and all child nodes
 * @param { Tag } tag - first child reference used to start move
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
export function moveVirtual(tag, src, target) {
  var el = tag._head, sib
  while (el) {
    sib = el.nextSibling
    src.insertBefore(el, target._head)
    el = sib
    if (el == tag._tail) {
      src.insertBefore(el, target._head)
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
