import observable from 'riot-observable'
import { parseExpressions, parseAttributes } from './parse'
import RefExpr from './ref'
import update from './update'
import mkdom from './mkdom'
import { mixin } from './core'
import settings from '../../settings'
import { setAttr, remAttr, walkAttrs, setInnerHTML } from './../common/util/dom'

import {
  isFunction,
  isString
} from './../common/util/check'

import {
  extend,
  each,
  startsWith,
  toCamel,
  contains,
  defineProperty
} from './../common/util/misc'

import {
  cleanUpData,
  unmountAll,
  arrayishRemove,
  inheritFrom,
  getTagName,
  getImmediateCustomParentTag
} from './../common/util/tags'

import {
  RIOT_EVENTS_KEY,
  GLOBAL_MIXIN,
  __TAGS_CACHE,
  ATTRS_PREFIX
} from './../common/global-variables'

// counter to give a unique id to all the Tag instances
var __uid = 0

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

  var ctx = !isAnonymous && isLoop ? this : parent || this
  each(instAttrs, (attr) => {
    if (attr.expr) update.call(ctx, [attr.expr])
    // normalize the attribute names
    opts[toCamel(attr.name).replace(ATTRS_PREFIX, '')] = attr.expr ? attr.expr.value : attr.value
  })
}


/**
 * Tag class
 * @constructor
 * @param { Object } impl - it contains the tag template, and logic
 * @param { Object } conf - tag options
 * @param { String } innerHTML - html that eventually we need to inject in the tag
 */
