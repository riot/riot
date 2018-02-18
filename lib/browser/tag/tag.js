import observable from 'riot-observable'
import { parseExpressions, parseAttributes } from './parse'
import RefExpr from './ref'
import update, { updateExpression } from './update'
import mkdom from './mkdom'
import { mixin } from './core'
import settings from '../../settings'

import {
  GLOBAL_MIXIN,
  __TAGS_CACHE,
  ATTRS_PREFIX,
  RIOT_EVENTS_KEY
} from './../common/global-variables'

import setAttribute from './../common/util/dom/set-attribute'
import removeAttribute from './../common/util/dom/remove-attribute'
import walkAttributes from './../common/util/dom/walk-attributes'
import setInnerHTML from './../common/util/dom/set-inner-HTML'

import isSvg from './../common/util/checks/is-svg'
import isString from './../common/util/checks/is-string'
import isFunction from './../common/util/checks/is-function'

import extend from './../common/util/misc/extend'
import each from './../common/util/misc/each'
import uid from './../common/util/misc/uid'
import toCamel from './../common/util/misc/to-camel'
import contains from './../common/util/misc/contains'
import startsWith from './../common/util/misc/starts-with'
import define from './../common/util/misc/define'
import getPropDescriptor from './../common/util/misc/get-prop-descriptor'

import unmountAll from './../common/util/tags/unmount-all'
import getTagName from './../common/util/tags/get-name'
import arrayishRemove from './../common/util/tags/arrayish-remove'
import inheritParentProps from './../common/util/tags/inherit-parent-properties'
import getImmediateCustomParent from './../common/util/tags/get-immediate-custom-parent'

/**
 * We need to update opts for this tag. That requires updating the expressions
 * in any attributes on the tag, and then copying the result onto opts.
 * @this Tag
 * @param   {Boolean} isLoop - is it a loop tag?
 * @param   { Tag }  parent - parent tag node
 * @param   { Boolean }  isAnonymous - is it a tag without any impl? (a tag not registered)
 * @param   { Object }  opts - tag options
 * @param   { Array }  instAttrs - tag attributes array
 */
function updateOpts(isLoop, parent, isAnonymous, opts, instAttrs) {
  // isAnonymous `each` tags treat `dom` and `root` differently. In this case
  // (and only this case) we don't need to do updateOpts, because the regular parse
  // will update those attrs. Plus, isAnonymous tags don't need opts anyway
  if (isLoop && isAnonymous) return
  const ctx = isLoop ? inheritParentProps.call(this) : parent || this

  each(instAttrs, (attr) => {
    if (attr.expr) updateExpression.call(ctx, attr.expr)
    // normalize the attribute names
    opts[toCamel(attr.name).replace(ATTRS_PREFIX, '')] = attr.expr ? attr.expr.value : attr.value
  })
}

/**
 * Manage the mount state of a tag triggering also the observable events
 * @this Tag
 * @param { Boolean } value - ..of the isMounted flag
 */
