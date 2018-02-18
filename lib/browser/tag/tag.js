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
  const opts = extend({}, conf.opts)
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
  const expressions = []
  const root = conf.root
  const tagName = conf.tagName || getTagName(root)
  const isVirtual = tagName === 'virtual'
  const isInline = !isVirtual && !impl.tmpl
  let dom

  // make this tag observable
  if (!skipAnonymous) observable(tag)
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  // not yet mounted
  define(tag, 'isMounted', false)

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

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  define(tag, '_riot_id', uid()) // base 1 allows test !t._riot_id
  define(tag, 'root', root)
  extend(tag, { opts }, item)
  // protect the "tags" and "refs" property from being overridden
  define(tag, 'parent', parent || null)
  define(tag, 'tags', {})
  define(tag, 'refs', {})

  if (isInline || isLoop && isAnonymous) {
    dom = root
  } else {
    if (!isVirtual) root.innerHTML = ''
    dom = mkdom(impl.tmpl, innerHTML, isSvg(root))
  }

  define(tag, 'update', (data) => componentUpdate(tag, data, expressions))
  define(tag, 'mixin', (...mixins) => componentMixin(tag, ...mixins))
  define(tag, 'mount', () => componentMount(tag, dom, expressions, opts))
  define(tag, 'unmount', (mustKeepRoot) => componentUnmount(tag, mustKeepRoot, expressions))

  return tag
}
