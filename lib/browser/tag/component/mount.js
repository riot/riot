import { parseExpressions, parseAttributes } from '../parse'
import RefExpr from '../ref'
import { mixin } from '../core'

import { GLOBAL_MIXIN } from './../../common/global-variables'

import setAttribute from './../../common/util/dom/set-attribute'
import walkAttributes from './../../common/util/dom/walk-attributes'

import each from './../../common/util/misc/each'
import define from './../../common/util/misc/define'

import getImmediateCustomParent from './../../common/util/tags/get-immediate-custom-parent'
import updateOpts from './../../common/util/tags/update-options'
import setMountState from './../../common/util/tags/set-mount-state'

/**
 * Mount the current tag instance
 * @returns { Tag } the current tag instance
 */
export default function componentMount(tag, dom, expressions, opts) {
  const __ = tag.__
  const root = __.root
  root._tag = tag // keep a reference to the tag just created

  // Read all the attrs on this instance. This give us the info we need for updateOpts
  parseAttributes.apply(__.parent, [root, root.attributes, (attr, expr) => {
    if (!__.isAnonymous && RefExpr.isPrototypeOf(expr)) expr.tag = tag
    attr.expr = expr
    __.instAttrs.push(attr)
  }])

  // update the root adding custom attributes coming from the compiler
  walkAttributes(__.impl.attrs, (k, v) => { __.implAttrs.push({name: k, value: v}) })
  parseAttributes.apply(tag, [root, __.implAttrs, (attr, expr) => {
    if (expr) expressions.push(expr)
    else setAttribute(root, attr.name, attr.value)
  }])

  // initialiation
  updateOpts.apply(tag, [__.isLoop, __.parent, __.isAnonymous, opts, __.instAttrs])

  // add global mixins
  const globalMixin = mixin(GLOBAL_MIXIN)

  if (globalMixin && !__.skipAnonymous) {
    for (const i in globalMixin) {
      if (globalMixin.hasOwnProperty(i)) {
        tag.mixin(globalMixin[i])
      }
    }
  }

  if (__.impl.fn) __.impl.fn.call(tag, opts)

  if (!__.skipAnonymous) tag.trigger('before-mount')

  // parse layout after init. fn may calculate args for nested custom tags
  each(parseExpressions.apply(tag, [dom, __.isAnonymous]), e => expressions.push(e))

  tag.update(__.item)

  if (!__.isAnonymous && !__.isInline) {
    while (dom.firstChild) root.appendChild(dom.firstChild)
  }

  define(tag, 'root', root)

  // if we need to wait that the parent "mount" or "updated" event gets triggered
  if (!__.skipAnonymous && tag.parent) {
    const p = getImmediateCustomParent(tag.parent)
    p.one(!p.isMounted ? 'mount' : 'updated', () => {
      setMountState.call(tag, true)
    })
  } else {
    // otherwise it's not a child tag we can trigger its mount event
    setMountState.call(tag, true)
  }

  tag.__.wasCreated = true

  return tag
}