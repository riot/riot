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
  var ptag = this.__.parent,
    item = this.__.item

  if (!item)
    while (ptag && !item) {
      item = ptag.__.item
      ptag = ptag.__.parent
    }

  // override the event properties
  /* istanbul ignore next */
  if (isWritable(e, 'currentTarget')) e.currentTarget = dom
  /* istanbul ignore next */
  if (isWritable(e, 'target')) e.target = e.srcElement
  /* istanbul ignore next */
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
