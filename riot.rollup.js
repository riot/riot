var riot = (function () { 'use strict';

  var observable = (function (module) {
  var exports = module.exports;
  ;(function(window, undefined) {var observable = function(el) {

    /**
     * Extend the original object or create a new empty one
     * @type { Object }
     */

    el = el || {}

    /**
     * Private variables and methods
     */
    var callbacks = {},
      onEachEvent = function(e, fn) { e.replace(/\S+/g, fn) },
      defineProperty = function (key, value) {
        Object.defineProperty(el, key, {
          value: value,
          enumerable: false,
          writable: false,
          configurable: false
        })
      }

    /**
     * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
     * @param  { String } events - events ids
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    defineProperty('on', function(events, fn) {
      if (typeof fn != 'function')  return el

      onEachEvent(events, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })

      return el
    })

    /**
     * Removes the given space separated list of `events` listeners
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    defineProperty('off', function(events, fn) {
      if (events == '*' && !fn) callbacks = {}
      else {
        onEachEvent(events, function(name) {
          if (fn) {
            var arr = callbacks[name]
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) arr.splice(i--, 1)
            }
          } else delete callbacks[name]
        })
      }
      return el
    })

    /**
     * Listen to the given space separated list of `events` and execute the `callback` at most once
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    defineProperty('one', function(events, fn) {
      function on() {
        el.off(events, on)
        fn.apply(el, arguments)
      }
      return el.on(events, on)
    })

    /**
     * Execute all callback functions that listen to the given space separated list of `events`
     * @param   { String } events - events ids
     * @returns { Object } el
     */
    defineProperty('trigger', function(events) {

      // getting the arguments
      // skipping the first one
      var arglen = arguments.length - 1,
        args = new Array(arglen)
      for (var i = 0; i < arglen; i++) {
        args[i] = arguments[i + 1]
      }

      onEachEvent(events, function(name) {

        var fns = (callbacks[name] || []).slice(0)

        for (var i = 0, fn; fn = fns[i]; ++i) {
          if (fn.busy) return
          fn.busy = 1
          fn.apply(el, fn.typed ? [name].concat(args) : args)
          if (fns[i] !== fn) { i-- }
          fn.busy = 0
        }

        if (callbacks['*'] && name != '*')
          el.trigger.apply(el, ['*', name].concat(args))

      })

      return el
    })

    return el

  }
    /* istanbul ignore next */
    // support CommonJS, AMD & browser
    if (typeof exports === 'object')
      module.exports = observable
    else if (typeof define === 'function' && define.amd)
      define(function() { return observable })
    else
      window.observable = observable

  })(typeof window != 'undefined' ? window : undefined);
  return module.exports;
  })({exports:{}});

  /**
   * The riot template engine
   * @version v2.3.19
   */

  /**
   * @module brackets
   *
   * `brackets         ` Returns a string or regex based on its parameter
   * `brackets.settings` Mirrors the `riot.settings` object (use brackets.set in new code)
   * `brackets.set     ` Change the current riot brackets
   */

  var brackets = (function (UNDEF) {

    var
      REGLOB  = 'g',

      MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
      STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,

      S_QBSRC = STRINGS.source + '|' +
        /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
        /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

      DEFAULT = '{ }',

      FINDBRACES = {
        '(': RegExp('([()])|'   + S_QBSRC, REGLOB),
        '[': RegExp('([[\\]])|' + S_QBSRC, REGLOB),
        '{': RegExp('([{}])|'   + S_QBSRC, REGLOB)
      }

    var
      cachedBrackets = UNDEF,
      _regex,
      _pairs = []

    function _loopback(re) { return re }

    function _rewrite(re, bp) {
      if (!bp) bp = _pairs
      return new RegExp(
        re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
      )
    }

    function _create(pair) {
      var
        cvt,
        arr = pair.split(' ')

      if (pair === DEFAULT) {
        arr[2] = arr[0]
        arr[3] = arr[1]
        cvt = _loopback
      }
      else {
        if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
          throw new Error('Unsupported brackets "' + pair + '"')
        }
        arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '))
        cvt = _rewrite
      }
      arr[4] = cvt(arr[1].length > 1 ? /{[\S\s]*?}/ : /{[^}]*}/, arr)
      arr[5] = cvt(/\\({|})/g, arr)
      arr[6] = cvt(/(\\?)({)/g, arr)
      arr[7] = RegExp('(\\\\?)(?:([[({])|(' + arr[3] + '))|' + S_QBSRC, REGLOB)
      arr[8] = pair
      return arr
    }

    function _reset(pair) {
      if (!pair) pair = DEFAULT

      if (pair !== _pairs[8]) {
        _pairs = _create(pair)
        _regex = pair === DEFAULT ? _loopback : _rewrite
        _pairs[9] = _regex(/^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/)
        _pairs[10] = _regex(/(^|[^\\]){=[\S\s]*?}/)
        _brackets._rawOffset = _pairs[0].length
      }
      cachedBrackets = pair
    }

    function _brackets(reOrIdx) {
      return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _pairs[reOrIdx]
    }

    _brackets.split = function split(str, tmpl, _bp) {
      // istanbul ignore next: _bp is for the compiler
      if (!_bp) _bp = _pairs

      var
        parts = [],
        match,
        isexpr,
        start,
        pos,
        re = _bp[6]

      isexpr = start = re.lastIndex = 0

      while (match = re.exec(str)) {

        pos = match.index

        if (isexpr) {

          if (match[2]) {
            re.lastIndex = skipBraces(match[2], re.lastIndex)
            continue
          }

          if (!match[3])
            continue
        }

        if (!match[1]) {
          unescapeStr(str.slice(start, pos))
          start = re.lastIndex
          re = _bp[6 + (isexpr ^= 1)]
          re.lastIndex = start
        }
      }

      if (str && start < str.length) {
        unescapeStr(str.slice(start))
      }

      return parts

      function unescapeStr(str) {
        if (tmpl || isexpr)
          parts.push(str && str.replace(_bp[5], '$1'))
        else
          parts.push(str)
      }

      function skipBraces(ch, pos) {
        var
          match,
          recch = FINDBRACES[ch],
          level = 1
        recch.lastIndex = pos

        while (match = recch.exec(str)) {
          if (match[1] &&
            !(match[1] === ch ? ++level : --level)) break
        }
        return match ? recch.lastIndex : str.length
      }
    }

    _brackets.hasExpr = function hasExpr(str) {
      return _brackets(4).test(str)
    }

    _brackets.loopKeys = function loopKeys(expr) {
      var m = expr.match(_brackets(9))
      return m ?
        { key: m[1], pos: m[2], val: _pairs[0] + m[3].trim() + _pairs[1] } : { val: expr.trim() }
    }

    _brackets.array = function array(pair) {
      return _create(pair || cachedBrackets)
    }

    var _settings
    function _setSettings(o) {
      var b
      o = o || {}
      b = o.brackets
      Object.defineProperty(o, 'brackets', {
        set: _reset,
        get: function () { return cachedBrackets },
        enumerable: true
      })
      _settings = o
      _reset(b)
    }
    Object.defineProperty(_brackets, 'settings', {
      set: _setSettings,
      get: function () { return _settings }
    })

    /* istanbul ignore next: in the node version riot is not in the scope */
    _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
    _brackets.set = _reset

    _brackets.R_STRINGS = STRINGS
    _brackets.R_MLCOMMS = MLCOMMS
    _brackets.S_QBLOCKS = S_QBSRC

    return _brackets

  })()

  /**
   * @module tmpl
   *
   * tmpl          - Root function, returns the template value, render with data
   * tmpl.hasExpr  - Test the existence of a expression inside a string
   * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
   */

  var tmpl$1 = (function () {

    var _cache = {}

    function _tmpl(str, data) {
      if (!str) return str

      return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
    }

    _tmpl.isRaw = function (expr) {
      return expr[brackets._rawOffset] === "="
    }

    _tmpl.haveRaw = function (src) {
      return brackets(10).test(src)
    }

    _tmpl.hasExpr = brackets.hasExpr

    _tmpl.loopKeys = brackets.loopKeys

    _tmpl.errorHandler = null

    function _logErr(err, ctx) {

      if (_tmpl.errorHandler) {

        err.riotData = {
          tagName: ctx && ctx.root && ctx.root.tagName,
          _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
        }
        _tmpl.errorHandler(err)
      }
    }

    function _create(str) {

      var expr = _getTmpl(str)
      if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr

      return new Function('E', expr + ';')
    }

    var
      RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
      RE_QBMARK = /\x01(\d+)~/g

    function _getTmpl(str) {
      var
        qstr = [],
        expr,
        parts = brackets.split(str.replace(/\u2057/g, '"'), 1)

      if (parts.length > 2 || parts[0]) {
        var i, j, list = []

        for (i = j = 0; i < parts.length; ++i) {

          expr = parts[i]

          if (expr && (expr = i & 1 ?

                _parseExpr(expr, 1, qstr) :

                '"' + expr
                  .replace(/\\/g, '\\\\')
                  .replace(/\r\n?|\n/g, '\\n')
                  .replace(/"/g, '\\"') +
                '"'

            )) list[j++] = expr

        }

        expr = j < 2 ? list[0] :
               '[' + list.join(',') + '].join("")'
      }
      else {

        expr = _parseExpr(parts[1], 0, qstr)
      }

      if (qstr[0])
        expr = expr.replace(RE_QBMARK, function (_, pos) {
          return qstr[pos]
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
        })

      return expr
    }

    var
      CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/,
      RE_BRACE = /,|([[{(])|$/g

    function _parseExpr(expr, asText, qstr) {

      if (expr[0] === "=") expr = expr.slice(1)

      expr = expr
            .replace(RE_QBLOCK, function (s, div) {
              return s.length > 2 && !div ? '\x01' + (qstr.push(s) - 1) + '~' : s
            })
            .replace(/\s+/g, ' ').trim()
            .replace(/\ ?([[\({},?\.:])\ ?/g, '$1')

      if (expr) {
        var
          list = [],
          cnt = 0,
          match

        while (expr &&
              (match = expr.match(CS_IDENT)) &&
              !match.index
          ) {
          var
            key,
            jsb,
            re = /,|([[{(])|$/g

          expr = RegExp.rightContext
          key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]

          while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)

          jsb  = expr.slice(0, match.index)
          expr = RegExp.rightContext

          list[cnt++] = _wrapExpr(jsb, 1, key)
        }

        expr = !cnt ? _wrapExpr(expr, asText) :
            cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
      }
      return expr

      function skipBraces(jsb, re) {
        var
          match,
          lv = 1,
          ir = jsb === '(' ? /[()]/g : jsb === '[' ? /[[\]]/g : /[{}]/g

        ir.lastIndex = re.lastIndex
        while (match = ir.exec(expr)) {
          if (match[0] === jsb) ++lv
          else if (!--lv) break
        }
        re.lastIndex = lv ? expr.length : ir.lastIndex
      }
    }

    // istanbul ignore next: not both
    var JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').'
    var JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g

    function _wrapExpr(expr, asText, key) {
      var tb

      expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
        if (mvar) {
          pos = tb ? 0 : pos + match.length

          if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
            match = p + '("' + mvar + JS_CONTEXT + mvar
            if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
          }
          else if (pos)
            tb = !/^(?=(\.[$\w]+))\1(?:[^.[(]|$)/.test(s.slice(pos))
        }
        return match
      })

      if (tb) {
        expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
      }

      if (key) {

        expr = (tb ?
            'function(){' + expr + '}.call(this)' : '(' + expr + ')'
          ) + '?"' + key + '":""'
      }
      else if (asText) {

        expr = 'function(v){' + (tb ?
            expr.replace('return ', 'v=') : 'v=(' + expr + ')'
          ) + ';return v||v===0?v:""}.call(this)'
      }

      return expr
    }

    // istanbul ignore next: compatibility fix for beta versions
    _tmpl.parse = function (s) { return s }

    return _tmpl

  })()

    tmpl$1.version = brackets.version = 'v2.3.19'

  var tmpl$2 = {tmpl: tmpl$1, brackets}

  function Tag$1 (impl, conf, innerHTML) {

    var self = observable(this),
      opts = inherit(conf.opts) || {},
      dom = mkdom(impl.tmpl),
      parent = conf.parent,
      isLoop = conf.isLoop,
      hasImpl = conf.hasImpl,
      item = cleanUpData(conf.item),
      expressions = [],
      childTags = [],
      root = conf.root,
      fn = impl.fn,
      tagName = root.tagName.toLowerCase(),
      attr = {},
      propsInSyncWithParent = []

    if (fn && root._tag) root._tag.unmount(true)

    // not yet mounted
    this.isMounted = false
    root.isLoop = isLoop

    // keep a reference to the tag just created
    // so we will be able to mount this tag multiple times
    root._tag = this

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

    if (dom.innerHTML && !/^(select|optgroup|table|tbody|tr|col(?:group)?)$/.test(tagName))
      // replace all the yield tags with the tag inner html
      dom.innerHTML = replaceYield(dom.innerHTML, innerHTML)

    // options
    function updateOpts() {
      var ctx = hasImpl && isLoop ? self : parent || self

      // update opts from current DOM attributes
      each(root.attributes, function(el) {
        var val = el.value
        opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val
      })
      // recover those with expressions
      each(Object.keys(attr), function(name) {
        opts[toCamel(name)] = tmpl(attr[name], ctx)
      })
    }

    function normalizeData(data) {
      for (var key in item) {
        if (typeof self[key] !== T_UNDEF && isWritable(self, key))
          self[key] = data[key]
      }
    }

    function inheritFromParent () {
      if (!self.parent || !isLoop) return
      each(Object.keys(self.parent), function(k) {
        // some properties must be always in sync with the parent tag
        var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k)
        if (typeof self[k] === T_UNDEF || mustSync) {
          // track the property to keep in sync
          // so we can keep it updated
          if (!mustSync) propsInSyncWithParent.push(k)
          self[k] = self.parent[k]
        }
      })
    }

    defineProperty(this, 'update', function(data) {

      // make sure the data passed will not override
      // the component core methods
      data = cleanUpData(data)
      // inherit properties from the parent
      inheritFromParent()
      // normalize the tag properties in case an item object was initially passed
      if (data && typeof item === T_OBJECT) {
        normalizeData(data)
        item = data
      }
      extend(self, data)
      updateOpts()
      self.trigger('update', data)
      update(expressions, self)
      // the updated event will be triggered
      // once the DOM will be ready and all the reflow are completed
      // this is useful if you want to get the "real" root properties
      // 4 ex: root.offsetWidth ...
      rAF(function() { self.trigger('updated') })
      return this
    })

    defineProperty(this, 'mixin', function() {
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

    defineProperty(this, 'mount', function() {

      updateOpts()

      // initialiation
      if (fn) fn.call(self, opts)

      // parse layout after init. fn may calculate args for nested custom tags
      parseExpressions(dom, self, expressions)

      // mount the child tags
      toggle(true)

      // update the root adding custom attributes coming from the compiler
      // it fixes also #1087
      if (impl.attrs || hasImpl) {
        walkAttributes(impl.attrs, function (k, v) { setAttr(root, k, v) })
        parseExpressions(self.root, self, expressions)
      }

      if (!self.parent || isLoop) self.update(item)

      // internal use only, fixes #403
      self.trigger('before-mount')

      if (isLoop && !hasImpl) {
        // update the root attribute for the looped elements
        self.root = root = dom.firstChild

      } else {
        while (dom.firstChild) root.appendChild(dom.firstChild)
        if (root.stub) self.root = root = parent.root
      }

      // parse the named dom nodes in the looped child
      // adding them to the parent as well
      if (isLoop)
        parseNamedElements(self.root, self.parent, null, true)

      // if it's not a child tag we can trigger its mount event
      if (!self.parent || self.parent.isMounted) {
        self.isMounted = true
        self.trigger('mount')
      }
      // otherwise we need to wait that the parent event gets triggered
      else self.parent.one('mount', function() {
        // avoid to trigger the `mount` event for the tags
        // not visible included in an if statement
        if (!isInStub(self.root)) {
          self.parent.isMounted = self.isMounted = true
          self.trigger('mount')
        }
      })
    })


    defineProperty(this, 'unmount', function(keepRootTag) {
      var el = root,
        p = el.parentNode,
        ptag

      self.trigger('before-unmount')

      // remove this tag instance from the global virtualDom variable
      __virtualDom.splice(__virtualDom.indexOf(self), 1)

      if (this._virts) {
        each(this._virts, function(v) {
          v.parentNode.removeChild(v)
        })
      }

      if (p) {

        if (parent) {
          ptag = getImmediateCustomParentTag(parent)
          // remove this tag from the parent tags object
          // if there are multiple nested tags with same name..
          // remove this element form the array
          if (isArray(ptag.tags[tagName]))
            each(ptag.tags[tagName], function(tag, i) {
              if (tag._riot_id == self._riot_id)
                ptag.tags[tagName].splice(i, 1)
            })
          else
            // otherwise just delete the tag instance
            ptag.tags[tagName] = undefined
        }

        else
          while (el.firstChild) el.removeChild(el.firstChild)

        if (!keepRootTag)
          p.removeChild(el)
        else
          // the riot-tag attribute isn't needed anymore, remove it
          remAttr(p, 'riot-tag')
      }


      self.trigger('unmount')
      toggle()
      self.off('*')
      self.isMounted = false
      // somehow ie8 does not like `delete root._tag`
      root._tag = null

    })

    function toggle(isMount) {

      // mount/unmount children
      each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

      // listen/unlisten parent (events flow one way from parent to children)
      if (parent) {
        var evt = isMount ? 'on' : 'off'

        // the loop tags will be always in sync with the parent automatically
        if (isLoop)
          parent[evt]('unmount', self.unmount)
        else
          parent[evt]('update', self.update)[evt]('unmount', self.unmount)
      }
    }

    // named elements available for fn
    parseNamedElements(dom, this, childTags)

  }

  /**
   * Loops an array
   * @param   { Array } els - collection of items
   * @param   {Function} fn - callback function
   * @returns { Array } the array looped
   */
  function each$1(els, fn) {
    for (var i = 0, len = (els || []).length, el; i < len; i++) {
      el = els[i]
      // return false -> remove current item during loop
      if (el != null && fn(el, i) === false) i--
    }
    return els
  }

  /**
   * Detect if the argument passed is a function
   * @param   { * } v - whatever you want to pass to this function
   * @returns { Boolean } -
   */
  function isFunction$1(v) {
    return typeof v === T_FUNCTION || false   // avoid IE problems
  }

  /**
   * Set any DOM attribute
   * @param { Object } dom - DOM node we want to update
   * @param { String } name - name of the property we want to set
   * @param { String } val - value of the property we want to set
   */
  function setAttr$1(dom, name, val) {
    dom.setAttribute(name, val)
  }

  /**
   * Shorter and fast way to select multiple nodes in the DOM
   * @param   { String } selector - DOM selector
   * @param   { Object } ctx - DOM node where the targets of our search will is located
   * @returns { Object } dom nodes found
   */
  function $$(selector, ctx) {
    return (ctx || document).querySelectorAll(selector)
  }

  /**
   * requestAnimationFrame function
   * Adapted from https://gist.github.com/paulirish/1579671, license MIT
   */
  var rAF$1 = (function (w) {
    var raf = w.requestAnimationFrame    ||
              w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame

    if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {  // buggy iOS6
      var lastTime = 0

      raf = function (cb) {
        var nowtime = Date.now(), timeout = Math.max(16 - (nowtime - lastTime), 0)
        setTimeout(function () { cb(lastTime = nowtime + timeout) }, timeout)
      }
    }
    return raf

  })(window || {})

  // tags instances cache
  var __virtualDom$1 = []
  // tags implementation cache
  var  __tagImpl$1 = {}
  // for typeof == '' comparisons
  const  T_STRING$1 = 'string'

  /**
   * Object that will be used to inject and manage the css of every tag instance
   */
  var styleManager = (function() {

    if (!window) return // skip injection on the server

    var styleNode,
      placeholder

    /**
     * Inject stuff in the DOM only if it's really needed
     * @returns { Object } DOM style node object
     */
    function init() {
      // create the style node
      styleNode = mkEl('style')
      placeholder = $('style[type=riot]')

      setAttr(styleNode, 'type', 'text/css')

      // inject the new node into the DOM -- in head
      if (placeholder) {
        placeholder.parentNode.replaceChild(styleNode, placeholder)
        placeholder = null
      }
      else document.getElementsByTagName('head')[0].appendChild(styleNode)

      // extends the <style> node for dynamic CSS
      styleNode.stylesToInject = ''
      styleNode.needUpdate = false

      styleNode.updateStyles = function() {
        if (styleNode.stylesToInject) {
          var css = styleNode.stylesToInject
          if (styleNode.parser) {
            css = styleNode.parser(css)
          }
          if (styleNode.styleSheet) styleNode.styleSheet.cssText = css
          else styleNode.innerHTML = css
        }
      }

      return styleNode

    }

    /**
     * Public api
     */
    return {

      /**
        * Save a tag style to be later injected into DOM
        * @param   { String } css [description]
        */
      add: function(css) {
        /**
        * Export the DOM node where the css will be injected
        * @type { DOM Object }
        */
        if (!styleNode) this.styleNode = init() // only if the styleNode was not created yet
        styleNode.stylesToInject += css
        styleNode.needUpdate = true
      },

      /**
        * Inject all previously saved tag styles into DOM
        * innerHTML seems slow: http://jsperf.com/riot-insert-style
        */
      inject: function() {
        if (!styleNode.needUpdate) return
        styleNode.updateStyles()
        styleNode.needUpdate = false
      }
    }

  })()

  /**
   * Riot public api
   */

  var riot$1 = {}

  riot$1.observable = observable

  // share methods for other riot parts, e.g. compiler
  riot$1.util = { brackets: tmpl$2.brackets, tmpl: tmpl$2.tmpl }

  /**
   * Create a mixin that could be globally shared across all the tags
   */
  riot$1.mixin = (function() {
    var mixins = {}

    /**
     * Create/Return a mixin by its name
     * @param   { String } name - mixin name
     * @param   { Object } mixin - mixin logic
     * @returns { Object } the mixin logic
     */
    return function(name, mixin) {
      if (!mixin) return mixins[name]
      mixins[name] = mixin
    }

  })()

  /**
   * Create a new riot tag implementation
   * @param   { String }   name - name/id of the new riot tag
   * @param   { String }   html - tag template
   * @param   { String }   css - custom tag css
   * @param   { String }   attrs - root tag attributes
   * @param   { Function } fn - user function
   * @returns { String } name/id of the tag just created
   */
  riot$1.tag = function(name, html, css, attrs, fn) {
    if (isFunction$1(attrs)) {
      fn = attrs
      if (/^[\w\-]+\s?=/.test(css)) {
        attrs = css
        css = ''
      } else attrs = ''
    }
    if (css) {
      if (isFunction$1(css)) fn = css
      else if (styleManager) styleManager.add(css)

      // make the style node available in the riot API
      riot$1.styleNode = styleManager.styleNode
    }
    __tagImpl$1[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
    return name
  }

  /**
   * This attribute will be created only if there will be css injected into the DOM
   * @type { DOM Object }
   */
  riot$1.styleNode = null

  /**
   * Create a new riot tag implementation (for use by the compiler)
   * @param   { String }   name - name/id of the new riot tag
   * @param   { String }   html - tag template
   * @param   { String }   css - custom tag css
   * @param   { String }   attrs - root tag attributes
   * @param   { Function } fn - user function
   * @param   { string }  [bpair] - brackets used in the compilation
   * @returns { String } name/id of the tag just created
   */
  riot$1.tag2 = function(name, html, css, attrs, fn, bpair) {
    if (css && styleManager) styleManager.add(css)
    //if (bpair) riot.settings.brackets = bpair
    __tagImpl$1[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
    return name
  }

  /**
   * Mount a tag using a specific tag implementation
   * @param   { String } selector - tag DOM selector
   * @param   { String } tagName - tag implementation name
   * @param   { Object } opts - tag logic
   * @returns { Array } new tags instances
   */
  riot$1.mount = function(selector, tagName, opts) {

    var els,
      allTags,
      tags = []

    // helper functions

    function addRiotTags(arr) {
      var list = ''
      each$1(arr, function (e) {
        list += ', *[' + RIOT_TAG + '="' + e.trim() + '"]'
      })
      return list
    }

    function selectAllTags() {
      var keys = Object.keys(__tagImpl$1)
      return keys + addRiotTags(keys)
    }

    function pushTags(root) {
      var last

      if (root.tagName) {
        if (tagName && (!(last = getAttr(root, RIOT_TAG)) || last != tagName))
          setAttr$1(root, RIOT_TAG, tagName)

        var tag = mountTo(root, tagName || root.getAttribute(RIOT_TAG) || root.tagName.toLowerCase(), opts)

        if (tag) tags.push(tag)
      } else if (root.length)
        each$1(root, pushTags)   // assume nodeList

    }

    // ----- mount code -----

    // inject styles into DOM
    if (styleManager) styleManager.inject()

    if (typeof tagName === T_OBJECT) {
      opts = tagName
      tagName = 0
    }

    // crawl the DOM to find the tag
    if (typeof selector === T_STRING$1) {
      if (selector === '*')
        // select all the tags registered
        // and also the tags found with the riot-tag attribute set
        selector = allTags = selectAllTags()
      else
        // or just the ones named like the selector
        selector += addRiotTags(selector.split(','))

      // make sure to pass always a selector
      // to the querySelectorAll function
      els = selector ? $$(selector) : []
    }
    else
      // probably you have passed already a tag or a NodeList
      els = selector

    // select all the registered and mount them inside their root elements
    if (tagName === '*') {
      // get all custom tags
      tagName = allTags || selectAllTags()
      // if the root els it's just a single tag
      if (els.tagName)
        els = $$(tagName, els)
      else {
        // select all the children for all the different root elements
        var nodeList = []
        each$1(els, function (_el) {
          nodeList.push($$(tagName, _el))
        })
        els = nodeList
      }
      // get rid of the tagName
      tagName = 0
    }

    if (els.tagName)
      pushTags(els)
    else
      each$1(els, pushTags)

    return tags
  }

  /**
   * Update all the tags instances created
   * @returns { Array } all the tags instances
   */
  riot$1.update = function() {
    return each$1(__virtualDom$1, function(tag) {
      tag.update()
    })
  }

  /**
   * Export the Tag constructor
   */
  riot$1.Tag = Tag$1

  riot$1

  return riot$1;

})();
