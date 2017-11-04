import { tmpl } from 'riot-tmpl'
import { each, contains } from './../common/util/misc'
import { isFunction, isBlank, isObject, isString } from './../common/util/check'
import {
  remAttr,
  getAttr,
  setAttr,
  createDOMPlaceholder,
  toggleVisibility,
  styleObjectToString
} from './../common/util/dom'
import setEventHandler from './setEventHandler'
import {
  initChildTag,
  arrayishRemove,
  inheritParentProps,
  makeReplaceVirtual
} from './../common/util/tags'

import {
  __TAG_IMPL,
  ATTRS_PREFIX,
  SHOW_DIRECTIVE,
  HIDE_DIRECTIVE,
  IE_VERSION,
  CASE_SENSITIVE_ATTRIBUTES
} from './../common/global-variables'

/**
 * Update dynamically created data-is tags with changing expressions
 * @param { Object } expr - expression tag and expression info
 * @param { Tag }    parent - parent for tag creation
 * @param { String } tagName - tag implementation we want to use
 */
export function updateDataIs(expr, parent, tagName) {
  let tag = expr.tag || expr.dom._tag
  let ref

  const { head } = tag ? tag.__ : {}
  const isVirtual = expr.dom.tagName === 'VIRTUAL'

  if (tag && expr.tagName === tagName) {
    tag.update()
    return
  }

  // sync _parent to accommodate changing tagnames
  if (tag) {
    // need placeholder before unmount
    if(isVirtual) {
      ref = createDOMPlaceholder()
      head.parentNode.insertBefore(ref, head)
    }

    tag.unmount(true)
  }

  // unable to get the tag name
  if (!isString(tagName)) return

  expr.impl = __TAG_IMPL[tagName]

  // unknown implementation
  if (!expr.impl) return

  expr.tag = tag = initChildTag(
    expr.impl, {
      root: expr.dom,
      parent,
      tagName
    },
    expr.dom.innerHTML,
    parent
  )

  each(expr.attrs, a => setAttr(tag.root, a.name, a.value))
  expr.tagName = tagName
  tag.mount()

  // root exist first time, after use placeholder
  if (isVirtual) makeReplaceVirtual(tag, ref || tag.root)

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.__.onUnmount = () => {
    const delName = tag.opts.dataIs
    arrayishRemove(tag.parent.tags, delName, tag)
    arrayishRemove(tag.__.parent.tags, delName, tag)
    tag.unmount()
  }
}

/**
 * Nomalize any attribute removing the "riot-" prefix
 * @param   { String } attrName - original attribute name
 * @returns { String } valid html attribute name
 */
export function normalizeAttrName(attrName) {
  if (!attrName) return null
  attrName = attrName.replace(ATTRS_PREFIX, '')
  if (CASE_SENSITIVE_ATTRIBUTES[attrName]) attrName = CASE_SENSITIVE_ATTRIBUTES[attrName]
  return attrName
}

/**
 * Update on single tag expression
 * @this Tag
 * @param { Object } expr - expression logic
 * @returns { undefined }
 */
export function updateExpression(expr) {
  if (this.root && getAttr(this.root,'virtualized')) return

  const dom = expr.dom
  // remove the riot- prefix
  const attrName = normalizeAttrName(expr.attr)
  const isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName)
  const isVirtual = expr.root && expr.root.tagName === 'VIRTUAL'
  const { isAnonymous } = this.__
  const parent = dom && (expr.parent || dom.parentNode)
  // detect the style attributes
  const isStyleAttr = attrName === 'style'
  const isClassAttr = attrName === 'class'

  let value

  // if it's a tag we could totally skip the rest
  if (expr._riot_id) {
    if (expr.__.wasCreated) {
      expr.update()
    // if it hasn't been mounted yet, do that now.
    } else {
      expr.mount()
      if (isVirtual) {
        makeReplaceVirtual(expr, expr.root)
      }
    }
    return
  }

  // if this expression has the update method it means it can handle the DOM changes by itself
  if (expr.update) return expr.update()

  const context = isToggle && !isAnonymous ? inheritParentProps.call(this) : this

  // ...it seems to be a simple expression so we try to calculate its value
  value = tmpl(expr.expr, context)

  const hasValue = !isBlank(value)
  const isObj = isObject(value)

  // convert the style/class objects to strings
  if (isObj) {
    if (isClassAttr) {
      value = tmpl(JSON.stringify(value), this)
    } else if (isStyleAttr) {
      value = styleObjectToString(value)
    }
  }

  // remove original attribute
  if (expr.attr && (!expr.wasParsedOnce || !hasValue || value === false)) {
    // remove either riot-* attributes or just the attribute name
    remAttr(dom, getAttr(dom, expr.attr) ? expr.attr : attrName)
  }

  // for the boolean attributes we don't need the value
  // we can convert it to checked=true to checked=checked
  if (expr.bool) value = value ? attrName : false
  if (expr.isRtag) return updateDataIs(expr, this, value)
  if (expr.wasParsedOnce && expr.value === value) return

  // update the expression value
  expr.value = value
  expr.wasParsedOnce = true

  // if the value is an object (and it's not a style or class attribute) we can not do much more with it
  if (isObj && !isClassAttr && !isStyleAttr && !isToggle) return
  // avoid to render undefined/null values
  if (!hasValue) value = ''

  // textarea and text nodes have no attribute name
  if (!attrName) {
    // about #815 w/o replace: the browser converts the value to a string,
    // the comparison by "==" does too, but not in the server
    value += ''
    // test for parent avoids error with invalid assignment to nodeValue
    if (parent) {
      // cache the parent node because somehow it will become null on IE
      // on the next iteration
      expr.parent = parent
      if (parent.tagName === 'TEXTAREA') {
        parent.value = value                    // #1113
        if (!IE_VERSION) dom.nodeValue = value  // #1625 IE throws here, nodeValue
      }                                         // will be available on 'updated'
      else dom.nodeValue = value
    }
    return
  }


  // event handler
  if (isFunction(value)) {
    setEventHandler(attrName, value, dom, this)
  // show / hide
  } else if (isToggle) {
    toggleVisibility(dom, attrName === HIDE_DIRECTIVE ? !value : value)
  // handle attributes
  } else {
    if (expr.bool) {
      dom[attrName] = value
    }

    if (attrName === 'value' && dom.value !== value) {
      dom.value = value
    } else if (hasValue && value !== false) {
      setAttr(dom, attrName, value)
    }

    // make sure that in case of style changes
    // the element stays hidden
    if (isStyleAttr && dom.hidden) toggleVisibility(dom, false)
  }
}

/**
 * Update all the expressions in a Tag instance
 * @this Tag
 * @param { Array } expressions - expression that must be re evaluated
 */
export default function updateAllExpressions(expressions) {
  each(expressions, updateExpression.bind(this))
}
