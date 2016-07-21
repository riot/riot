import {
  __TAG_IMPL
} from './../common/global-variables'

import {
  getTagName,
  isSpecialTag,
  getOuterHTML,
  setChildren,
  each
} from './../common/util'

import { tmpl } from 'riot-tmpl'
import Tag from './tag'

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } pos - value containing the position of the item in the array
 * @param   { Object } base - prototype object for the new item
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
export function mkitem(expr, key, pos, base) {
  const item = base ? Object.create(base) : {}
  item[expr.key] = key
  if (expr.pos)
    item[expr.pos] = pos
  return item
}

export default function _each(dom, parent, expr) {
  const
    tagList = [],
    tagName = getTagName(dom),
    useRoot = isSpecialTag(tagName),
    impl = __TAG_IMPL[tagName] || { tmpl: getOuterHTML(dom) }

  let root = dom.parentNode

  expr.update = function updateEach() {
    const
      raw = tmpl(expr.val, parent),
      items = Object.keys(raw).map(key => raw[key])

    items.forEach((item, i) => {
      let tag = tagList[i]

      if (!tag) {
        tag = new Tag(impl, {
          parent,
          isLoop: true,
          anonymous: !__TAG_IMPL[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item
        }, dom.innerHTML)

        tag.mount()

        tagList.push(tag)
      }
    })
  }

  expr.unmount = function() {
    each(tagList, t => t.unmount())
  }
}