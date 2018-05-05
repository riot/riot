import observable from 'riot-observable'
import mkdom from './mkdom'
import settings from '../../settings'
import isSvg from './../common/util/checks/is-svg'
import extend from './../common/util/misc/extend'
import uid from './../common/util/misc/uid'
import define from './../common/util/misc/define'
import getTagName from './../common/util/tags/get-name'
import componentUpdate from './component/update'
import componentMixin from './component/mixin'
import componentMount from './component/mount'
import componentUnmount from './component/unmount'

/**
 * Tag creation factory function
 * @constructor
 * @param { Object } impl - it contains the tag template, and logic
 * @param { Object } conf - tag options
 * @param { String } innerHTML - html that eventually we need to inject in the tag
 */
export default function createTag(impl = {}, conf = {}, innerHTML) {
  const tag = conf.context || {}
  const opts = conf.opts || {}
  const parent = conf.parent
  const isLoop = conf.isLoop
  const isAnonymous = !!conf.isAnonymous
  const skipAnonymous = settings.skipAnonymousTags && isAnonymous
  const item = conf.item
  // available only for the looped nodes
  const index = conf.index
  // All attributes on the Tag when it's first parsed
  const instAttrs = []
  // expressions on this type of Tag
  const implAttrs = []
  const tmpl = impl.tmpl
  const expressions = []
  const root = conf.root
  const tagName = conf.tagName || getTagName(root)
  const isVirtual = tagName === 'virtual'
  const isInline = !isVirtual && !tmpl
  let dom

  if (isInline || isLoop && isAnonymous) {
    dom = root
  } else {
    if (!isVirtual) root.innerHTML = ''
    dom = mkdom(tmpl, innerHTML, isSvg(root))
  }

  // make this tag observable
  if (!skipAnonymous) observable(tag)

  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  define(tag, '__', {
    impl,
    root,
    skipAnonymous,
    implAttrs,
    isAnonymous,
    instAttrs,
    innerHTML,
    tagName,
    index,
    isLoop,
    isInline,
    item,
    parent,
    // tags having event listeners
    // it would be better to use weak maps here but we can not introduce breaking changes now
    listeners: [],
    // these vars will be needed only for the virtual tags
    virts: [],
    wasCreated: false,
    tail: null,
    head: null
  })

  // tag protected properties
  return [
    ['isMounted', false],
    // create a unique id to this tag
    // it could be handy to use it also to improve the virtual dom rendering speed
    ['_riot_id', uid()],
    ['root', root],
    ['opts', opts, { writable: true, enumerable: true }],
    ['parent', parent || null],
    // protect the "tags" and "refs" property from being overridden
    ['tags', {}],
    ['refs', {}],
    ['update', data => componentUpdate(tag, data, expressions)],
    ['mixin', (...mixins) => componentMixin(tag, ...mixins)],
    ['mount', () => componentMount(tag, dom, expressions, opts)],
    ['unmount', mustKeepRoot => componentUnmount(tag, mustKeepRoot, expressions)]
  ].reduce((acc, [key, value, opts]) => {
    define(tag, key, value, opts)
    return acc
  }, extend(tag, item))
}
