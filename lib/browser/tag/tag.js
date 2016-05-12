import observable from 'riot-observable'
import parseExpressions from './parse'
import { update } from './update'


export default function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
    opts = inherit(conf.opts) || {},
    parent = conf.parent,
    isLoop = conf.isLoop,
    hasImpl = conf.hasImpl,
    ownAttrs = conf.ownAttrs, // attributes on this tag (evaluated in parent context)
    item = cleanUpData(conf.item),
    expressions = [],
    root = conf.root,
    fn = impl.fn,
    tagName = conf.tagName || root.tagName.toLowerCase(),    attr = {},
    implAttr = {},
    propsInSyncWithParent = [],
    dom

  // only call unmount if we have a valid __tagImpl (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  // not yet mounted
  this.isMounted = false
  root.isLoop = isLoop
  this._hasImpl = hasImpl

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id

  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)

  // grab attributes
  each(root.attributes, function(el) {
    var val = el.value
    // remember attributes with expressions only
    if (tmpl.hasExpr(val)) attr[el.name] = val
  })

  dom = mkdom(impl, innerHTML, implAttr)
  implAttr = implAttr.attrs || ''

  // options
  function updateOpts() {
    var ctx = hasImpl && isLoop ? self : parent || self

    // If we're nested beneath another tag, then our attributes are evaluated
    // in that parent context. Here, we copy them onto opts.
    if (ownAttrs) {
      each(ownAttrs || [], function(expr) {
        // if the attribute doesn't actually have an expression, there
        // won't be a value. Just use the string itself in this case.
        var v = expr.hasOwnProperty('value') ? expr.value : expr.expr
        opts[toCamel(expr.attr)] = v
      })

    } else {
      each(root.attributes, function(el) {
        var val = el.value, hasTmpl = tmpl.hasExpr(val)
        if (hasTmpl && ownAttrs) return // already handled above
        opts[toCamel(el.name)] = hasTmpl ? tmpl(val, ctx) : val
      })
    }
  }

  function normalizeData(data) {
    for (var key in item) {
      if (typeof self[key] !== T_UNDEF && isWritable(self, key))
        self[key] = data[key]
    }
  }

  function inheritFromParent () {
    each(Object.keys(self.parent), function(k) {
      // some properties must be always in sync with the parent tag
      var mustSync = !RESERVED_WORDS_BLACKLIST.test(k) && contains(propsInSyncWithParent, k)
      if (typeof self[k] === T_UNDEF || mustSync) {
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
    if (typeof self.shouldUpdate == T_FUNCTION && !self.shouldUpdate()) return

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    // inherit properties from the parent, but only for anonymous tags
    if (isLoop && !hasImpl) inheritFromParent()
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

      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
        // save the prototype to loop it afterwards
        mix = mix.prototype
      } else instance = mix

      // loop the keys in the function prototype or the all object keys
      each(Object.getOwnPropertyNames(mix), function(key) {
        // bind methods to self
        if (key != 'init')
          self[key] = isFunction(instance[key]) ?
                        instance[key].bind(self) :
                        instance[key]
      })

      // init method will be called automatically
      if (instance.init) instance.init.bind(self)()
    })
    return this
  })

  defineProperty(this, 'mount', function tagMount(forceUpdate) {

    updateOpts()

    // keep a reference to the tag just created
    // so we will be able to mount this tag multiple times
    root._tag = this

    // add global mixin
    var globalMixin = riot.mixin(GLOBAL_MIXIN)
    if (globalMixin)
      for (var i in globalMixin)
        if (globalMixin.hasOwnProperty(i))
          self.mixin(globalMixin[i])

    // initialiation
    if (fn) fn.call(self, opts)

    // update the root adding custom attributes coming from the compiler
    // it fixes also #1087
    if (implAttr || hasImpl) {
      walkAttributes(implAttr, function (k, v) { setAttr(root, k, v) })
      parseExpressions(self.root, self, expressions)
    }

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    self.update(item)

    // internal use only, fixes #403
    self.trigger('before-mount')

    if (isLoop && !hasImpl) {
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
      // avoid to trigger the `mount` event for the tags
      // not visible included in an if statement
      if (!isInStub(self.root)) {
        self.trigger('mount')
      }
    })
  })


  defineProperty(this, 'unmount', function tagUnmount(keepRootTag) {
    var el = self.root,
      p = el.parentNode,
      ptag,
      tagIndex = __virtualDom.indexOf(self)

    self.trigger('before-unmount')

    // remove this tag instance from the global virtualDom variable
    if (~tagIndex)
      __virtualDom.splice(tagIndex, 1)

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

  })
}
