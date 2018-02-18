import update from '../update'
import extend from './../../common/util/misc/extend'
import isFunction from './../../common/util/checks/is-function'
import updateOpts from './../../common/util/tags/update-options'

/**
 * Update the tag expressions and options
 * @param { Tag } tag - tag object
 * @param { * } data - data we want to use to extend the tag properties
 * @param { Array } expressions - component expressions array
 * @returns { Tag } the current tag instance
 */
export default function componentUpdate(tag, data, expressions) {
  const __ = tag.__
  const nextOpts = {}
  const canTrigger = tag.isMounted && !__.skipAnonymous

  // inherit properties from the parent tag
  if (__.isAnonymous && __.parent) extend(tag, __.parent)
  extend(tag, data)

  updateOpts.apply(tag, [__.isLoop, __.parent, __.isAnonymous, nextOpts, __.instAttrs])

  if (
    canTrigger &&
    tag.isMounted &&
    isFunction(tag.shouldUpdate) && !tag.shouldUpdate(data, nextOpts)
  ) {
    return tag
  }

  extend(tag.opts, nextOpts)

  if (canTrigger) tag.trigger('update', data)
  update.call(tag, expressions)
  if (canTrigger) tag.trigger('updated')

  return tag
}