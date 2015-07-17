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

var REGLOB = 'g'

function newRegExp(restr, opts) {

  return new RegExp(restr, opts)

}

var brackets = (function (defaults) {

  var cachedBrackets,
      pairs

  function updateCache(s) {
    cachedBrackets = s

    pairs = s.split(' ')
            .concat(s.replace(/(?=[$\.\?\+\*\[\(\)\|^\\])/g, '\\').split(' '))

    pairs[4] = brackets(/\\({|})/g)

    s = '(\\\\?)('

    pairs[5] = newRegExp(s + pairs[2] + ')', REGLOB)

    pairs[6] = s           +
        '?:([{\\[\\(])|('  +
          pairs[3]         +
        '))'
  }

  return function _brackets(reOrIdx) {

    var s = riot.settings.brackets || defaults

    if (cachedBrackets !== s) updateCache(s)

    if (reOrIdx instanceof RegExp) {

      return s === defaults ?
        reOrIdx :

        newRegExp(
          reOrIdx.source.replace(/[{}]/g, function (b) { return pairs[(b === '}') + 2] }),
          reOrIdx.global && REGLOB
        )
    }

    return pairs[reOrIdx]

  }

})('{ }')

var tmpl = (function () {

  var cache = {},

      ICH_QSTRING = '\uFFF1',

      RE_QSMARKER = /@(\d+)\uFFF1/g,

      RE_QBLOCKS =
      /("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|((?:^|[-\+\*%~^&\|!=><\?:{\(\[,;]|\/\s)\s*)(\/(?!\/)(?:\[[^\]]*\]|\\.|[^/\[\\]+)*\/)/g
      // $1: string - big regexp but secure and fast!     | Comments (not captured)        | $2 matches valid token before regexp      | $3 the regexp

  function _tmpl(str, data) {

    return str && (cache[str] || (cache[str] = create(str))).call(data, data)

  }

  function create(str) {

    var hqb = [],
        expr,
        i,

        parts = splitByPairs(str)

    for (i = 1; i < parts.length; i += 2) {

      parts[i] = parts[i].replace(RE_QBLOCKS, function (match, qstr, prere, regex) {

        if (match.length > 2) {

          match = (qstr || regex) ?
            (prere || '') + '@' + (hqb.push(regex || match) -1) + ICH_QSTRING :
            ' '
        }

        return match
      })
    }

    if (parts.length > 2 || parts[0]) {

      var list = [],
          j

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr =

              i & 1 ?

              parseExpr(expr, 1, hqb) :

              '"' + expr
                .replace(/\r?\n|\r/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) list[j++] = expr

      }

      expr = j > 1 ?
             '[' + list.join(',') + '].join("")' :
             j ? '""+' + list[0] : '""'

    }
    else {

      expr = parseExpr(parts[1], 0, hqb)

    }

    expr = expr.replace(RE_QSMARKER, function (_, pos) {
            return hqb[pos | 0]
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
          })

    return new Function('D', 'return ' + expr + ';')

  }

  function splitByPairs(str) {

    var parts = [],
        start,
        match,
        pos,
        isexpr,
        eb  = brackets(4),
        re  = brackets(5),

        REs = [re, newRegExp(brackets(6) + '|' + RE_QBLOCKS.source, REGLOB)]

    start = isexpr = 0

    while ((match = re.exec(str))) {

      pos = match.index

      if (isexpr) {

        if (match[2]) {

          re.lastIndex = skipBracketedPart(str, match[2], !!match[1] + pos, 1)
          continue
        }

        if (!match[3])
          continue
      }

      if (!match[1]) {

        unescapeStr(str.slice(start, pos))

        start = re.lastIndex
        re = REs[isexpr ^= 1]
        re.lastIndex = start
      }
    }

    if (start < str.length)
      unescapeStr(str.slice(start))

    return parts

    function unescapeStr(str) {
      parts.push(str && str.replace(eb, '$1'))
    }

  }

  function parseExpr(expr, mode, qstr) {

    expr = expr
          .replace(/\s+/g, ' ')
          .replace(/^ | ?([\(\[{},\?\.:]) ?| $/g, '$1')

    if (!expr) return ''

    var csinfo = [],
        cslist

    if (!extractCSList(expr, csinfo)) {

      return wrapExpr(expr, mode)
    }

    cslist = csinfo.map(function (kv) {

      if (kv[0])
        kv[1] = qstr[kv[0] | 0]
          .slice(1, -1)
          .replace(/\s+/g, ' ').trim()

      return '(' +
          wrapExpr(kv[2], 0) +
          ')?"'  + kv[1]  + '":""'

    })

    return cslist.length < 2 ?
       cslist[0] :
      '[' + cslist.join(',') + '].join(" ").trim()'

  }

  var

      CSNAME_PART = newRegExp(
        '^(' +
        RE_QSMARKER.source +
        '|-?[_A-Za-z][-\\w]*' +
        '):'
      ),

      CSPART_END = /,|([\[{\(])|$/g

  function extractCSList(str, list) {

    var match,
        end,
        gre,
        ch,
        n = 0

    while (str &&
          (match = str.match(CSNAME_PART)) &&
          !match.index
      ) {

      gre = RegExp
      str = gre.rightContext
      CSPART_END.lastIndex = 0

      while ((end = CSPART_END.exec(str)) && (ch = end[1])) {
        CSPART_END.lastIndex = skipBracketedPart(str, ch, end.index)
      }

      list[n++] = [
          match[2],
          match[1],
          str.slice(0, end.index)
        ]

      str = gre.rightContext
    }

    return n

  }

  function skipBracketedPart(str, opench, chpos, qskip) {

    var recch = opench === '(' ? /[\(\)]/g :
                opench === '[' ? /[\[\]]/g : /[{}]/g,
        match,
        level = 1

    if (qskip)
      recch = newRegExp(recch.source + '|' + RE_QBLOCKS.source, REGLOB)
    else
      chpos++

    recch.lastIndex = chpos

    while (level && (match = recch.exec(str))) {

      if (match[0].length < 2)
         (match[0] !== opench ? --level : qskip ? (qskip = 0) : ++level)
    }

    return match ? recch.lastIndex : str.length

  }

  var

      VAR_CONTEXT = '"in D?D:' + (typeof window === T_OBJECT ? 'window' : 'global') + ').',

      SRE_VARNAME = '[$_A-Za-z][$\\w]*',

      JS_VARSTART = newRegExp(
          '(^ *|[^$\\w\\.])' +
          '(?!(?:typeof|in|instanceof|void|true|new|function)[^$\\w])' +

          '(' + SRE_VARNAME + ')'
        ),

      JS_OBJKEYS = newRegExp(
          '(?=[,{]'   +
          SRE_VARNAME +
          ':)(.)',
          REGLOB
        ),

      JS_FALSY = {
        'this': 0,
        'window': 0,
        'global': 0,
        'undefined': 1,
        'false': 1,
        'null': 1,
        'NaN': 1
        }

  function wrapExpr(expr, txt) {

    var okeys = ~expr.indexOf('{')
    if (okeys)
      expr = expr.replace(JS_OBJKEYS, '$1\uFFF30')

    var match = expr.match(JS_VARSTART)
    if (match) {

      var ss = [],
          mvar,
          wrap = 0,
          gre = RegExp

      do {

        ss.push(gre.leftContext + (match[1] || ''))
        expr = gre.rightContext
        mvar = match[2]

        if (JS_FALSY[mvar])
          ss.push(txt ? '""' : mvar)

        else {
          ss.push(mvar in JS_FALSY ? mvar : '("' + mvar + VAR_CONTEXT + mvar)

          wrap = wrap || txt || /^[\[\(\.]/.test(expr)
        }

      } while ((match = expr.match(JS_VARSTART)))

      expr = (ss.join('') + expr).trim()

      if (wrap)
        expr = '(function(v){try{v=' + expr +
                '}catch(e){}return ' + (txt ? 'v||v===0?v:""' : 'v') + '}).call(D)'

    }

    return okeys ? expr.replace(/\uFFF30/g, '') : expr

  }

  return _tmpl

})()
