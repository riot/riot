import { tmpl } from 'riot-tmpl'
import { startsWith, each, contains } from './../common/util/misc'
import { isFunction, isUndefined } from './../common/util/check'
import { remAttr, setAttr } from './../common/util/dom'
import setEventHandler from './setEventHandler'
import {
  initChildTag,
  makeVirtual,
  arrayishRemove
} from './../common/util/tags'

import {
  __TAG_IMPL,
  ATTRS_PREFIX,
  T_OBJECT,
  IS_DIRECTIVE,
  SHOW_DIRECTIVE,
  HIDE_DIRECTIVE,
  IE_VERSION,
  CASE_SENSITIVE_ATTRIBUTES
} from './../common/global-variables'


/**
 * Update dynamically created data-is tags with changing expressions
 * @param { Object } expr - expression tag and expression info
 * @param { Tag } parent - parent for tag creation
 */
export function updateDataIs(expr, parent) {
  var tagName = tmpl(expr.value, parent),
    conf

  if (expr.tag && expr.tagName === tagName) {
    expr.tag.update()
    return
  }

  // sync _parent to accommodate changing tagnames
  if (expr.tag) {
    each(expr.attrs, a => setAttr(expr.tag.root, a.name, a.value))
    expr.tag.unmount(true)
  }

  expr.impl = __TAG_IMPL[tagName]
  conf = {root: expr.dom, parent: parent, hasImpl: true, tagName: tagName}
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent)
  expr.tagName = tagName
  expr.tag.mount()

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.on('unmount', () => {
    var delName = expr.tag.opts.dataIs,
      tags = expr.tag.parent.tags,
      _tags = expr.tag._parent.tags
    arrayishRemove(tags, delName, expr.tag)
    arrayishRemove(_tags, delName, expr.tag)
    expr.tag.unmount()
  })
}

/**
 * Update on single tag expression
 * @this Tag
 * @param { Object } expr - expression logic
 * @returns { undefined }
 */
export function updateExpression(expr) {
  var dom = expr.dom,
    attrName = expr.attr,
    isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName),
    value = tmpl(expr.expr, this),
    isValueAttr = attrName === 'riot-value',
    isVirtual = expr.root && expr.root.tagName === 'VIRTUAL',
    parent = dom && (expr.parent || dom.parentNode),
    old

  if (expr.bool)
    value = value ? attrName : false
  else if (isUndefined(value) || value === null)
    value = ''

  if (expr._riot_id) { // if it's a tag
    if (expr.isMounted) {
      expr.update()

    // if it hasn't been mounted yet, do that now.
    } else {
      expr.mount()

      if (isVirtual) {
        var frag = document.createDocumentFragment()
        makeVirtual.call(expr, frag)
        expr.root.parentElement.replaceChild(frag, expr.root)
      }
    }
    return
  }

  old = expr.value
  expr.value = value

  if (expr.update) {
    expr.update()
    return
  }

  if (expr.isRtag && value) return updateDataIs(expr, this)
  if (old === value) return
  // no change, so nothing more to do
  if (isValueAttr && dom.value === value) return

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

  // remove original attribute
  if (!expr.isAttrRemoved || !value) {
    remAttr(dom, attrName)
    expr.isAttrRemoved = true
  }

  // event handler
  if (isFunction(value)) {
    setEventHandler(attrName, value, dom, this)
  // show / hide
  } else if (isToggle) {
    if (attrName === HIDE_DIRECTIVE) value = !value
    dom.style.display = value ? '' : 'none'
  // field value
  } else if (isValueAttr) {
    dom.value = value
  // <img src="{ expr }">
  } else if (startsWith(attrName, ATTRS_PREFIX) && attrName !== IS_DIRECTIVE) {
    attrName = attrName.slice(ATTRS_PREFIX.length)
    if (CASE_SENSITIVE_ATTRIBUTES[attrName])
      attrName = CASE_SENSITIVE_ATTRIBUTES[attrName]
    if (value != null)
      setAttr(dom, attrName, value)
  } else {
    // <select> <option selected={true}> </select>
    if (attrName === 'selected' && parent && /^(SELECT|OPTGROUP)$/.test(parent.tagName) && value) {
      parent.value = dom.value
    } if (expr.bool) {
      dom[attrName] = value
      if (!value) return
    } if (value === 0 || value && typeof value !== T_OBJECT) {
      setAttr(dom, attrName, value)
    }
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
