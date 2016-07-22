import { __TAG_IMPL } from './../common/global-variables'

import { tmpl } from 'riot-tmpl'
import Tag from './tag'

import {
  isSpecialTag,
  getTagName,
  getOuterHTML,
  mkitem,
  getAttr,
  remAttr,
  getTag,
  arrayishAdd,
  arrayishRemove,
  defineProperty,
  isArray,
  makeVirtual
} from './../common/util'

export default function each(dom, parent, expr) {
  // remove the each property from the original tag
  remAttr(dom, 'each')

  const
    child = getTag(dom),
    tagName = getTagName(dom),
    impl = __TAG_IMPL[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = isSpecialTag(tagName),
    exprObj = tmpl.loopKeys(expr),
    ifExpr = getAttr(dom, 'if'),
    isVirtual = dom.tagName == 'VIRTUAL',
    // the option tags must be treated differently
    isOption = tagName.toLowerCase() === 'option'

  let
    root = dom.parentNode,
    ref = document.createTextNode(''),
    hasKeys

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)
  root.removeChild(dom)

  if (ifExpr)
    remAttr(dom, 'if')

  let
    itemsPending = [],
    tagsPending = []

  exprObj.isLoop = true

  exprObj.update = function updateEach() {
    let root = ref.parentNode
    let itemsUpdated = tmpl(exprObj.val, parent)

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

    let
      count = itemsPending.length,
      lastIndex = 0,
      traverse = itemsPending[0],
      lastMounted

    for (let i = 0; i < itemsUpdated.length; ++i) {
      let target = itemsUpdated[i]

      const item = !hasKeys && exprObj.key ?
        mkitem(exprObj, target, i) : target

      if (target === traverse && count < lastIndex) {
        traverse = itemsPending[++lastIndex]
        continue
      }

      // new tag
      let tag = new Tag(impl, {
        parent,
        isLoop: true,
        anonymous: !__TAG_IMPL[tagName],
        root: useRoot ? root : dom.cloneNode(),
        item
      }, dom.innerHTML)

      tag.mount()

      if (child)
        arrayishAdd(parent.tags, tagName, tag, true)

      if (lastIndex < count) {
        itemsPending.splice(i, 0, target)
        tagsPending.splice(i, 0, tag)

        lastIndex++

        isVirtual ?
          makeVirtual(tag, root, tagsPending[i + 1]) :
          root.insertBefore(tag.root, tagsPending[i + 1].root)
      } else {
        itemsPending.push(target)
        tagsPending.push(tag)

        let afterLast = lastMounted && lastMounted.nextSibling

        if (!afterLast)
          isVirtual ?
            makeVirtual(tag, root) :
            root.appendChild(tag.root)
        else
          isVirtual ?
            makeVirtual(tag, root, afterLast._tag) :
            root.insertBefore(tag.root, afterLast)
      }

      lastMounted = tag.root

      // cache original item to use it in the events bound to this node and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)
    }

    let redundant = itemsPending.length - itemsUpdated.length

    if (redundant > 0) {
      itemsPending.splice(lastIndex, redundant)
      tagsPending
        .splice(lastIndex, redundant)
        .forEach(tag => {
          tag.unmount()
          arrayishRemove(parent.tags, tagName, tag, true)
        })

    }
  }

  exprObj.unmount = function() {
    tagsPending.forEach(tag => tag.unmount())
  }

  return exprObj
}
