import { isWritable } from './../common/util/check'
import { getImmediateCustomParentTag } from './../common/util/tags'

const EVENTS_PREFIX_REGEX = /^on/

/**
 * Trigger DOM events
 * @param   { HTMLElement } dom - dom element target of the event
 * @param   { Function } handler - user function
 * @param   { Object } e - event object
 */
function handleEvent(dom, handler, e) {
  var ptag = this._parent,
    item = this._item

  if (!item)
    while (ptag && !item) {
      item = ptag._item
      ptag = ptag._parent
    }

  // override the event properties
  if (isWritable(e, 'currentTarget')) e.currentTarget = dom
  if (isWritable(e, 'target')) e.target = e.srcElement
  if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

  e.item = item

  handler.call(this, e)

  if (!e.preventUpdate) {
    var p = getImmediateCustomParentTag(this)
    // fixes #2083
    if (p.isMounted) p.update()
  }
}

/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
export default function setEventHandler(name, handler, dom, tag) {
  var eventName,
    cb = handleEvent.bind(tag, dom, handler)

  if (!dom.addEventListener) {
    dom[name] = cb
    return
  }

  // avoid to bind twice the same event
  dom[name] = null

  // normalize event name
  eventName = name.replace(EVENTS_PREFIX_REGEX, '')

  // cache the callback directly on the DOM node
  if (!dom._riotEvents) dom._riotEvents = {}

  if (dom._riotEvents[name])
    dom.removeEventListener(eventName, dom._riotEvents[name])

  dom._riotEvents[name] = cb
  dom.addEventListener(eventName, cb, false)
}
