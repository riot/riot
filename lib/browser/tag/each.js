import {
  FIREFOX,
  __TAG_IMPL
} from './../common/global-variables'

import { tmpl } from 'riot-tmpl'
import Tag from './tag'

import {
  isUndefined,
  isString,
  isObject,
  isSpecialTag,
  getTagName,
  getTagImpl,
  getOuterHTML,
  mkitem,
  getAttr,
  remAttr,
  arrayishAdd,
  arrayishRemove,
  defineProperty,
  isArray,
  makeVirtual,
  moveNestedTags
} from './../common/util'

export default function each(dom, parent, expr) {
  remAttr(dom, 'each')

  const
    noReorder = isString(getAttr(dom, 'no-reorder')),
    child = getTagImpl(dom),
    tagName = getTagName(dom),
    impl = __TAG_IMPL[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = isSpecialTag(tagName),
    exprObj = tmpl.loopKeys(expr),
    ifExpr = getAttr(dom, 'if'),
    isVirtual = dom.tagName == 'VIRTUAL',
    // #1374 FireFox bug in <option selected={expression}>
    isOptionFF = FIREFOX && tagName.toLowerCase() === 'option'

  let
    root = dom.parentNode,
    ref = document.createTextNode(''),
    hasKeys

  remAttr(dom, 'if')
  remAttr(dom, 'no-reorder')

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)
  root.removeChild(dom)

  let
    itemsPrevious = [],
    tagsPrevious = []

  const
    tagsMounted = {},
    tagsPending = {}

  exprObj.isLoop = true

  function unmountById(riotId) {
    let tag = tagsMounted[riotId]
    tag.unmount()
    arrayishRemove(parent.tags, tagName, tag, true)
    delete tagsMounted[riotId]
  }

  exprObj.unmount = function unmountEach() {
    Object.keys(tagsMounted).forEach(unmountById)
  }

  exprObj.update = function updateEach() {
    let root = ref.parentNode

    let
      itemsUpdated = tmpl(exprObj.val, parent),
      tagsUpdated = []

    // objects cause full redraw
    if (!isArray(itemsUpdated)) {
      hasKeys = itemsUpdated || false
      itemsUpdated = hasKeys
        ? Object
          .keys(itemsUpdated)
          .map(key => {
            return mkitem(exprObj, key, itemsUpdated[key])
          })
        : []
    }

    if (ifExpr) {
      itemsUpdated = itemsUpdated.filter((item, i) => {
        let context = mkitem(exprObj, item, i, parent)
        return !!tmpl(ifExpr, context)
      })
    }

    const frag = document.createDocumentFragment()

    // do not move the nodes whose items didn't change position
    let skipTo = -1

    itemsUpdated.forEach((item, i) => {
      // cache the original item
      const _item = item
      // with "no-order" flag we always use previous tags
      const usePrevious = tagsPrevious.length && noReorder ||
        itemsPrevious[i] === item

      if (usePrevious && skipTo === i - 1)
        skipTo = i

      let tag = usePrevious ? tagsPrevious[i] :
        // check if this item was already linked
        isObject(item) && tagsMounted[item._riot_id]

      // extend item to account for "key" bindings
      if (!hasKeys && exprObj.key)
        item = mkitem(exprObj, item, i)

      if (!tag) {
        // new tag
        tag = new Tag(impl, {
          parent,
          isLoop: true,
          anonymous: !__TAG_IMPL[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item
        }, dom.innerHTML)

        // link the original item to it's tag
        if (isObject(_item))
          defineProperty(_item, '_riot_id', tag._riot_id)

        tagsMounted[tag._riot_id] = tag

        tag.mount()

        if (child)
          arrayishAdd(parent.tags, tagName, tag, true)
      } else
        tag.update(item)

      tagsUpdated.push(tag)

      tagsPending[tag._riot_id] = true

      if (!child && tag.tags)
        // non-custom tags should have their nested tags moved
        moveNestedTags(tag, i)

      if (skipTo !== i) {
        isVirtual ?
          makeVirtual(tag, frag) :
          frag.appendChild(tag.root)
      }

      // this will be used in events bound to this node
      tag._item = item
      // cache parent tag internally
      defineProperty(tag, '_parent', parent)
    })

    // unmount redundant
    Object
      .keys(tagsMounted)
      .filter(riotId => isUndefined(tagsPending[riotId]))
      .forEach(unmountById)
    // clear updated
    Object
      .keys(tagsPending)
      .forEach(riotId => delete tagsPending[riotId])

    let target = ref

    // insert new nodes
    if (skipTo > 0 && skipTo < tagsPrevious.length) {
      let tag = tagsPrevious[skipTo]

      target = !tag._virts ?
        tag.root.nextSibling :
        tag._virts[tag._virts.length - 1].nextSibling
    }

    root.insertBefore(frag, target)

    tagsPrevious = tagsUpdated.slice()
    itemsPrevious = itemsUpdated.slice()

    if (isOptionFF && !root.multiple) {
      for (let i = 0; i < root.length; ++i) {
        if (root[i].__riot1374) {
          root.selectedIndex = i // clear other options
          delete root[i].__riot1374
          break
        }
      }
    }
  }

  return exprObj
}
