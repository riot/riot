import observable from 'riot-observable'
import { parseExpressions, parseAttributes } from './parse'
import RefExpr from './ref'
import update from './update'
import { tmpl } from 'riot-tmpl'
import mkdom from './mkdom'
import { mixin } from './core'
import { setAttr, remAttr, walkAttrs } from './../common/util/dom'

import {
  isUndefined,
  isFunction,
  isString,
  isReservedName,
  isObject,
  isWritable
} from './../common/util/check'

import {
  extend,
  each,
  toCamel,
  contains,
  defineProperty,
  inherit
} from './../common/util/misc'

import {
  cleanUpData,
  isInStub,
  unmountAll,
  arrayishRemove,
  getImmediateCustomParentTag
} from './../common/util/tags'

import {
  GLOBAL_MIXIN,
  T_FUNCTION,
  T_UNDEF,
  T_STRING,
  RE_RESERVED_NAMES,
  __VIRTUAL_DOM,
  RIOT_TAG_IS
} from './../common/global-variables'

// counter to give a unique id to all the Tag instances
var __uid = 0

export default function Tag(impl, conf, innerHTML) {

  var opts = inherit(conf.opts),
    parent = conf.parent,
    isLoop = conf.isLoop,
    anonymous = conf.anonymous,
    item = cleanUpData(conf.item),
    instAttrs = [], // All attributes on the Tag when it's first parsed
    implAttrs = [], // expressions on this type of Tag
    expressions = [],
    root = conf.root,
    tagName = conf.tagName || root.tagName.toLowerCase(),
    propsInSyncWithParent = [],
    dom

  // make this tag observable
  observable(this)
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  // not yet mounted
  this.isMounted = false
  root.isLoop = isLoop
  this._internal = {
    anonymous: anonymous,
    origAttrs: instAttrs,
    innerHTML: innerHTML
  }

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id

  extend(this, { parent, root, opts }, item)
  // protect the "tags" and "refs" property from being overridden
  defineProperty(this, 'tags', {})
  defineProperty(this, 'refs', {})

  dom = mkdom(impl.tmpl, innerHTML)

  // We need to update opts for this tag. That requires updating the expressions
  // in any attributes on the tag, and then copying the result onto opts.
  function updateOpts() {
    // anonymous `each` tags treat `dom` and `root` differently. In this case
    // (and only this case) we don't need to do updateOpts, because the regular parse
    // will update those attrs. Plus, anonymous tags don't need opts anyway
    if (isLoop && anonymous) return

    var ctx = !anonymous && isLoop ? this : parent || this
    each(instAttrs, (attr) => {
      if (attr.expr) update([attr.expr], ctx)
      opts[toCamel(attr.name)] = attr.expr ? attr.expr.value : attr.value
    })
  }

  function inheritFrom(target) {
    each(Object.keys(target), (k) => {
      // some properties must be always in sync with the parent tag
      var mustSync = !isReservedName(k) && contains(propsInSyncWithParent, k)

      if (isUndefined(this[k]) || mustSync) {
        // track the property to keep in sync
        // so we can keep it updated
        if (!mustSync) propsInSyncWithParent.push(k)
        this[k] = target[k]
      }
    })
  }

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { this }
   */
  defineProperty(this, 'update', function tagUpdate(data) {
    if (isFunction(this.shouldUpdate) && !this.shouldUpdate()) return

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)

    // inherit properties from the parent, but only for anonymous tags
    if (isLoop && anonymous) inheritFrom.call(this, this.parent)

    extend(this, data)
    updateOpts.call(this)
    if (this.isMounted) this.trigger('update', data)
    update(expressions, this)
    if (this.isMounted) this.trigger('updated')

    return this

  })

  defineProperty(this, 'mixin', function tagMixin() {
    each(arguments, (mix) => {
      var instance,
        props = [],
        obj

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
        if (key != 'init') {
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
  })

  defineProperty(this, 'mount', function tagMount(forceUpdate) {
    root._tag = this // keep a reference to the tag just created

    // add global mixins
    var globalMixin = mixin(GLOBAL_MIXIN)

    if (globalMixin)
      for (var i in globalMixin)
        if (globalMixin.hasOwnProperty(i))
          this.mixin(globalMixin[i])

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes(root, root.attributes, parent, (attr, expr) => {
      if (!anonymous && RefExpr.isPrototypeOf(expr)) expr.tag = this
      attr.expr = expr
      instAttrs.push(attr)
    })

    // children in loop should inherit from true parent
    if (this._parent && anonymous) inheritFrom.call(this, this._parent)


    // initialiation
    updateOpts.call(this)
    if (impl.fn) impl.fn.call(this, opts)

    // update the root adding custom attributes coming from the compiler
    implAttrs = []
    walkAttrs(impl.attrs, (k, v) => { implAttrs.push({name: k, value: v}) })
    parseAttributes(root, implAttrs, this, (attr, expr) => {
      if (expr) expressions.push(expr)
      else setAttr(root, attr.name, attr.value)
    })

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, this, expressions, false)

    this.update(item)

    // internal use only, fixes #403
    this.trigger('before-mount')

    if (isLoop && anonymous) {
      // update the root attribute for the looped elements
      this.root = root = dom.firstChild
    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) root = parent.root
    }

    defineProperty(this, 'root', root)
    this.isMounted = true

    // if it's not a child tag we can trigger its mount event
    if (!this.parent || this.parent.isMounted) {
      this.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else this.parent.one('mount', () => {
      this.trigger('mount')
    })
  })


  defineProperty(this, 'unmount', function tagUnmount(keepRootTag) {
    var el = this.root,
      p = el.parentNode,
      ptag,
      tagIndex = __VIRTUAL_DOM.indexOf(this)

    this.trigger('before-unmount')

    // remove this tag instance from the global virtualDom variable
    if (~tagIndex)
      __VIRTUAL_DOM.splice(tagIndex, 1)

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)
        arrayishRemove(ptag.tags, tagName, this)
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else
        // the riot-tag and the data-is attributes aren't needed anymore, remove them
        remAttr(p, RIOT_TAG_IS)

    }

    if (this._virts) {
      each(this._virts, (v) => {
        if (v.parentNode) v.parentNode.removeChild(v)
      })
    }

    // allow expressions to unmount themselves
    unmountAll(expressions)
    each(instAttrs, a => a.expr && a.expr.unmount && a.expr.unmount())

    this.trigger('unmount')
    this.off('*')
    this.isMounted = false
    delete this.root._tag

    if (this.root._eventHandlers) {
      each(Object.keys(this.root._eventHandlers), (eventName) => {
        this.root.removeEventListener(eventName, this.root._eventHandlers[eventName])
      })
      delete this.root._eventHandlers
    }
  })
}
