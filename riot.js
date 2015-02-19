/* Riot v2.0.10, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function() {

  var riot = { version: 'v2.0.10', settings: {} }

  'use strict'

riot.observable = function(el) {

  el = el || {}

  var callbacks = {},
      _id = 0

  el.on = function(events, fn) {
    if (typeof fn == 'function') {
      fn._id = _id++

      events.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })
    }
    return el
  }

  el.off = function(events, fn) {
    if (events == '*') callbacks = {}
    else if (fn) {
      var arr = callbacks[events]
      for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
        if (cb._id == fn._id) { arr.splice(i, 1); i-- }
      }
    } else {
      events.replace(/\S+/g, function(name) {
        callbacks[name] = []
      })
    }
    return el
  }

  // only single event supported
  el.one = function(name, fn) {
    if (fn) fn.one = 1
    return el.on(name, fn)
  }

  el.trigger = function(name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || []

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fn.one) { fns.splice(i, 1); i-- }
         else if (fns[i] !== fn) { i-- } // Makes self-removal possible during iteration
        fn.busy = 0
      }
    }

    return el
  }

  return el

}
;(function(riot, evt) {

  // browsers only
  if (!this.top) return

  var loc = location,
      fns = riot.observable(),
      win = window,
      current

  function hash() {
    return loc.hash.slice(1)
  }

  function parser(path) {
    return path.split('/')
  }

  function emit(path) {
    if (path.type) path = hash()

    if (path != current) {
      fns.trigger.apply(null, ['H'].concat(parser(path)))
      current = path
    }
  }

  var r = riot.route = function(arg) {
    // string
    if (arg[0]) {
      loc.hash = arg
      emit(arg)

    // function
    } else {
      fns.on('H', arg)
    }
  }

  r.exec = function(fn) {
    fn.apply(null, parser(hash()))
  }

  r.parser = function(fn) {
    parser = fn
  }

  win.addEventListener ? win.addEventListener(evt, emit, false) : win.attachEvent('on' + evt, emit)

})(riot, 'hashchange')
/*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/


var brackets = (function(orig, s, b) {
  return function(x) {

    // make sure we use the current setting
    s = riot.settings.brackets || orig
    if (b != s) b = s.split(' ')

    // if regexp given, rewrite it with current brackets (only if differ from default)
    // else, get brackets
    return x && x.test
      ? s == orig
        ? x : RegExp(x.source
                      .replace(/\{/g, b[0].replace(/(?=.)/g, '\\'))
                      .replace(/\}/g, b[1].replace(/(?=.)/g, '\\')),
                    x.global ? 'g' : '')
      : b[x]

  }
})('{ }')


var tmpl = (function() {

  var cache = {},
      re_expr = /({[\s\S]*?})/,
      re_vars = /(['"\/]).*?[^\\]\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function *\()|([a-z_]\w*)/gi
              // [ 1               ][ 2  ][ 3 ][ 4                                                                                  ][ 5       ]
              // find variable names:
              // 1. skip quoted strings and regexps: "a b", 'a b', 'a \'b\'', /a b/
              // 2. skip object properties: .name
              // 3. skip object literals: name:
              // 4. skip javascript keywords
              // 5. match var name

  // build a template (or get it from cache), render with data
  return function(str, data) {
    return str && (cache[str] = cache[str] || tmpl(str))(data)
  }


  // create a template instance

  function tmpl(s, p) {

    // default template string to {}
    p = (s || (brackets(0) + brackets(1)))

      // temporarily convert \{ and \} to a non-character
      .replace(brackets(/\\{/), '\uFFF0')
      .replace(brackets(/\\}/), '\uFFF1')

      // split string to expression and non-expresion parts
      .split(brackets(re_expr))

    return new Function('d', 'return ' + (

      // is it a single expression or a template? i.e. {x} or <b>{x}</b>
      !p[0] && !p[2] && !p[3]

        // if expression, evaluate it
        ? expr(p[1])

        // if template, evaluate all expressions in it
        : '[' + p.map(function(s, i) {

            // is it an expression or a string (every second part is an expression)
          return i % 2

              // evaluate the expressions
              ? expr(s, 1)

              // process string parts of the template:
              : '"' + s

                  // preserve new lines
                  .replace(/\n/g, '\\n')

                  // escape quotes
                  .replace(/"/g, '\\"')

                + '"'

        }).join(',') + '].join("")'
      )

      // bring escaped { and } back
      .replace(/\uFFF0/g, brackets(0))
      .replace(/\uFFF1/g, brackets(1))

    )

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n/g, ' ')

      // trim whitespace, curly brackets, strip comments
      .replace(brackets(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w- "']+ *:/.test(s)

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      ? '[' + s.replace(/\W*([\w- ]+)\W*:([^,]+)/g, function(_, k, v) {

        return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k.trim() + '":"",'

      }) + '].join(" ")'

      // if js expression, evaluate as javascript
      : wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    s = s.trim()
    return !s ? '' : '(function(v){try{v='

        // prefix vars (name => data.name)
        + (s.replace(re_vars, function(s, _, v) { return v ? '(d.'+v+'===undefined?window.'+v+':d.'+v+')' : s })

          // break the expression if its empty (resulting in undefined value)
          || 'x')

      + '}finally{return '

        // default to empty string for falsy values except zero
        + (nonull ? '!v&&v!==0?"":v' : 'v')

      + '}}).call(d)'
  }

})()
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var ret = { val: expr },
      els = expr.split(/\s+in\s+/)

  if (els[1]) {
    ret.val = brackets(0) + els[1]
    els = els[0].slice(brackets(0).length).trim().split(/,\s*/)
    ret.key = els[0]
    ret.pos = els[1]
  }

  return ret
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = [],
      tags = [],
      checksum

  expr = loopKeys(expr)

  function add(pos, item, tag) {
    rendered.splice(pos, 0, item)
    tags.splice(pos, 0, tag)
  }


  // clean template code after update (and let walk finish it's parse)
  parent.one('update', function() {
    root.removeChild(dom)

  }).one('mount', function() {
    if (root.stub) root = parent.root

  }).on('update', function() {

    var items = tmpl(expr.val, parent)
    if (!items) return

    // object loop. any changes cause full redraw
    if (!Array.isArray(items)) {
      var testsum = JSON.stringify(items)
      if (testsum == checksum) return
      checksum = testsum

      // clear old items
      each(tags, function(tag) { tag.unmount() })
      rendered = []
      tags = []

      items = Object.keys(items).map(function(key) {
        return mkitem(expr, key, items[key])
      })

    }

    // unmount redundant
    each(arrDiff(rendered, items), function(item) {
      var pos = rendered.indexOf(item),
          tag = tags[pos]

      if (tag) {
        tag.unmount()
        rendered.splice(pos, 1)
        tags.splice(pos, 1)
      }

    })

    // mount new / reorder
    var nodes = root.childNodes,
        prev_index = [].indexOf.call(nodes, prev)

    each(items, function(item, i) {

      // start index search from position based on the current i
      var pos = items.indexOf(item, i),
          oldPos = rendered.indexOf(item, i)

      // if not found, search backwards from current i position
      pos < 0 && (pos = items.lastIndexOf(item, i))
      oldPos < 0 && (oldPos = rendered.lastIndexOf(item, i))

      // mount new
      if (oldPos < 0) {
        if (!checksum && expr.key) item = mkitem(expr, item, pos)

        var tag = new Tag({ tmpl: template }, {
          before: nodes[prev_index + 1 + pos],
          parent: parent,
          root: root,
          loop: true,
          item: item
        })

        return add(pos, item, tag)
      }

      // change pos value
      if (expr.pos && tags[oldPos][expr.pos] != pos) {
        tags[oldPos].one('update', function(item) {
          item[expr.pos] = pos
        })
        tags[oldPos].update()
      }

      // reorder
      if (pos != oldPos) {
        root.insertBefore(nodes[prev_index + oldPos + 1], nodes[prev_index + pos + 1])
        return add(pos, rendered.splice(oldPos, 1)[0], tags.splice(oldPos, 1)[0])
      }

    })

    rendered = items.slice()

  })

}

