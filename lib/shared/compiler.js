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
  QUOTE = /=({[^}]+})([\s\/\>]|$)/g,
  SET_ATTR = /([\w\-]+)=(["'])([^\2]+?)\2/g,
  EXPR = /{\s*([^}]+)\s*}/g,
  // (tagname) (html) (javascript) endtag
  CUSTOM_TAG = /^<([\w\-]+)\s?([^>]*)>([^\x00]*[\w\/}"']>$)?([^\x00]*?)^<\/\1>/gim,
  SCRIPT = /<script(?:\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/gi,
  STYLE = /<style(?:\s+([^>]+))?>([^\x00]*?)<\/style>/gi,
  CSS_SELECTOR = /(^|\}|\{)\s*([^\{\}]+)\s*(?=\{)/g,
  HTML_COMMENT = /<!--.*?-->/g,
  CLOSED_TAG = /<([\w\-]+)([^>]*)\/\s*>/g,
  BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g,
  LINE_COMMENT = /^\s*\/\/.*$/gm,
  INPUT_NUMBER = /(<input\s[^>]*?)type=['"]number['"]/gm

function mktag(name, html, css, attrs, js) {
  return 'riot.tag(\'' +
    name + '\', \'' +
    html + '\'' +
    (css ? ', \'' + css + '\'' : '') +
    (attrs ? ', \'' + attrs.replace(/'/g, "\\'") + '\'' : '') +
    ', function(opts) {' + js + '\n});'
}

function compileHTML(html, opts, type) {

  if (!html) return ''

  var brackets = riot.util.brackets,
      b0 = brackets(0),
      b1 = brackets(1)

  // foo={ bar } --> foo="{ bar }"
  html = html.replace(brackets(QUOTE), '="$1"$2')

  // whitespace
  html = opts.whitespace ? html.replace(/\r\n?|\n/g, '\\n') : html.replace(/\s+/g, ' ')

  // strip comments
  html = html.trim().replace(HTML_COMMENT, '')

  // input type=numbr
  html = html.replace(INPUT_NUMBER, '$1riot-type='+ b0 +'"number"'+ b1) // fake expression

  // alter special attribute names
  html = html.replace(SET_ATTR, function(full, name, _, expr) {
    if (expr.indexOf(b0) >= 0) {
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
      var ret = compileJS(expr, opts, type).trim().replace(/[\r\n]+/g, '').trim()
      if (ret.slice(-1) == ';') ret = ret.slice(0, -1)
      return b0 + ret + b1
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
  js = js.replace(LINE_COMMENT, '').replace(BLOCK_COMMENT, '')

  // ES6 method signatures
  var lines = js.split('\n'),
      es6Ident = ''

  lines.forEach(function(line, i) {
    var l = line.trim()

    // method start
    if (l[0] != '}' && ~l.indexOf('(')) {
      var end = l.match(/[{}]$/),
          m = end && line.match(/^(\s+)([$\w]+)\s*\(([$\w,\s]*)\)\s*\{/)

      if (m && !/^(if|while|switch|for|catch|function)$/.test(m[2])) {
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
  // 1. Remove CSS comments
  // 2. Find selectors and separate them by conmma
  // 3. keep special selectors as is
  // 4. prepend tag and [riot-tag]
  return style.replace(BLOCK_COMMENT, '').replace(CSS_SELECTOR, function (m, p1, p2) {
    return p1 + ' ' + p2.split(/\s*,\s*/g).map(function(sel) {
      var s = sel.trim()
      var t = (/:scope/.test(s) ? '' : ' ') + s.replace(/:scope/, '')
      return s[0] == '@' || s == 'from' || s == 'to' || /%$/.test(s) ? s :
        tag + t + ', [riot-tag="' + tag + '"]' + t
    }).join(',')
  }).trim()
}

function compileJS(js, opts, type) {
  if (!js) return ''
  var parser = opts.parser || (type ? riot.parsers.js[type] : riotjs)
  if (!parser) throw new Error('Parser not found "' + type + '"')
  return parser(js.replace(/\r\n?/g, '\n'), opts)
}

function compileTemplate(lang, html) {
  var parser = riot.parsers.html[lang]
  if (!parser) throw new Error('Template parser not found "' + lang + '"')
  return parser(html.replace(/\r\n?/g, '\n'))
}

function compileCSS(style, tag, type, scoped) {
  if (type === 'scoped-css') scoped = 1
  else if (riot.parsers.css[type]) style = riot.parsers.css[type](tag, style)
  else if (type !== 'css') throw new Error('CSS parser not found: "' + type + '"')
  if (scoped) style = scopedCSS(tag, style)
  return style.replace(/\s+/g, ' ').replace(/\\/g, '\\\\').replace(/'/g, "\\'").trim()
}

function compile(src, opts) {

  if (!opts) opts = {}
  else {

    if (opts.brackets) riot.settings.brackets = opts.brackets

    if (opts.template) src = compileTemplate(opts.template, src)
  }

  src = src.replace(LINE_TAG, function(_, tagName, html) {
    return mktag(tagName, compileHTML(html, opts), '', '', '')
  })

  return src.replace(CUSTOM_TAG, function(_, tagName, attrs, html, js) {
    var style = '',
        type = opts.type

    if (html) {

      // js wrapped inside <script> tag
      if (!js.trim()) {
        html = html.replace(SCRIPT, function(_, _type, script) {
          if (_type) type = _type.replace('text/', '')
          js = script
          return ''
        })
      }

      // styles in <style> tag
      html = html.replace(STYLE, function(_, types, _style) {
        var scoped = /(?:^|\s+)scoped(\s|=|$)/i.test(types),
            type = types && types.match(/(?:^|\s+)type\s*=\s*['"]?([^'"\s]+)['"]?/i)
        if (type) type = type[1].replace('text/', '')
        style += (style ? ' ' : '') + compileCSS(_style.trim(), tagName, type || 'css', scoped)
        return ''
      })
    }

    return mktag(
      tagName,
      compileHTML(html, opts, type),
      style,
      compileHTML(attrs, ''),
      compileJS(js, opts, type)
    )

  })

}
