
var BOOL_ATTR = ('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,'+
  'defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,'+
  'indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,'+
  'pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,'+
  'typemustmatch,visible').split(',')


module.exports = function(input, opts) {

  opts = opts || {}

  var lines = input.split('\n'),
      is_markup,
      is_comment,
      es6_ident,
      tag_name,
      html = '',
      out = [],
      tag


  lines.map(function(line, i) {
    var l = line.trim(),
        beg = l[0],
        end = l.slice(-1)

    // line comment
    if (l.slice(0, 2) == '//') return

    // multiline comment
    if (l.slice(0, 2) == '/*' || l.slice(0, 4) == '<!--') is_comment = true

    // comment end
    if (is_comment) {
      if (l.slice(-2) == '*/' || l.slice(-3) == '-->') is_comment = false
      return
    }

    // tag name
    if (beg == '<') tag_name = l.slice(1).split(/[^\w-]/)[0]


    // custom tag start && end
    if (line[0] == '<') {

      var is_tag_end  = line[1] == '/'

      is_markup = !is_tag_end

      // tag end
      if (is_tag_end) {

        /*
          quoted: value={ expr } --> value="{ expr }"
          boolean: checked={ expr } --> __checked={ expr } // IE8 looses boolean expressions

          test: <div href="joo{kama}" id="{ key }-page" fo={ bar } ka={ jou } class={ loading: is_loading }>
        */
        html = html.replace(/([\w\-]+)=["']?(\{[^\}]+\})(["'\s\>])/g, function(full, name, expr, end) {
          if (BOOL_ATTR.indexOf(name.toLowerCase()) >= 0) name = '__' + name
          if (/["']/.test(end)) end = ''
          return name + '="' + expr + '"' + end
        })

        // escape single quotes
        html = html.replace(/'/g, "\\'")

        // compact
        if (opts.compact) html = html.replace(/> </g, '><')

        out[tag.index] = 'riot.tag(\'' +tag.name+ '\', \'' + html.trim() + '\', function(opts) {'

        html = tag = ''

        out.push('})')

      // tag start
      } else {
        tag = { index: out.length, name: tag_name }

      }

      return
    }

    // start of JavaScript
    if (is_markup && (/^(var\s|function|this)/.test(l) || (end == '{' || end == ')'))) {
      is_markup = false
      out.push(line)
    }

    // nested HTML
    if (is_markup) {

      // <foo/> -> <foo></foo>
      if (line.slice(-2) == '/>') line = line.replace('/>', '></' + tag_name + '>')

      if (tag_name == 'textarea' || tag_name == 'pre') {
        line += '\\n'
      } else {
        line = line.replace(/\s+/g, ' ')
      }

      html += line
      return


    // nested JS
    } else if (l && tag) {

      /* ES6 method signatures */

      // method start
      if (l.indexOf('(') > 0 && l.slice(-1) == '{' && l.indexOf('function') == -1) {
        var m = /(\s+)([\w]+)\s*\(([\w,\s]*)\)\s*\{/.exec(line)

        if (m && !/^(if|while|switch|for)$/.test(m[2])) {
          line = '  this.' + m[2] + ' = function(' + m[3] + ') {'
          es6_ident = m[1]
        }

      }

      // method end
      if (line == es6_ident + '}') {
        line += '.bind(this)'
        es6_ident = ''
      }

    }

    out.push(line)

  })

  return out.join('\n')

    // preserve escaped curly brackets (so they don't get parsed by JavaScript to just "{")
    .replace(/\\[{}]/g, '\\$&')

}


