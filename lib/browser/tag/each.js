import { __TAG_IMPL } from './../common/global-variables'

import { tmpl } from 'riot-tmpl'
import Tag from './tag'

import {
  isString,
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
  let verbose = false

  if (verbose)
    console.log('==== EACH BEG ====')
  // remove the each property from the original tag
  remAttr(dom, 'each')

  const
    // check whether "no-order" flag is active
    reorderAllowed = !isString(getAttr(dom, 'no-reorder')) || remAttr(dom, 'no-reorder'),
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

    const frag = document.createDocumentFragment()

    let
      count = itemsPending.length,
      lastIndex = 0,
      traverse = itemsPending[0],
      lastMounted

    if (verbose) {
      console.log('HAD ' + itemsPending.length + ':', itemsPending)
      console.log('GOT ' + itemsUpdated.length + ':',  itemsUpdated)
      console.log('---- LOOP BEG ---')
    }

    for (let i = 0; i < itemsUpdated.length; ++i) {
      let target = itemsUpdated[i]

      const item = !hasKeys && exprObj.key ?
        mkitem(exprObj, target, i) : target

      if (target === traverse && i + 1 < count) {
        //if (verbose)
        console.log('PND:', tagsPending[i].root.outerHTML)
        tagsPending[i].update()
        //if (verbose)
        console.log('UPD:', tagsPending[i].root.outerHTML)

        traverse = itemsPending[i + 1]
        lastIndex = i + 1
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

      if (verbose)
        console.log('ADD:', tag.root.outerHTML)

      if (child)
        arrayishAdd(parent.tags, tagName, tag, true)

      if (i < count) {
        itemsPending.splice(i, 0, target)
        tagsPending.splice(i, 0, tag)

        isVirtual ?
          makeVirtual(tag, root, tagsPending[i + 1]) :
          root.insertBefore(tag.root, tagsPending[i + 1].root)

        lastIndex = i + 1
      } else {
        itemsPending.push(target)
        tagsPending.push(tag)

        isVirtual ?
          makeVirtual(tag, frag) :
          frag.appendChild(tag.root)
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

    // insert the new nodes
    root.insertBefore(frag, ref)

    if (verbose) {
      console.log('ROOT:', root.outerHTML)
      console.log('---- LOOP END ----')
    }
  }

  exprObj.unmount = function() {
    tagsPending.forEach(tag => tag.unmount())
  }

  return exprObj
}
