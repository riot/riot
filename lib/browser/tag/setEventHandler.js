import isWritable from './../common/util/checks/is-writable'
import contains from './../common/util/misc/contains'
import { RE_EVENTS_PREFIX, RIOT_EVENTS_KEY } from '../common/global-variables'
import getImmediateCustomParent from './../common/util/tags/get-immediate-custom-parent'
import settings from '../../settings'

/**
 * Trigger DOM events
 * @param   { HTMLElement } dom - dom element target of the event
 * @param   { Function } handler - user function
 * @param   { Object } e - event object
 */
function handleEvent(dom, handler, e) {
  let ptag = this.__.parent
  let item = this.__.item

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

  // avoid auto updates
  if (!settings.autoUpdate) return

  if (!e.preventUpdate) {
    const p = getImmediateCustomParent(this)
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
  let eventName
  const cb = handleEvent.bind(tag, dom, handler)

  // avoid to bind twice the same event
  // possible fix for #2332
  dom[name] = null

  // normalize event name
  eventName = name.replace(RE_EVENTS_PREFIX, '')

  // cache the listener into the listeners array
  if (!contains(tag.__.listeners, dom)) tag.__.listeners.push(dom)
  if (!dom[RIOT_EVENTS_KEY]) dom[RIOT_EVENTS_KEY] = {}
  if (dom[RIOT_EVENTS_KEY][name]) dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][name])

  dom[RIOT_EVENTS_KEY][name] = cb
  dom.addEventListener(eventName, cb, false)
}
