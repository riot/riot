import {
  __TAGS_CACHE,
  ATTRS_PREFIX,
  RIOT_EVENTS_KEY
} from './../../common/global-variables'

import removeAttribute from './../../common/util/dom/remove-attribute'
import walkAttributes from './../../common/util/dom/walk-attributes'
import setInnerHTML from './../../common/util/dom/set-inner-HTML'
import each from './../../common/util/misc/each'
import startsWith from './../../common/util/misc/starts-with'

import unmountAll from './../../common/util/tags/unmount-all'

import arrayishRemove from './../../common/util/tags/arrayish-remove'
import getImmediateCustomParent from './../../common/util/tags/get-immediate-custom-parent'
import setMountState from './../../common/util/tags/set-mount-state'


/**
 * Unmount the tag instance
 * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
 * @returns { Tag } the current tag instance
 */
export default function tagUnmount(tag, mustKeepRoot, expressions) {
  const __ = tag.__
  const root = __.root
  const tagIndex = __TAGS_CACHE.indexOf(tag)
  const p = root.parentNode

  if (!__.skipAnonymous) tag.trigger('before-unmount')

  // clear all attributes coming from the mounted tag
  walkAttributes(__.impl.attrs, (name) => {
    if (startsWith(name, ATTRS_PREFIX))
      name = name.slice(ATTRS_PREFIX.length)

    removeAttribute(root, name)
  })

  // remove all the event listeners
  tag.__.listeners.forEach((dom) => {
    Object.keys(dom[RIOT_EVENTS_KEY]).forEach((eventName) => {
      dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][eventName])
    })
  })

  // remove tag instance from the global tags cache collection
  if (tagIndex !== -1) __TAGS_CACHE.splice(tagIndex, 1)

  // clean up the parent tags object
  if (__.parent && !__.isAnonymous) {
    const ptag = getImmediateCustomParent(__.parent)

    if (__.isVirtual) {
      Object
        .keys(tag.tags)
        .forEach(tagName => arrayishRemove(ptag.tags, tagName, tag.tags[tagName]))
    } else {
      arrayishRemove(ptag.tags, __.tagName, tag)
    }
  }

  // unmount all the virtual directives
  if (tag.__.virts) {
    each(tag.__.virts, (v) => {
      if (v.parentNode) v.parentNode.removeChild(v)
    })
  }

  // allow expressions to unmount themselves
  unmountAll(expressions)
  each(__.instAttrs, a => a.expr && a.expr.unmount && a.expr.unmount())

  // clear the tag html if it's necessary
  if (mustKeepRoot) setInnerHTML(root, '')
  // otherwise detach the root tag from the DOM
  else if (p) p.removeChild(root)

  // custom internal unmount function to avoid relying on the observable
  if (__.onUnmount) __.onUnmount()

  // weird fix for a weird edge case #2409 and #2436
  // some users might use your software not as you've expected
  // so I need to add these dirty hacks to mitigate unexpected issues
  if (!tag.isMounted) setMountState.call(tag, true)

  setMountState.call(tag, false)

  delete root._tag

  return tag
}