import {
  __TAG_IMPL,
  __TAGS_CACHE,
} from './../../global-variables'
import extend from '../misc/extend'
import contains from '../misc/contains'
import create from '../misc/object-create'
import createTag from './../../../tag/tag'

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @param   { Object } ctx - optional context that will be used to extend an existing class ( used in riot.Tag )
 * @returns { Tag } a new Tag instance
 */
export default function mount(root, tagName, opts, ctx) {
  const impl = __TAG_IMPL[tagName]
  const implClass = __TAG_IMPL[tagName].class
  const context = ctx || (implClass ? create(implClass.prototype) : {})
  // cache the inner HTML to fix #855
  const innerHTML = root._innerHTML = root._innerHTML || root.innerHTML
  const conf = extend({ root, opts, context }, { parent: opts ? opts.parent : null })
  let tag

  if (impl && root) tag = createTag(impl, conf, innerHTML)

  if (tag && tag.mount) {
    tag.mount(true)
    // add this tag to the virtualDom variable
    if (!contains(__TAGS_CACHE, tag)) __TAGS_CACHE.push(tag)
  }

  return tag
}