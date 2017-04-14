import { tmpl } from 'riot-tmpl'
import { each, contains } from './../common/util/misc'
import { isFunction, isBlank, isObject } from './../common/util/check'
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
  makeReplaceVirtual,
  arrayishRemove
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
  var conf, isVirtual, head, ref

  if (expr.tag && expr.tagName === tagName) {
    expr.tag.update()
    return
  }

  isVirtual = expr.dom.tagName === 'VIRTUAL'
  // sync _parent to accommodate changing tagnames
  if (expr.tag) {

    // need placeholder before unmount
    if(isVirtual) {
      head = expr.tag.__.head
      ref = createDOMPlaceholder()
      head.parentNode.insertBefore(ref, head)
    }

    expr.tag.unmount(true)
  }

  expr.impl = __TAG_IMPL[tagName]
  conf = {root: expr.dom, parent: parent, hasImpl: true, tagName: tagName}
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent)
  each(expr.attrs, a => setAttr(expr.tag.root, a.name, a.value))
  expr.tagName = tagName
  expr.tag.mount()
  if (isVirtual)
    makeReplaceVirtual(expr.tag, ref || expr.tag.root) // root exist first time, after use placeholder

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.__.onUnmount = function() {
    var delName = expr.tag.opts.dataIs,
      tags = expr.tag.parent.tags,
      _tags = expr.tag.__.parent.tags
    arrayishRemove(tags, delName, expr.tag)
    arrayishRemove(_tags, delName, expr.tag)
    expr.tag.unmount()
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

  var dom = expr.dom,
    // remove the riot- prefix
    attrName = normalizeAttrName(expr.attr),
    isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName),
    isVirtual = expr.root && expr.root.tagName === 'VIRTUAL',
    parent = dom && (expr.parent || dom.parentNode),
    // detect the style attributes
    isStyleAttr = attrName === 'style',
    isClassAttr = attrName === 'class',
    isObj,
    value

  // if it's a tag we could totally skip the rest
  if (expr._riot_id) {
    if (expr.isMounted) {
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

  // ...it seems to be a simple expression so we try to calculat its value
  value = tmpl(expr.expr, this)
  isObj = isObject(value)

  // convert the style/class objects to strings
  if (isObj) {
    isObj = !isClassAttr && !isStyleAttr
    if (isClassAttr) {
      value = tmpl(JSON.stringify(value), this)
    } else if (isStyleAttr) {
      value = styleObjectToString(value)
    }
  }

  // remove original attribute
  if (expr.attr && (!expr.isAttrRemoved || !value)) {
    remAttr(dom, expr.attr)
    expr.isAttrRemoved = true
  }

  // for the boolean attributes we don't need the value
  // we can convert it to checked=true to checked=checked
  if (expr.bool) value = value ? attrName : false
  if (expr.isRtag) return updateDataIs(expr, this, value)
  if (expr.wasParsedOnce && expr.value === value) return

  // update the expression value
  expr.value = value
  expr.wasParsedOnce = true

  // if the value is an object we can not do much more with it
  if (isObj && !isToggle) return
  // avoid to render undefined/null values
  if (isBlank(value)) value = ''

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
    }

    if (!isBlank(value) && value !== false) {
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
