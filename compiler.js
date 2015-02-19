
;(function(is_server) {

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

  var LINE_TAG = /^<([\w\-]+)>(.*)<\/\1>/gim,
      QUOTE = /=({[^}]+})([\s\/\>])/g,
      BOOLEAN = /([\w\-]+)=["']({[^}]+})["']/g,
      EXPR = /{\s*([^}]+)\s*}/g,
      // (tagname) (html) (javascript) endtag
      CUSTOM_TAG = /^<([\w\-]+)>([^\x00]*[\w\/}]>$)?([^\x00]*?)^<\/\1>/gim,
      SCRIPT = /<script(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/gm,
      STYLE = /<style(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/style>/gm,
      HTML_COMMENT = /<!--.*?-->/g,
      CLOSED_TAG = /<([\w\-]+)([^>]*)\/\s*>/g,
      LINE_COMMENT = /^\s*\/\/.*$/gm,
      JS_COMMENT = /\/\*[^\x00]*?\*\//gm



  function compileHTML(html, opts, type) {

    var brackets = riot.util.brackets

    // whitespace
    html = html.replace(/\s+/g, ' ')

    // strip comments
    html = html.trim().replace(HTML_COMMENT, '')

    // foo={ bar } --> foo="{ bar }"
    html = html.replace(brackets(QUOTE), '="$1"$2')

    // alter special attribute names
    html = html.replace(brackets(BOOLEAN), function(full, name, expr) {
      name = name.toLowerCase()

      // <img src> --> <img riot-src>
      if (name == 'src') name = 'riot-' + name

      // IE8 looses boolean attr values: `checked={ expr }` --> `__checked={ expr }`
      else if (BOOL_ATTR.indexOf(name) >= 0) name = '__' + name

      return name + '="' + expr + '"'
    })

    // run trough parser
    if (opts.expr) {
      html = html.replace(brackets(EXPR), function(_, expr) {
        var ret = compileJS(expr, opts, type).trim().replace(/\r?\n|\r/g, '').trim()
        if (ret.slice(-1) == ';') ret = ret.slice(0, -1)
        return B[0] + ret + B[1]
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

  function coffee(js) {
    return require('coffee-script').compile(js, { bare: true })
  }

  function es6(js) {
    return require('babel').transform(js, { blacklist: ['useStrict'] }).code
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
      if (l[0] != '}' && l.indexOf('(') > 0 && l.indexOf('function') == -1) {
        var end = /[{}]/.exec(l.slice(-1)),
            m = end && /(\s+)([\w]+)\s*\(([\w,\s]*)\)\s*\{/.exec(line)

        if (m && !/^(if|while|switch|for)$/.test(m[2])) {
          lines[i] = m[1] + 'this.' + m[2] + ' = function(' + m[3] + ') {'

          // foo() { }
          if (end[0] == '}') {
            lines[i] += ' ' + l.slice(m[0].length - 1, -1) + '}.bind(this)'

          } else {
            es6_ident = m[1]
          }
        }

      }

      // method end
      if (line.slice(0, es6_ident.length + 1) == es6_ident + '}') {
        lines[i] = es6_ident + '}.bind(this);'
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

  function compileCSS(style, styleType) {
    //TODO: compile LESS, Sass, ...etc.

    style = style.replace(/\s+/g, ' ')
    style = style.trim()
    style = style.replace(/'/g, "\\'")
    return style
  }

  function mktag(name, html, css, js) {
    return 'riot.tag(\''
      + name + '\', \''
      + html + '\''
      + (css ? ', \'' + css + '\'' : '')
      + ', function(opts) {' + js + '\n});'
  }

  function compile(src, opts) {

    opts = opts || {}

    if (opts.brackets) riot.settings.brackets = opts.brackets

    if (opts.template) src = compileTemplate(opts.template, src)

    src = src.replace(LINE_TAG, function(_, tagName, html) {
      return mktag(tagName, compileHTML(html, opts), '')
    })

    return src.replace(CUSTOM_TAG, function(_, tagName, html, js) {

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

      // styles in <style> tag
      var style = ''
      var styleType = 'css'

      html = html.replace(STYLE, function(_, fullType, _type, _style) {
        if (_type) styleType = _type.replace('text/', '')
        style = _style
        return ''
      })

      return mktag(
        tagName,
        compileHTML(html, opts, type),
        compileCSS(style, styleType),
        compileJS(js, opts, type)
      )

    })

  }


  // io.js (node)
  if (is_server) {
    this.riot = require(process.env.RIOT || '../riot')
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