function setMountState(value) {
  const { isAnonymous } = this.__

  define(this, 'isMounted', value)

  if (!isAnonymous) {
    if (value) this.trigger('mount')
    else {
      this.trigger('unmount')
      this.off('*')
      this.__.wasCreated = false
    }
  }
}


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
    isAnonymous,
    instAttrs,
    innerHTML,
    tagName,
    index,
    isLoop,
    isInline,
    // tags having event listeners
    // it would be better to use weak maps here but we can not introduce breaking changes now
    listeners: [],
    // these vars will be needed only for the virtual tags
    virts: [],
    wasCreated: false,
    tail: null,
    head: null,
    parent: null,
    item: null
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

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { Tag } the current tag instance
   */
  define(tag, 'update', function tagUpdate(data) {
    const nextOpts = {}
    const canTrigger = tag.isMounted && !skipAnonymous

    // inherit properties from the parent tag
    if (isAnonymous && parent) extend(tag, parent)
    extend(tag, data)

    updateOpts.apply(tag, [isLoop, parent, isAnonymous, nextOpts, instAttrs])

    if (
      canTrigger &&
      tag.isMounted &&
      isFunction(tag.shouldUpdate) && !tag.shouldUpdate(data, nextOpts)
    ) {
      return tag
    }

    extend(opts, nextOpts)

    if (canTrigger) tag.trigger('update', data)
    update.call(tag, expressions)
    if (canTrigger) tag.trigger('updated')

    return tag
  })

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  define(tag, 'mixin', function tagMixin() {
    each(arguments, (mix) => {
      let instance
      let obj
      let props = []

      // properties blacklisted and will not be bound to the tag instance
      const propsBlacklist = ['init', '__proto__']

      mix = isString(mix) ? mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
      } else instance = mix

      const proto = Object.getPrototypeOf(instance)

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance))
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, (key) => {
        // bind methods to tag
        // allow mixins to override other properties/parent mixins
        if (!contains(propsBlacklist, key)) {
          // check for getters/setters
          const descriptor = getPropDescriptor(instance, key) || getPropDescriptor(proto, key)
          const hasGetterSetter = descriptor && (descriptor.get || descriptor.set)

          // apply method only if it does not already exist on the instance
          if (!tag.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(tag, key, descriptor)
          } else {
            tag[key] = isFunction(instance[key]) ?
              instance[key].bind(tag) :
              instance[key]
          }
        }
      })

      // init method will be called automatically
      if (instance.init)
        instance.init.bind(tag)(opts)
    })

    return tag
  })

  /**
   * Mount the current tag instance
   * @returns { Tag } the current tag instance
   */
  define(tag, 'mount', function tagMount() {
    root._tag = tag // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes.apply(parent, [root, root.attributes, (attr, expr) => {
      if (!isAnonymous && RefExpr.isPrototypeOf(expr)) expr.tag = tag
      attr.expr = expr
      instAttrs.push(attr)
    }])

    // update the root adding custom attributes coming from the compiler
    walkAttributes(impl.attrs, (k, v) => { implAttrs.push({name: k, value: v}) })
    parseAttributes.apply(tag, [root, implAttrs, (attr, expr) => {
      if (expr) expressions.push(expr)
      else setAttribute(root, attr.name, attr.value)
    }])

    // initialiation
    updateOpts.apply(tag, [isLoop, parent, isAnonymous, opts, instAttrs])

    // add global mixins
    const globalMixin = mixin(GLOBAL_MIXIN)

    if (globalMixin && !skipAnonymous) {
      for (const i in globalMixin) {
        if (globalMixin.hasOwnProperty(i)) {
          tag.mixin(globalMixin[i])
        }
      }
    }

    if (impl.fn) impl.fn.call(tag, opts)

    if (!skipAnonymous) tag.trigger('before-mount')

    // parse layout after init. fn may calculate args for nested custom tags
    each(parseExpressions.apply(tag, [dom, isAnonymous]), e => expressions.push(e))

    tag.update(item)

    if (!isAnonymous && !isInline) {
      while (dom.firstChild) root.appendChild(dom.firstChild)
    }

    define(tag, 'root', root)

    // if we need to wait that the parent "mount" or "updated" event gets triggered
    if (!skipAnonymous && tag.parent) {
      const p = getImmediateCustomParent(tag.parent)
      p.one(!p.isMounted ? 'mount' : 'updated', () => {
        setMountState.call(tag, true)
      })
    } else {
      // otherwise it's not a child tag we can trigger its mount event
      setMountState.call(tag, true)
    }

    tag.__.wasCreated = true

    return tag

  })

  /**
   * Unmount the tag instance
   * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
   * @returns { Tag } the current tag instance
   */
  define(tag, 'unmount', function tagUnmount(mustKeepRoot) {
    const el = tag.root
    const p = el.parentNode
    const tagIndex = __TAGS_CACHE.indexOf(tag)

    if (!skipAnonymous) tag.trigger('before-unmount')

    // clear all attributes coming from the mounted tag
    walkAttributes(impl.attrs, (name) => {
      if (startsWith(name, ATTRS_PREFIX))
        name = name.slice(ATTRS_PREFIX.length)

      removeAttribute(root, name)
    })

    // remove all the event listeners
    tag.__.listeners.forEach((dom) => {
      Object.keys(dom[RIOT_EVENTS_KEY]).forEach((eventName) => {
        dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][eventName])
      })
    })

    // remove tag instance from the global tags cache collection
    if (tagIndex !== -1) __TAGS_CACHE.splice(tagIndex, 1)

    // clean up the parent tags object
    if (parent && !isAnonymous) {
      const ptag = getImmediateCustomParent(parent)

      if (isVirtual) {
        Object
          .keys(tag.tags)
          .forEach(tagName => arrayishRemove(ptag.tags, tagName, tag.tags[tagName]))
      } else {
        arrayishRemove(ptag.tags, tagName, tag)
      }
    }

    // unmount all the virtual directives
    if (tag.__.virts) {
      each(tag.__.virts, (v) => {
        if (v.parentNode) v.parentNode.removeChild(v)
      })
    }

    // allow expressions to unmount themselves
    unmountAll(expressions)
    each(instAttrs, a => a.expr && a.expr.unmount && a.expr.unmount())

    // clear the tag html if it's necessary
    if (mustKeepRoot) setInnerHTML(el, '')
    // otherwise detach the root tag from the DOM
    else if (p) p.removeChild(el)

    // custom internal unmount function to avoid relying on the observable
    if (tag.__.onUnmount) tag.__.onUnmount()

    // weird fix for a weird edge case #2409 and #2436
    // some users might use your software not as you've expected
    // so I need to add these dirty hacks to mitigate unexpected issues
    if (!tag.isMounted) setMountState.call(tag, true)

    setMountState.call(tag, false)

    delete tag.root._tag

    return tag
  })

  return tag
}