export default function Tag(impl = {}, conf = {}, innerHTML) {
  var opts = extend({}, conf.opts),
    parent = conf.parent,
    isLoop = conf.isLoop,
    isAnonymous = !!conf.isAnonymous,
    skipAnonymous = settings.skipAnonymousTags && isAnonymous,
    item = cleanUpData(conf.item),
    index = conf.index, // available only for the looped nodes
    instAttrs = [], // All attributes on the Tag when it's first parsed
    implAttrs = [], // expressions on this type of Tag
    expressions = [],
    root = conf.root,
    tagName = conf.tagName || getTagName(root),
    isVirtual = tagName === 'virtual',
    propsInSyncWithParent = [],
    dom

  // make this tag observable
  if (!skipAnonymous) observable(this)
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  // not yet mounted
  this.isMounted = false

  defineProperty(this, '__', {
    isAnonymous,
    instAttrs,
    innerHTML,
    tagName,
    index,
    isLoop,
    // tags having event listeners
    // it would be better to use weak maps here but we can not introduce breaking changes now
    listeners: [],
    // these vars will be needed only for the virtual tags
    virts: [],
    tail: null,
    head: null,
    parent: null,
    item: null
  })

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id
  defineProperty(this, 'root', root)
  extend(this, { opts }, item)
  // protect the "tags" and "refs" property from being overridden
  defineProperty(this, 'parent', parent || null)
  defineProperty(this, 'tags', {})
  defineProperty(this, 'refs', {})

  dom = isLoop && isAnonymous ? root : mkdom(impl.tmpl, innerHTML, isLoop)

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'update', function tagUpdate(data) {
    const nextOpts = {},
      canTrigger = this.isMounted && !skipAnonymous

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    extend(this, data)
    updateOpts.apply(this, [isLoop, parent, isAnonymous, nextOpts, instAttrs])

    if (canTrigger && this.isMounted && isFunction(this.shouldUpdate) && !this.shouldUpdate(data, nextOpts)) {
      return this
    }

    // inherit properties from the parent, but only for isAnonymous tags
    if (isLoop && isAnonymous) inheritFrom.apply(this, [this.parent, propsInSyncWithParent])
    extend(opts, nextOpts)
    if (canTrigger) this.trigger('update', data)
    update.call(this, expressions)
    if (canTrigger) this.trigger('updated')

    return this

  }.bind(this))

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'mixin', function tagMixin() {
    each(arguments, (mix) => {
      let instance, obj
      let props = []

      // properties blacklisted and will not be bound to the tag instance
      const propsBlacklist = ['init', '__proto__']

      mix = isString(mix) ? mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
      } else instance = mix

      var proto = Object.getPrototypeOf(instance)

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance))
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, (key) => {
        // bind methods to this
        // allow mixins to override other properties/parent mixins
        if (!contains(propsBlacklist, key)) {
          // check for getters/setters
          var descriptor = Object.getOwnPropertyDescriptor(instance, key) || Object.getOwnPropertyDescriptor(proto, key)
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set)

          // apply method only if it does not already exist on the instance
          if (!this.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(this, key, descriptor)
          } else {
            this[key] = isFunction(instance[key]) ?
              instance[key].bind(this) :
              instance[key]
          }
        }
      })

      // init method will be called automatically
      if (instance.init)
        instance.init.bind(this)()
    })
    return this
  }.bind(this))

  /**
   * Mount the current tag instance
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'mount', function tagMount() {
    root._tag = this // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes.apply(parent, [root, root.attributes, (attr, expr) => {
      if (!isAnonymous && RefExpr.isPrototypeOf(expr)) expr.tag = this
      attr.expr = expr
      instAttrs.push(attr)
    }])

    // update the root adding custom attributes coming from the compiler
    implAttrs = []
    walkAttrs(impl.attrs, (k, v) => { implAttrs.push({name: k, value: v}) })
    parseAttributes.apply(this, [root, implAttrs, (attr, expr) => {
      if (expr) expressions.push(expr)
      else setAttr(root, attr.name, attr.value)
    }])

    // initialiation
    updateOpts.apply(this, [isLoop, parent, isAnonymous, opts, instAttrs])

    // add global mixins
    var globalMixin = mixin(GLOBAL_MIXIN)

    if (globalMixin && !skipAnonymous) {
      for (var i in globalMixin) {
        if (globalMixin.hasOwnProperty(i)) {
          this.mixin(globalMixin[i])
        }
      }
    }

    if (impl.fn) impl.fn.call(this, opts)

    if (!skipAnonymous) this.trigger('before-mount')

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions.apply(this, [dom, expressions, isAnonymous])

    this.update(item)

    if (!isAnonymous) {
      while (dom.firstChild) root.appendChild(dom.firstChild)
    }

    defineProperty(this, 'root', root)
    defineProperty(this, 'isMounted', true)

    if (skipAnonymous) return

    // if it's not a child tag we can trigger its mount event
    if (!this.parent) {
      this.trigger('mount')
    }
    // otherwise we need to wait that the parent "mount" or "updated" event gets triggered
    else {
      const p = getImmediateCustomParentTag(this.parent)
      p.one(!p.isMounted ? 'mount' : 'updated', () => {
        this.trigger('mount')
      })
    }

    return this

  }.bind(this))

  /**
   * Unmount the tag instance
   * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
   * @returns { Tag } the current tag instance
   */
  defineProperty(this, 'unmount', function tagUnmount(mustKeepRoot) {
    var el = this.root,
      p = el.parentNode,
      ptag,
      tagIndex = __TAGS_CACHE.indexOf(this)

    if (!skipAnonymous) this.trigger('before-unmount')

    // clear all attributes coming from the mounted tag
    walkAttrs(impl.attrs, (name) => {
      if (startsWith(name, ATTRS_PREFIX))
        name = name.slice(ATTRS_PREFIX.length)
      remAttr(root, name)
    })

    // remove all the event listeners
    this.__.listeners.forEach((dom) => {
      Object.keys(dom[RIOT_EVENTS_KEY]).forEach((eventName) => {
        dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][eventName])
      })
    })

    // remove this tag instance from the global virtualDom variable
    if (tagIndex !== -1)
      __TAGS_CACHE.splice(tagIndex, 1)

    if (p || isVirtual) {
      if (parent) {
        ptag = getImmediateCustomParentTag(parent)

        if (isVirtual) {
          Object.keys(this.tags).forEach(tagName => {
            arrayishRemove(ptag.tags, tagName, this.tags[tagName])
          })
        } else {
          arrayishRemove(ptag.tags, tagName, this)
          if(parent !== ptag) // remove from _parent too
            arrayishRemove(parent.tags, tagName, this)
        }
      } else {
        // remove the tag contents
        setInnerHTML(el, '')
      }

      if (p && !mustKeepRoot) p.removeChild(el)
    }

    if (this.__.virts) {
      each(this.__.virts, (v) => {
        if (v.parentNode) v.parentNode.removeChild(v)
      })
    }

    // allow expressions to unmount themselves
    unmountAll(expressions)
    each(instAttrs, a => a.expr && a.expr.unmount && a.expr.unmount())

    // custom internal unmount function to avoid relying on the observable
    if (this.__.onUnmount) this.__.onUnmount()

    if (!skipAnonymous) {
      this.trigger('unmount')
      this.off('*')
    }

    defineProperty(this, 'isMounted', false)

    delete this.root._tag

    return this

  }.bind(this))
}