function parseNamedElements(root, tag, expressions) {
  walk(root, function(dom) {
    if (dom.nodeType != 1) return

    each(dom.attributes, function(attr) {
      if (/^(name|id)$/.test(attr.name)) tag[attr.value] = dom
    })
  })
}

function parseLayout(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (val.indexOf(brackets(0)) >= 0) {
      var expr = { dom: dom, expr: val }
      expressions.push(extend(expr, extra))
    }
  }

  walk(root, function(dom) {

    var type = dom.nodeType

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    var attr = dom.getAttribute('each')
    if (attr) { _each(dom, tag, attr); return false }

    // attributes
    each(dom.attributes, function(attr) {
      var name = attr.name,
          value = attr.value

      // expressions
      var bool = name.split('__')[1]
      addExpr(dom, value, { attr: bool || name, bool: bool })

      if (bool) {
        remAttr(dom, name)
        return false
      }

    })

    // child tag
    var impl = tag_impl[dom.tagName.toLowerCase()]
    if (impl) impl = new Tag(impl, { root: dom, parent: tag })

  })

}
function Tag(impl, conf) {

  var self = riot.observable(this),
      expressions = [],
      attributes = {},
      parent = conf.parent,
      is_loop = conf.loop,
      root = conf.root,
      opts = inherit(conf.opts),
      item = conf.item

  // cannot initialize twice on the same root element
  if (!is_loop && root.riot) return
  root.riot = 1

  opts = opts || {}

  extend(this, { parent: parent, root: root, opts: opts })
  extend(this, item)


  // attributes
  each(root.attributes, function(attr) {
    var name = attr.name,
        val = attr.value

    attributes[name] = val

    // remove dynamic attributes from node
    if (val.indexOf(brackets(0)) >= 0) {
      remAttr(root, name)
      return false
    }
  })

  // options
  function updateOpts() {
    each(Object.keys(attributes), function(name) {
      opts[name] = tmpl(attributes[name], parent || self)
    })
  }

  updateOpts()

  // child
  var dom = mkdom(impl.tmpl),
      loop_dom

  // named elements
  parseNamedElements(dom, this)

  this.update = function(data, init) {
    extend(self, data)
    extend(self, item)
    self.trigger('update', item)
    updateOpts()
    update(expressions, self, item)
    self.trigger('updated')
  }

  this.unmount = function() {
    var el = is_loop ? loop_dom : root,
        p = el.parentNode

    if (p) {
      p.removeChild(el)
      self.trigger('unmount')
      parent && parent.off('update', self.update).off('unmount', self.unmount)
      self.off('*')
    }
  }

  function mount() {

    if (is_loop) {
      loop_dom = dom.firstChild
      root.insertBefore(loop_dom, conf.before || null) // null needed for IE8

    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
    }

    if (root.stub) self.root = root = parent.root

    self.trigger('mount')

    // one way data flow: propagate updates and unmounts downwards from parent to children
    parent && parent.on('update', self.update).one('unmount', self.unmount)

  }

  // initialize
  if (impl.fn) impl.fn.call(this, opts)

  // layout
  parseLayout(dom, this, expressions)

  this.update()
  mount()

}

