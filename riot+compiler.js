/* Riot v2.0.9, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function() {

var riot = { version: 'v2.0.9', settings: {} }

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


// Customizable brackets

  riot.settings.brackets = '[ ]'
  riot.settings.brackets = '<% %>'

*/

var tmpl = (function() {

  var cache = {},
      brackets,
      re_expr,
      re_vars = /("|').+?[^\\]\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function *\()|([a-z_]\w*)/gi
              // [ 1            ][ 2  ][ 3 ][ 4                                                                                  ][ 5       ]
              // find variable names:
              // 1. skip quoted strings: "a b", 'a b', 'a \'b\''
              // 2. skip object properties: .name
              // 3. skip object literals: name:
              // 4. skip javascript keywords
              // 5. match var name

  return function(str, data) {

    // make sure we use current brackets setting
    var b = riot.settings.brackets || '{ }'
    if (b != brackets) {
      brackets = b.split(' ')
      re_expr = re(/({[\s\S]*?})/)
    }

    // build a template (or get it from cache), render with data
    // (or just test if string has expression when called w/o data)
    return data
      ? str && (cache[str] = cache[str] || tmpl(str))(data)
      : re_expr.test(str)

  }


  // create a template instance

  function tmpl(s, p) {

    // default template string to {}
    p = (s || brackets.join(''))

      // temporarily convert \{ and \} to a non-character
      .replace(re(/\\{/), '\uFFF0')
      .replace(re(/\\}/), '\uFFF1')

      // split string to expression and non-expresion parts
      .split(re_expr)

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
      .replace(/\uFFF0/g, brackets[0])
      .replace(/\uFFF1/g, brackets[1])

    )

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n/g, ' ')

      // trim whitespace, curly brackets, strip comments
      .replace(re(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w- "']+ *:/.test(s)

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      ? '[' + s.replace(/\W*([\w- ]+)\W*:([^,]+)/g, function(_, k, v) {

          // safely execute vars to prevent undefined value errors
          return v.replace(/\w[^,|& ]*/g, function(v) { return wrap(v, n) }) + '?"' + k.trim() + '":"",'

        }) + '].join(" ")'

      // if js expression, evaluate as javascript
      : wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    return '(function(v){try{v='

        // prefix vars (name => data.name)
        + (s.replace(re_vars, function(s, _, v) { return v ? '(d.'+v+'===undefined?window.'+v+':d.'+v+')' : s })

          // break the expression if its empty (resulting in undefined value)
          || 'x')

      + '}finally{return '

        // default to empty string for falsy values except zero
        + (nonull ? '!v&&v!==0?"":v' : 'v')

      + '}}).call(d)'
  }


  // change regexp to use custom brackets

  function re(r) {
    return RegExp(r.source
                   .split('{').join('\\'+brackets[0])
                   .split('}').join('\\'+brackets[1]),
                  r.global ? 'g' : '')
  }

})()
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var ret = { val: expr },
      els = expr.split(/\s+in\s+/)

  if (els[1]) {
    ret.val = expr_begin + els[1]
    els = els[0].slice(expr_begin.length).trim().split(/,\s*/)
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

function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      prev = dom.previousSibling,
      root = dom.parentNode,
      rendered = [],
      tags = [],
      checksum

  expr = loopKeys(expr)

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
      tags.map(function(tag) { tag.unmount() })
      tags = rendered = []

      items = Object.keys(items).map(function(key) {
        return mkitem(expr, key, items[key])
      })

    }

    // unmount redundant
    arrDiff(rendered, items).map(function(item) {
      var pos = rendered.indexOf(item),
          tag = tags[pos]

      if (tag) {
        tag.unmount()
        rendered.splice(pos, 1)
        tags.splice(pos, 1)
      }

    })

    // mount new
    var nodes = root.childNodes,
        prev_index = [].indexOf.call(nodes, prev)

    arrDiff(items, rendered).map(function(item, i) {

      var pos = items.indexOf(item)

      if (!checksum && expr.key) item = mkitem(expr, item, pos)

      var tag = new Tag({ tmpl: template }, {
        before: nodes[prev_index + 1 + pos],
        parent: parent,
        root: root,
        loop: true,
        item: item
      })

      tags.splice(pos, 0, tag)

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
    if (val.indexOf(expr_begin) >= 0) {
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
      opts = conf.opts,
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
    if (val.indexOf(expr_begin) >= 0) {
      remAttr(root, name)
      return false
    }
  })

  // options
  function updateOpts() {
    Object.keys(attributes).map(function(name) {
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
    self.trigger('update')
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
      parent && parent.off('update', self.update)
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

    tag.update()
  }

}

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

    // remove attribute
    if (!value && expr.bool || /obj|func/.test(typeof value)) remAttr(dom, attr_name)

    // event handler
    if (typeof value == 'function') {
      setEventHandler(attr_name, value, dom, tag, item)

    // if- conditional
    } else if (attr_name == 'if') {
      remAttr(dom, attr_name)

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
      remAttr(dom, attr_name)
      if (attr_name == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // normal attribute
    } else if (attr_name == 'value') {
      dom.value = value

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
function each(nodes, fn) {
  for (var i = 0; i < (nodes || []).length; i++) {
    if (fn(nodes[i], i) === false) i--
  }
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

function extend(obj, from) {
  from && Object.keys(from).map(function(key) {
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

/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtual_dom = [],
    tag_impl = {},
    expr_begin

riot.tag = function(name, html, fn) {
  expr_begin = expr_begin || (riot.settings.brackets || '{ }').split(' ')[0]
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

    var tagName = root.tagName.toLowerCase(),
        tag = mountTo(root, tagName, opts)

    if (tag) tags.push(tag)
  })

  return tags
}

// update everything
riot.update = function() {
  virtual_dom.map(function(tag) {
    tag.update()
  })
  return virtual_dom
}


;(function(is_node) {

  var BOOL_ATTR = ('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,'+
    'defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,'+
    'indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,'+
    'pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,'+
    'typemustmatch,visible').split(',')

  var VOID_TAGS = 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.split(',')

  var HTML_PARSERS = {
    jade: jade
  }

  var JS_PARSERS = {
    coffeescript: coffee,
    none: plainjs,
    cs: coffee,
    es6: es6,
    typescript: typescript,
    livescript: livescript,
    ls: livescript
  }

  // (tagname) (html) (javascript) endtag
  var CUSTOM_TAG = /^<([\w\-]+)>([^\x00]*[\w\-\/]>$)?([^\x00]*?)^<\/\1>/gim,
      SCRIPT = /<script(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/gm,
      HTML_COMMENT = /<!--.*?-->/g,
      CLOSED_TAG = /<([\w\-]+)([^>]*)\/\s*>/g,
      LINE_COMMENT = /^\s*\/\/.*$/gm,
      JS_COMMENT = /\/\*[^\x00]*?\*\//gm


  function compileHTML(html, opts, type) {

    // whitespace
    html = html.replace(/\s+/g, ' ')

    // strip comments
    html = html.trim().replace(HTML_COMMENT, '')

    // foo={ bar } --> foo="{ bar }"
    html = html.replace(/=(\{[^\}]+\})([\s\/\>])/g, '="$1"$2')

    // IE8 looses boolean attr values: `checked={ expr }` --> `__checked={ expr }`
    html = html.replace(/([\w\-]+)=["'](\{[^\}]+\})["']/g, function(full, name, expr) {
      if (BOOL_ATTR.indexOf(name.toLowerCase()) >= 0) name = '__' + name
      return name + '="' + expr + '"'
    })

    // run trough parser
    if (opts.expr) {
      html = html.replace(/\{\s*([^\}]+)\s*\}/g, function(_, expr) {
         return '{' + compileJS(expr, opts, type).trim().replace(/\r?\n|\r/g, '') + '}'
      })
    }

    // <foo/> -> <foo></foo>
    html = html.replace(CLOSED_TAG, function(_, name, attr) {
      var tag = '<' + name + (attr ? ' ' + attr.trim() : '') + '>'

      // Do not self-close HTML5 void tags
      if (VOID_TAGS.indexOf(name.toLowerCase()) == -1) tag += '</' + name + '>'
      return tag
    })

    // escape single quotes
    html = html.replace(/'/g, "\\'")


    // \{ jotain \} --> \\{ jotain \\}
    html = html.replace(/\\[{}]/g, '\\$&')

    // compact: no whitespace between tags
    if (opts.compact) html = html.replace(/> </g, '><')

    return html

  }

  function coffee(js) {
    return require('coffee-script').compile(js, { bare: true })
  }

  function es6(js) {
    return require('6to5').transform(js, { blacklist: ['useStrict'] }).code
  }

  function typescript(js) {
    return require('typescript-simple')(js)
  }

  function livescript(js) {
    return require('LiveScript').compile(js, { bare: true, header: false })
  }

  function plainjs(js) {
    return js
  }

  function jade(html) {
    return require('jade').render(html, {pretty: true})
  }

  function riotjs(js) {

    // strip comments
    js = js.replace(LINE_COMMENT, '').replace(JS_COMMENT, '')

    // ES6 method signatures
    var lines = js.split('\n'),
        es6_ident = ''

    lines.forEach(function(line, i) {
      var l = line.trim()

      // method start
      if (l[0] != '}' && l.indexOf('(') > 0 && l.slice(-1) == '{' && l.indexOf('function') == -1) {
        var m = /(\s+)([\w]+)\s*\(([\w,\s]*)\)\s*\{/.exec(line)

        if (m && !/^(if|while|switch|for)$/.test(m[2])) {
          lines[i] = m[1] + 'this.' + m[2] + ' = function(' + m[3] + ') {'
          es6_ident = m[1]
        }

      }

      // method end
      if (line.slice(0, es6_ident.length + 1) == es6_ident + '}') {
        lines[i] = es6_ident + es6_ident + 'this.update()\n' + es6_ident + '}.bind(this);'
        es6_ident = ''
      }

    })

    return lines.join('\n')

  }


  function compileJS(js, opts, type) {
    var parser = opts.parser || (type ? JS_PARSERS[type] : riotjs)
    if (!parser) throw new Error('Parser not found "' + type + '"')
    return parser(js, opts)
  }

  function compileTemplate(lang, html) {
    var parser = HTML_PARSERS[lang]
    if (!parser) throw new Error('Template parser not found "' + lang + '"')
    return parser(html)
  }

  function compile(riot_tag, opts) {

    opts = opts || {}

    if (opts.template) riot_tag = compileTemplate(opts.template, riot_tag)

    return riot_tag.replace(CUSTOM_TAG, function(_, tagName, html, js) {

      html = html || ''

      // js wrapped inside <script> tag
      var type = opts.type

      if (!js.trim()) {
        html = html.replace(SCRIPT, function(_, fullType, _type, script) {
          if (_type) type = _type.replace('text/', '')
          js = script
          return ''
        })
      }

      return 'riot.tag(\'' +tagName+ '\', \'' + compileHTML(html, opts, type) + '\', function(opts) {' +
        compileJS(js, opts, type) +
      '\n});'

    })

  }


  // node and io.js
  if (is_node) {
    return module.exports = {
      html: compileHTML,
      compile: compile
    }
  }

  // browsers
  var doc = document,
      promise,
      ready


  function GET(url, fn) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) fn(req.responseText)
    }
    req.open('GET', url, true)
    req.send('')
  }

  function unindent(src) {
    var ident = /[ \t]+/.exec(src)
    if (ident) src = src.replace(new RegExp('^' + ident[0], 'gm'), '')
    return src
  }

  function globalEval(js) {
    var node = doc.createElement('script'),
        root = doc.documentElement

    node.text = compile(js)
    root.appendChild(node)
    root.removeChild(node)
  }

  function compileScripts(fn) {
    var scripts = doc.querySelectorAll('script[type="riot/tag"]')

    ;[].map.call(scripts, function(script, i) {
      var url = script.getAttribute('src')

      function compileTag(source) {
        globalEval(source)

        if (i + 1 == scripts.length) {
          promise.trigger('ready')
          ready = true
          fn && fn()
        }
      }

      return url ? GET(url, compileTag) : compileTag(unindent(script.innerHTML))
    })

  }


  riot.compile = function(arg, fn) {

    // string
    if (typeof arg == 'string') {

      // compile & return
      if (arg.trim()[0] == '<') {
        var js = unindent(compile(arg))
        if (!fn) globalEval(js)
        return js

      // URL
      } else {
        return GET(arg, function(str) {
          var js = unindent(compile(str))
          globalEval(js)
          fn && fn(js, str)
        })
      }
    }

    // must be a function
    if (typeof arg != 'function') arg = undefined

    // all compiled
    if (ready) return arg && arg()

    // add to queue
    if (promise) {
      arg && promise.on('ready', arg)

    // grab riot/tag elements + load & execute them
    } else {
      promise = riot.observable()
      compileScripts(arg)
    }

  }

  // reassign mount methods
  var mount = riot.mount,
      mountTo = riot.mountTo

  riot.mount = function(a, b) {
    var ret
    riot.compile(function() { ret = mount(a, b) })
    return ret
  }

  riot.mountTo = function(a, b, c) {
    var ret
    riot.compile(function() { ret = mountTo(a, b, c) })
    return ret
  }

})(!this.top)

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
