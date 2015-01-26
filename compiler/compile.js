
var BOOL_ATTR = ('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,'+
  'defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,'+
  'indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,'+
  'pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,'+
  'typemustmatch,visible').split(',')


// (tagname) (html) (javascript) endtag
var CUSTOM_TAG = /^<([\w\-]+)>([^\x00]*[\w\/]>$)([^\x00]*?)^<\/\1>/gim,
    SCRIPT = /<script([^>]+)?>([^\x00]*?)<\/script>/gm,
    HTML_COMMENT = /<!--.*-->/g,
    CLOSED_TAG = /<([\w\-]+)([^\/]*)\/\s*>/g,
    LINE_COMMENT = /^\s*\/\/.*$/gm,
    JS_COMMENT = /\/\*[^\x00]*?\*\//gm


function compileHTML(html, opts) {

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

  // <foo/> -> <foo></foo>
  html = html.replace(CLOSED_TAG, function(_, tagName, attr) {
    return '<' + tagName + (attr ? ' ' + attr.trim() : '') + '></' + tagName + '>'
  })

  // escape single quotes
  html = html.replace(/'/g, "\\'")


  // \{ jotain \} --> \\{ jotain \\}
  html = html.replace(/\\[{}]/g, '\\$&')

  // compact: no whitespace between tags
  if (opts.compact) html = html.replace(/> </g, '><')

  return html

}


function compileJS(js) {

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

module.exports = function(source, opts) {

  opts = opts || {}

  return source.replace(CUSTOM_TAG, function(_, tagName, html, js) {
    var script_type

    // js wrapped inside <script> tag
    if (!js.trim()) {
      html = html.replace(SCRIPT, function(_, type, script) {
        script_type = type && type.replace(/['"]/g, '').split(/type=/i)[1]
        js = script
        return ''
      })
    }

    return 'riot.tag(\'' +tagName+ '\', \'' + compileHTML(html, opts) + '\', function(opts) {' +
      compileJS(js) +
    '\n});'

  })

}