function setEventHandler(name, handler, dom, tag, item) {

  dom[name] = function(e) {

    // cross browser event fix
    e = e || window.event
    e.which = e.which || e.charCode || e.keyCode
    e.target = e.target || e.srcElement
    e.currentTarget = dom
    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true) {
      e.preventDefault && e.preventDefault()
      e.returnValue = false
    }

    var el = item ? tag.parent : tag
    el.update()

  }

}

// used by if- attribute
function insertTo(root, node, before) {
  if (root) {
    root.insertBefore(before, node)
    root.removeChild(node)
  }
}

// item = currently looped item
function update(expressions, tag, item) {

  each(expressions, function(expr) {
    var dom = expr.dom,
        attr_name = expr.attr,
        value = tmpl(expr.expr, tag)

    if (value == null) value = ''

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attr_name) return dom.nodeValue = value

    // remove original attribute
    remAttr(dom, attr_name)

    // event handler
    if (typeof value == 'function') {
      setEventHandler(attr_name, value, dom, tag, item)

    // if- conditional
    } else if (attr_name == 'if') {
      var stub = expr.stub

      // add to DOM
      if (value) {
        stub && insertTo(stub.parentNode, stub, dom)

      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        insertTo(dom.parentNode, dom, stub)
      }

    // show / hide
    } else if (/^(show|hide)$/.test(attr_name)) {
      if (attr_name == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attr_name == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (attr_name == 'riot-src') {
      value ? dom.setAttribute('src', value) : remAttr(dom, 'src')

    } else {
      if (expr.bool) {
        dom[attr_name] = value
        if (!value) return
        value = attr_name
      }

      dom.setAttribute(attr_name, value)

    }

  })

}
function each(els, fn) {
  for (var i = 0, len = (els || []).length, el; i < len; i++) {
    el = els[i]
    // return false -> reomve current item during loop
    if (el != null && fn(el, i) === false) i--
  }
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

function extend(obj, from) {
  from && each(Object.keys(from), function(key) {
    obj[key] = from[key]
  })
  return obj
}

function mkdom(template) {
  var tag_name = template.trim().slice(1, 3).toLowerCase(),
      root_tag = /td|th/.test(tag_name) ? 'tr' : tag_name == 'tr' ? 'tbody' : 'div',
      el = document.createElement(root_tag)

  el.stub = true
  el.innerHTML = template
  return el
}

function walk(dom, fn) {
  dom = fn(dom) === false ? dom.nextSibling : dom.firstChild

  while (dom) {
    walk(dom, fn)
    dom = dom.nextSibling
  }
}

function arrDiff(arr1, arr2) {
  return arr1.filter(function(el) {
    return arr2.indexOf(el) < 0
  })
}

function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}


/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtual_dom = [],
    tag_impl = {}

function injectStyle(css) {
  var node = document.createElement('style')
  node.innerHTML = css
  document.head.appendChild(node)
}

riot.tag = function(name, html, css, fn) {
  if (typeof css == 'function') fn = css
  else if (css) injectStyle(css)
  tag_impl[name] = { name: name, tmpl: html, fn: fn }
}

var mountTo = riot.mountTo = function(root, tagName, opts) {
  var impl = tag_impl[tagName], tag

  if (impl && root) {
    root.riot = 0 // mountTo can override previous instance
    tag = new Tag(impl, { root: root, opts: opts })
  }

  if (tag) {
    virtual_dom.push(tag)
    return tag.on('unmount', function() {
      virtual_dom.splice(virtual_dom.indexOf(tag), 1)
    })
  }
}

riot.mount = function(selector, opts) {
  if (selector == '*') selector = Object.keys(tag_impl).join(', ')

  var tags = []

  each(document.querySelectorAll(selector), function(root) {
    if (root.riot) return

    var tagName = root.tagName.toLowerCase(),
        tag = mountTo(root, tagName, opts)

    if (tag) tags.push(tag)
  })

  return tags
}

// update everything
riot.update = function() {
  each(virtual_dom, function(tag) {
    tag.update()
  })
  return virtual_dom
}

  
  // share methods for other riot parts, e.g. compiler
  riot.util = { brackets: brackets, tmpl: tmpl }

  // support CommonJS
  if (typeof exports === 'object')
    module.exports = riot

  // support AMD
  else if (typeof define === 'function' && define.amd)
    define(function() { return riot })

  // support browser
  else
    this.riot = riot

})();
