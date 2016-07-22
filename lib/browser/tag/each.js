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
  defineProperty,
  isArray
} from './../common/util'

export default function each(dom, parent, expr) {
  // remove the each property from the original tag
  remAttr(dom, 'each')

  const
    frag = document.createDocumentFragment()
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
      index = 0,
      traverse = itemsPending[index],
      lastChild

    console.log('OLD', itemsPending)
    console.log('NEW', itemsUpdated)
    console.log('ROOT', root.innerHTML)
    for (let i = 0; i < itemsUpdated.length; ++i) {
      let target = itemsUpdated[i]

      const item = !hasKeys && exprObj.key ? mkitem(expr, target, i) : target

      if (target === traverse) {
        console.log('TRAVERSE:', itemsPending[index])
        traverse = itemsPending[index]
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

      // cache original item to use it in the events bound to this node and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)

      if (child)
        arrayishAdd(parent.tags, tagName, tag, true)

      console.log('INSERT', tag.root.innerHTML)
      if (traverse) {
        itemsPending.splice(i, 0, target)
        tagsPending.splice(i, 0, tag)
        root.insertBefore(tag.root, root.children[index])
        index++
      } else {
        itemsPending.push(target)
        tagsPending.push(tag)
        root.appendChild(tag.root)
      }

      lastChild = tag.root.nextSibling
    }

    console.log('GOT', root.innerHTML)
    while (lastChild) {
      let next = lastChild.nextSibling
      console.log('DELETE', lastChild.innerHTML)
      //root.removeChild(lastChild)
      lastChild = next
    }
  }

  exprObj.unmount = function() {
    tagsPending
      .forEach(t => t.unmount())
  }

  return exprObj
}