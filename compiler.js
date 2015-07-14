(function (root, factory) {
    if (typeof define === 'function' && define.amd)
      define(['riot'], factory)
    else if (typeof exports === 'object')
      factory(require('riot'))
    else factory(root.riot)
}(this, function (riot, undefined) {

  var T_STRING = 'string'
var parsers = {
  html: {},
  css: {},
  js: {
    coffee: function(js) {
      return CoffeeScript.compile(js, { bare: true })
    },
    es6: function(js) {
      return babel.transform(js, { blacklist: ['useStrict'] }).code
    },
    none: function(js) {
      return js
    }
  }
}

// fix 913
parsers.js.javascript = parsers.js.none
// 4 the nostalgics
parsers.js.coffeescript = parsers.js.coffee

riot.parsers = parsers


var BOOL_ATTR = ('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,'+
  'defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,'+
  'indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,'+
  'pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,'+
  'typemustmatch,visible').split(','),
  // these cannot be auto-closed
  VOID_TAGS = 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.split(','),
  /*
    Following attributes give error when parsed on browser with { exrp_values }

    'd' describes the SVG <path>, Chrome gives error if the value is not valid format
    https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
  */
  PREFIX_ATTR = ['style', 'src', 'd'],

  LINE_TAG = /^<([\w\-]+)>(.*)<\/\1>/gim,
  QUOTE = /=({[^}]+})([\s\/\>])/g,
  SET_ATTR = /([\w\-]+)=(["'])([^\2]+?)\2/g,
  EXPR = /{\s*([^}]+)\s*}/g,
  // (tagname) (html) (javascript) endtag
  CUSTOM_TAG = /^<([\w\-]+)\s?([^>]*)>([^\x00]*[\w\/}"']>$)?([^\x00]*?)^<\/\1>/gim,
  SCRIPT = /<script(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/gm,
  STYLE = /<style(\s+type=['"]?([^>'"]+)['"]?|\s+scoped)?>([^\x00]*?)<\/style>/gm,
  CSS_SELECTOR = /(^|\}|\{)\s*([^\{\}]+)\s*(?=\{)/g,
  CSS_COMMENT = /\/\*[^\x00]*?\*\//gm,
  HTML_COMMENT = /<!--.*?-->/g,
  CLOSED_TAG = /<([\w\-]+)([^>]*)\/\s*>/g,
  LINE_COMMENT = /^\s*\/\/.*$/gm,
  JS_COMMENT = /\/\*[^\x00]*?\*\//gm,
  INPUT_NUMBER = /(<input\s[^>]*?)type=['"]number['"]/gm

function mktag(name, html, css, attrs, js) {
  return 'riot.tag(\''
    + name + '\', \''
    + html + '\''
    + (css ? ', \'' + css + '\'' : '')
    + (attrs ? ', \'' + attrs.replace(/'/g, "\\'") + '\'' : '')
    + ', function(opts) {' + js + '\n});'
}

function compileHTML(html, opts, type) {

  var brackets = riot.util.brackets

  // foo={ bar } --> foo="{ bar }"
  html = html.replace(brackets(QUOTE), '="$1"$2')

  // whitespace
  html = opts.whitespace ? html.replace(/\n/g, '\\n') : html.replace(/\s+/g, ' ')

  // strip comments
  html = html.trim().replace(HTML_COMMENT, '')

  // input type=numbr
  html = html.replace(INPUT_NUMBER, '$1riot-type='+brackets(0)+'"number"'+brackets(1)) // fake expression

  // alter special attribute names
  html = html.replace(SET_ATTR, function(full, name, _, expr) {
    if (expr.indexOf(brackets(0)) >= 0) {
      name = name.toLowerCase()

      if (PREFIX_ATTR.indexOf(name) >= 0) name = 'riot-' + name

      // IE8 looses boolean attr values: `checked={ expr }` --> `__checked={ expr }`
      else if (BOOL_ATTR.indexOf(name) >= 0) name = '__' + name
    }

    return name + '="' + expr + '"'
  })

  // run expressions trough parser
  if (opts.expr) {
    html = html.replace(brackets(EXPR), function(_, expr) {
      var ret = compileJS(expr, opts, type).trim().replace(/\r?\n|\r/g, '').trim()
      if (ret.slice(-1) == ';') ret = ret.slice(0, -1)
      return brackets(0) + ret + brackets(1)
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
  html = html.replace(brackets(/\\{|\\}/g), '\\$&')

  // compact: no whitespace between tags
  if (opts.compact) html = html.replace(/> </g, '><')

  return html

}


function riotjs(js) {

  // strip comments
  js = js.replace(LINE_COMMENT, '').replace(JS_COMMENT, '')

  // ES6 method signatures
  var lines = js.split('\n'),
      es6Ident = ''

  lines.forEach(function(line, i) {
    var l = line.trim()

    // method start
    if (l[0] != '}' && l.indexOf('(') > 0 && l.indexOf('function') == -1) {
      var end = /[{}]/.exec(l.slice(-1)),
          m = end && /(\s+)([\w]+)\s*\(([\w,\s]*)\)\s*\{/.exec(line)

      if (m && !/^(if|while|switch|for|catch)$/.test(m[2])) {
        lines[i] = m[1] + 'this.' + m[2] + ' = function(' + m[3] + ') {'

        // foo() { }
        if (end[0] == '}') {
          lines[i] += ' ' + l.slice(m[0].length - 1, -1) + '}.bind(this)'

        } else {
          es6Ident = m[1]
        }
      }

    }

    // method end
    if (line.slice(0, es6Ident.length + 1) == es6Ident + '}') {
      lines[i] = es6Ident + '}.bind(this);'
      es6Ident = ''
    }

  })

  return lines.join('\n')

}

function scopedCSS (tag, style, type) {
  return style.replace(CSS_COMMENT, '').replace(CSS_SELECTOR, function (m, p1, p2) {
    return p1 + ' ' + p2.split(/\s*,\s*/g).map(function(sel) {
      var s = sel.trim().replace(/:scope\s*/, '')
      return s[0] == '@' || s == 'from' || s == 'to' || /%$/.test(s) ? s :
        tag + ' ' + s + ', [riot-tag="' + tag + '"] ' + s
    }).join(',')
  }).trim()
}

function compileJS(js, opts, type) {
  var parser = opts.parser || (type ? riot.parsers.js[type] : riotjs)
  if (!parser) throw new Error('Parser not found "' + type + '"')
  return parser(js, opts)
}

function compileTemplate(lang, html) {
  var parser = riot.parsers.html[lang]
  if (!parser) throw new Error('Template parser not found "' + lang + '"')
  return parser(html)
}

function compileCSS(style, tag, type) {
  if (type == 'scoped-css') style = scopedCSS(tag, style)
  else if (riot.parsers.css[type]) style = riot.parsers.css[type](tag, style)
  return style.replace(/\s+/g, ' ').replace(/\\/g, '\\\\').replace(/'/g, "\\'").trim()
}

function compile(src, opts) {

  opts = opts || {}

  if (opts.brackets) riot.settings.brackets = opts.brackets

  if (opts.template) src = compileTemplate(opts.template, src)

  src = src.replace(LINE_TAG, function(_, tagName, html) {
    return mktag(tagName, compileHTML(html, opts), '', '', '')
  })

  return src.replace(CUSTOM_TAG, function(_, tagName, attrs, html, js) {
    html = html || ''
    attrs = compileHTML(attrs, '', '')

    // js wrapped inside <script> tag
    var type = opts.type

    if (!js.trim()) {
      html = html.replace(SCRIPT, function(_, fullType, _type, script) {
        if (_type) type = _type.replace('text/', '')
        js = script
        return ''
      })
    }

    // styles in <style> tag
    var styleType = 'css',
        style = ''

    html = html.replace(STYLE, function(_, fullType, _type, _style) {
      if (fullType && fullType.trim() == 'scoped') styleType = 'scoped-css'
        else if (_type) styleType = _type.replace('text/', '')
      style = _style
      return ''
    })

    return mktag(
      tagName,
      compileHTML(html, opts, type),
      compileCSS(style, tagName, styleType),
      attrs,
      compileJS(js, opts, type)
    )

  })

}
var doc = window.document,
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
  var scripts = doc.querySelectorAll('script[type="riot/tag"]'),
      scriptsAmount = scripts.length

  function done() {
    promise.trigger('ready')
    ready = true
    fn && fn()
  }

  if (!scriptsAmount) {
    done()
  } else {
    [].map.call(scripts, function(script) {
      var url = script.getAttribute('src')

      function compileTag(source) {
        globalEval(source)
        scriptsAmount--
        if (!scriptsAmount) {
          done()
        }
      }

      return url ? GET(url, compileTag) : compileTag(unindent(script.innerHTML))
    })
  }
}


riot.compile = function(arg, fn) {

  // string
  if (typeof arg === T_STRING) {

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
  if (typeof arg !== 'function') arg = undefined

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
var mount = riot.mount

riot.mount = function(a, b, c) {
  var ret
  riot.compile(function() { ret = mount(a, b, c) })
  return ret
}

// @deprecated
riot.mountTo = riot.mount
}));
