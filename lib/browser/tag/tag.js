import observable from 'riot-observable'
import { parseExpressions, parseAttributes } from './parse'
import NamedExpr from './named'
import update from './update'
import { tmpl } from 'riot-tmpl'
import mkdom from './mkdom'
import { mixin } from './core'

import {
  GLOBAL_MIXIN,
  __VIRTUAL_DOM,
  RIOT_TAG_IS,
  RIOT_TAG
} from './../common/global-variables'

import {
  isReservedName,
  isUndefined,
  isString,
  isFunction,
  isObject,
  isWritable,
  contains,
  inherit,
  cleanUpData,
  defineProperty,
  extend,
  each,
  walkAttrs,
  toCamel,
  setAttr,
  remAttr,
  unmountAll,
  arrayishRemove,
  getImmediateCustomParentTag
} from './../common/util'

// counter to give a unique id to all the Tag instances
var __uid = 0

export default function Tag(impl, conf, innerHTML) {

  var self = observable(this),
    opts = inherit(conf.opts) || {},
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

  extend(this, { parent: parent, root: root, opts: opts}, item)
  // protect the "tags" property from being overridden
  defineProperty(this, 'tags', {})

  dom = mkdom(impl.tmpl, innerHTML)

  // We need to update opts for this tag. That requires updating the expressions
  // in any attributes on the tag, and then copying the result onto opts.
  function updateOpts() {
    // anonymous `each` tags treat `dom` and `root` differently. In this case
    // (and only this case) we don't need to do updateOpts, because the regular parse
    // will update those attrs. Plus, anonymous tags don't need opts anyway
    if (isLoop && anonymous) return

    var ctx = !anonymous && isLoop ? self : parent || self
    each(instAttrs, function(attr) {
      if (attr.expr) update([attr.expr], ctx)
      opts[toCamel(attr.name)] = attr.expr ? attr.expr.value : attr.value
    })
  }

  function normalizeData(data) {
    for (var key in item) {
      if (!isUndefined(self[key]) && isWritable(self, key))
        self[key] = data[key]
    }
  }

  function inheritFromParent () {
    each(Object.keys(self.parent), function(k) {
      // some properties must be always in sync with the parent tag
      var mustSync = !isReservedName(k) && contains(propsInSyncWithParent, k)
      if (isUndefined(self[k]) || mustSync) {
        // track the property to keep in sync
        // so we can keep it updated
        if (!mustSync) propsInSyncWithParent.push(k)
        self[k] = self.parent[k]
      }
    })
  }

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { self }
   */
  defineProperty(this, 'update', function tagUpdate(data) {
    if (isFunction(self.shouldUpdate) && !self.shouldUpdate()) return

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    // inherit properties from the parent, but only for anonymous tags
    if (isLoop && anonymous) inheritFromParent()
    // normalize the tag properties in case an item object was initially passed
    if (data && isObject(item)) {
      normalizeData(data)
      item = data
    }
    extend(self, data)
    updateOpts()
    if (self.isMounted) self.trigger('update', data)
    update(expressions, self)
    if (self.isMounted) self.trigger('updated')

    return this

  })

  defineProperty(this, 'mixin', function tagMixin() {
    each(arguments, function(mix) {
      var instance
      var props = []
      var obj

      mix = isString(mix) ? mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
      } else instance = mix

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance))
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, function(key) {
        // bind methods to self (if not init or riot.observable functions)
        if (!isReservedName(key)) {
          const descriptor = Object.getOwnPropertyDescriptor(instance, key)
          const hasGetterSetter = descriptor && (descriptor.get || descriptor.set)

          // apply getter/setter
          if (hasGetterSetter)
            Object.defineProperty(self, key, descriptor)
          else
            self[key] = isFunction(instance[key]) ?
              instance[key].bind(self) :
              instance[key]
        }
      })

      // init method will be called automatically
      if (instance.init)
        instance.init.bind(self)()
    })
    return this
  })

  defineProperty(this, 'mount', function tagMount(forceUpdate) {
    root._tag = this // keep a reference to the tag just created

    // add global mixin
    var globalMixin = mixin(GLOBAL_MIXIN)
    if (globalMixin)
      for (var i in globalMixin)
        if (globalMixin.hasOwnProperty(i))
          self.mixin(globalMixin[i])

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes(root, root.attributes, parent, function(attr, expr) {
      if (!anonymous && expr instanceof NamedExpr) expr.tag = self
      attr.expr = expr
      instAttrs.push(attr)
    })

    // initialiation
    updateOpts()
    if (impl.fn) impl.fn.call(self, opts)

    // update the root adding custom attributes coming from the compiler
    implAttrs = []
    walkAttrs(impl.attrs, function (k, v) { implAttrs.push({name: k, value: v}) })
    parseAttributes(root, implAttrs, self, function(attr, expr) {
      if (expr) expressions.push(expr)
      else setAttr(root, attr.name, attr.value)
    })

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions, false)
    self.update(item)

    // internal use only, fixes #403
    self.trigger('before-mount')

    if (isLoop && anonymous) {
      // update the root attribute for the looped elements
      self.root = root = dom.firstChild
    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) self.root = root = parent.root
    }

    defineProperty(self, 'root', root)
    self.isMounted = true


    // if it's not a child tag we can trigger its mount event
    if (!self.parent || self.parent.isMounted) {
      self.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else self.parent.one('mount', function() {
      self.trigger('mount')
    })
  })


  defineProperty(this, 'unmount', function tagUnmount(keepRootTag) {
    var el = self.root,
      p = el.parentNode,
      ptag,
      tagIndex = __VIRTUAL_DOM.indexOf(self)

    self.trigger('before-unmount')

    // remove this tag instance from the global virtualDom variable
    if (~tagIndex)
      __VIRTUAL_DOM.splice(tagIndex, 1)

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)
        arrayishRemove(ptag.tags, tagName, self)
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else {
        // the riot-tag and the data-is attributes aren't needed anymore, remove them
        remAttr(p, RIOT_TAG_IS)
        remAttr(p, RIOT_TAG) // this will be removed in riot 3.0.0
      }

    }

    if (this._virts) {
      each(this._virts, function(v) {
        if (v.parentNode) v.parentNode.removeChild(v)
      })
    }

    // allow expressions to unmount themselves
    unmountAll(expressions)

    self.trigger('unmount')
    self.off('*')
    self.isMounted = false
    delete self.root._tag

    if (self.root._eventHandlers) {
      each(Object.keys(self.root._eventHandlers), function (eventName) {
        self.root.removeEventListener(eventName, self.root._eventHandlers[eventName])
      })
      delete self.root._eventHandlers
    }
  })
}
