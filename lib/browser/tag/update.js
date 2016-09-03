import { tmpl } from 'riot-tmpl'
import { startsWith, each } from './../common/util/misc'
import { isFunction, isArray, isWritable } from './../common/util/check'
import { remAttr, setAttr } from './../common/util/dom'

import {
  getImmediateCustomParentTag,
  initChildTag,
  makeVirtual,
  arrayishRemove
} from './../common/util/tags'

import {
  RIOT_PREFIX,
  T_OBJECT,
  RIOT_TAG_IS,
  WIN,
  __TAG_IMPL,
  IE_VERSION
} from './../common/global-variables'

/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
export function setEventHandler(name, handler, dom, tag) {
  var handleEvent = function(e) {
    var ptag = tag._parent,
      item = tag._item

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag._parent
      }

    // cross browser event fix
    e = e || WIN.event

    // override the event properties
    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
    if (isWritable(e, 'target')) e.target = e.srcElement
    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

    e.item = item

    handler.call(tag, e)

    if (!e.preventUpdate) {
      getImmediateCustomParentTag(tag).update()
    }

  }

  if (!dom.addEventListener) {
    dom[name] = handleEvent
    return
  }

  var eventName = name.replace(/^on/, '')

  if (dom._eventHandlers && dom._eventHandlers[eventName])
    dom.removeEventListener(eventName, dom._eventHandlers[eventName])

  if (!dom._eventHandlers) dom._eventHandlers = {}

  dom._eventHandlers[eventName] = handleEvent
  dom.addEventListener(eventName, handleEvent, false)
}

/**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
export default function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      isValueAttr = attrName == 'value',
      isVirtual = expr.root && expr.root.tagName == 'VIRTUAL',
      parent = dom && (expr.parent || dom.parentNode)

    if (expr.bool)
      value = value ? attrName : false
    else if (value == null)
      value = ''

    if (expr._riot_id) { // if it's a tag
      if (expr.isMounted) {
        expr.update()

      // if it hasn't been mounted yet, do that now.
      } else {
        expr.mount()

        if (isVirtual) {
          var frag = document.createDocumentFragment()
          makeVirtual(expr, frag)
          expr.root.parentElement.replaceChild(frag, expr.root)
        }
      }
      return
    }

    if (expr.update) {
      expr.update()
      return
    }

    var old = expr.value
    expr.value = value

    if (expr.isRtag && value) return updateRtag(expr, tag)

    // no change, so nothing more to do
    if (
      isValueAttr && dom.value == value || // was the value of this dom node changed?
      !isValueAttr && old === value // was the old value still the same?
    ) return

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
    remAttr(dom, attrName)

    // event handler
    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    // show / hide
    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attrName == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG_IS) {

      if (value)
        setAttr(dom, attrName.slice(RIOT_PREFIX.length), value)

    } else {
      // <select> <option selected={true}> </select>
      if (attrName == 'selected' && parent && /^(SELECT|OPTGROUP)$/.test(parent.nodeName) && value)
        parent.value = dom.value

      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
      }

      if (value === 0 || value && typeof value !== T_OBJECT)
        setAttr(dom, attrName, value)

    }

  })

}

/**
 * Update dynamically created riot-tag with changing expressions
 * @param   { Object } expr - expression tag and expression info
 * @param   { Tag } parent - parent for tag creation
 */

function updateRtag(expr, parent) {
  var tagName = tmpl(expr.value, parent),
    conf

  if (expr.tag && expr.tagName == tagName) {
    expr.tag.update()
    return
  }

  // sync _parent to accommodate changing tagnames
  if (expr.tag) {
    var delName = expr.tag.opts.dataIs,
      tags = expr.tag._parent.tags

    arrayishRemove(tags, delName, expr.tag)

  }

  expr.impl = __TAG_IMPL[tagName]
  conf = {root: expr.dom, parent: parent, hasImpl: true, tagName: tagName}
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent)
  expr.tagName = tagName
  expr.tag.mount()
  expr.tag.update()

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
