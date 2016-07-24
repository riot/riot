import { __TAG_IMPL } from './../common/global-variables'

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
    // the option tags must be treated differently
    isOption = tagName.toLowerCase() === 'option'

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

    itemsUpdated.forEach((item, i) => {
      // cache the original item
      let _item = item
      // with "no-order" flag we always use previous tags
      let usePrevious = tagsPrevious.length && noReorder ||
        itemsPrevious[i] === item

      let tag = usePrevious ? tagsPrevious[i] :
        // check if this item was already linked
        isObject(item) && tagsMounted[item._riot_id]

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

      if (isVirtual) {
        tag._virts = tag._virts || Array.prototype.slice.call(tag.root.childNodes)

        tag._virts.forEach(node => frag.appendChild(node))
      } else
        frag.appendChild(tag.root)

      tag._item = item
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

    // insert new nodes
    root.insertBefore(frag, ref)

    tagsPrevious = tagsUpdated.slice()
    itemsPrevious = itemsUpdated.slice()
  }

  return exprObj
}
