

(function(is_node) {

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
    typescript: typescript
  }

  // (tagname) (html) (javascript) endtag
  var CUSTOM_TAG = /^<([\w\-]+)>([^\x00]*[\w\/]>$)?([^\x00]*?)^<\/\1>/gim,
      SCRIPT = /<script(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/gm,
      HTML_COMMENT = /<!--.*?-->/g,
      CLOSED_TAG = /<([\w\-]+)([^\/]*)\/\s*>/g,
      LINE_COMMENT = /^\s*\/\/.*$/gm,
      JS_COMMENT = /\/\*[^\x00]*?\*\//gm


  function compileHTML(html, opts, type) {

    // whitespace
    html = html.replace(/\s+/g, ' ')

    // strip comments
    html = html.trim().replace(HTML_COMMENT, '')

    // foo={ bar } --> foo="{ bar }"
    html = html.replace(/=(\{[^\}]+\})([\s\>])/g, '="$1"$2')

    // IE8 looses boolean attr values: `checked={ expr }` --> `__checked={ expr }`
    html = html.replace(/([\w\-]+)=["'](\{[^\}]+\})["']/g, function(full, name, expr) {
      if (BOOL_ATTR.indexOf(name.toLowerCase()) >= 0) name = '__' + name
      return name + '="' + expr + '"'
    })

    // run trough parser
    if (opts.expr) {
      html = html.replace(/\{\s*([^\}]+)\s*\}/g, function(_, expr) {
         return '{' + compileJS(expr, opts, type).trim() + '}'
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
    return require('6to5').transform(js).code
  }

  function typescript(js) {
    return require('typescript-simple')(js)
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
        lines[i] += '.bind(this);'
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
        script.parentNode.removeChild(script)
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

  function browserCompile(arg, skip_eval) {

    // string -> compile a new tag
    if (typeof arg == 'string') {
      var js = unindent(compile(arg))
      if (!skip_eval) globalEval(js)
      return js
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
    browserCompile(function() { mount(a, b) })
  }

  riot.mountTo = function(a, b, c) {
    browserCompile(function() { mountTo(a, b, c) })
  }

  riot._compile = function(str) {
    return browserCompile(str, true)
  }

})(!this.top)
