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

var brackets = (function (defaults) {

  var cachedBrackets,
      pairs

  function updateCache(s) {
    cachedBrackets = s

    pairs = s.split(' ')
            .concat(s.replace(/(?=[$\.\?\+\*\[\(\)\|^\\])/g, '\\').split(' '))

    pairs[4] = brackets(/\\({|})/g)

    pairs[5] = new RegExp(
        '(\\\\?)(?='       +
        '([{\\[\\(])|'     +
          pairs[2] + '|'   +
          pairs[3]         +
        ')(?:('            +
          pairs[2] + ')|(' +
          pairs[3]         +
        ')|.)?',
        'g')
  }

  return function _brackets(reOrIdx) {

    var s = riot.settings.brackets || defaults

    if (cachedBrackets !== s) updateCache(s)

    if (reOrIdx instanceof RegExp) {

      return s === defaults ?
        reOrIdx :

        new RegExp(
          reOrIdx.source.replace(/{|}/g, function (b) { return pairs[(b === '}') + 2] }),
          reOrIdx.global && 'g'
        )
    }

    return pairs[reOrIdx]

  }

})('{ }')

var tmpl = (function () {

  var cache = {}

  function _tmpl(str, data) {

    return str && (cache[str] || (cache[str] = create(str))).call(data, data)

  }

  var

    ICH_QSTRING = '\uFFF1',

    RE_QSMARKER = /@(\d+)\uFFF1/g,

    RE_QSTRINGS = /('|")(?:[^\\]|\\.)*?\1/g,

    RE_COMMENTS = /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g,

    RE_REGEXPS = /\/(?!\/|\*)((?:\[(?:[^\]\\]|\\.)*|[^/\\]|\\.)+\/)/,

    RE_PREREGS = /(?:^|[-\+\*%~^&\|!=><\?:{\(\[,;]|\/\s)\s*$/

  function create(str) {

    var hqs = [],
        expr,

        parts = splitByPairs(str, hqs)

    if (parts.length > 2 || parts[0]) {

      var list = [],
          i,
          j

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr =

              i & 1 ?

              parseExpr(expr, 1, hqs) :

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

      expr = parseExpr(parts[1], 0, hqs)

    }

    expr = expr.replace(RE_QSMARKER, function (_, pos) {
            return hqs[pos | 0]
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
          })

    return new Function('D', 'return ' + expr + ';')

  }

  var RE_QBLOCKS = newRegExp(
      RE_QSTRINGS.source + '|' +
      RE_COMMENTS.source + '|' +
      RE_REGEXPS.source,
      'g'
    )

  function splitByPairs(str, hqs) {

    var eb = brackets(4),
        re = brackets(5),
        parts = [],
        start,
        match,
        pos,
        isexpr,

        qposLt = -1,
        qmatch

    re.lastIndex = start = isexpr = 0

    while ((match = re.exec(str))) {

      pos = match.index

      if (isexpr) {

        if (haveQBlock(re, pos))
          continue

        if (match[2]) {

          re.lastIndex = skipBracketedPart(str, match[2], !!match[1] + pos, haveQBlock)
          continue
        }
      }

      if (match[isexpr +3] && !match[1]) {

        unescapeStr(parts, str.slice(start, pos))

        start = re.lastIndex
        isexpr ^= 1
      }
    }

    if (start < str.length)
      unescapeStr(parts, str.slice(start))

    return parts

    function unescapeStr(arr, str) {

      arr.push(str && str.replace(eb, '$1'))

    }

    function haveQBlock(re, pos) {

      var qblock,
          qposRt,
          marker

      while (qposLt <= pos) {

        if (qposLt < start) qposRt = start

        else {

          qposRt = RE_QBLOCKS.lastIndex

          if ((qblock = qmatch[0]).length > 2) {

            marker = qmatch[1] ?
              '@' + hqs.length + ICH_QSTRING :
              ' '

            unescapeStr(hqs, qblock)

            str = str.slice(0, qposLt) + marker + str.slice(qposRt)

            re.lastIndex = qposRt = qposLt + marker.length

            pos = -1

          }
        }

        do {

          RE_QBLOCKS.lastIndex = qposRt++
          qmatch = RE_QBLOCKS.exec(str)

          if (qmatch) {
            qposLt = qmatch.index

            if (qmatch[2]) {
              if (!RE_PREREGS.test(str.slice(start, qposLt)))
                qposLt = 0
              qmatch[1] = '/'
            }
          }
          else qposLt = str.length

        } while (!qposLt)

      }

      return pos < 1

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

      if (kv[0]) {
        kv[1] = qstr[kv[0] | 0]
          .slice(1, -1)
          .replace(/[ \r\n\t]+/g, ' ').trim()
      }

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
        '|-?[_A-Za-z\xA0-\xFF][-\\w\xA0-\xFF]*' +

        '):'
      ),

      CSPART_END = /([\[{\(])|,|$/g

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

    if (n && str)
        throw new SyntaxError('Cannot parse ... ' + str + '}')

    return n

  }

  var JS_BRACKETS = {
        '{': /\{|\}/g,
        '[': /\[|\]/g,
        '(': /\(|\)/g
      }

  function skipBracketedPart(str, opench, chpos, sqcb) {

    var recch = JS_BRACKETS[opench],
        match,
        level = 1

    recch.lastIndex = chpos + 1

    while (level && (match = recch.exec(str))) {

      if (sqcb && sqcb(recch, match.index))
        return chpos

      match[0] === opench ? ++level : --level
    }

    return match ? recch.lastIndex : str.length

  }

  var

      VAR_CONTEXT = '"in D?D:' + (typeof window === T_OBJECT ? 'window' : 'global') + ').',
      WRAP_RETVAL = [
          'v',
          'v||v===0?v:""'
        ],

      SRE_VARNAME = '[$_A-Za-z\xA0-\xFF][$\\w\xA0-\xFF]*',

      JS_VARSTART = newRegExp(
          '(?:^ ?|' +
          '(?![$\\w\xA0-\xFF\\.])(.))' +
          '(?!(?:typeof|in|instanceof|void|true|new|function)\\b)' +

          '(' + SRE_VARNAME + ')'
        ),

      JS_OBJKEYS = newRegExp(
          '(?=[,{]'   +
          SRE_VARNAME +
          '?:)(.)',
          'g'
        ),

      JS_FALSY = {
        'this': 0,
        'global': 0,
        'window': 0,
        'undefined': 1,
        'false': 1,
        'null': 1,
        'NaN': 1
      }

  function wrapExpr(expr, astxt) {

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
          ss.push(astxt ? '""' : mvar)

        else {
          ss.push(mvar in JS_FALSY ? mvar : ('("' + mvar + VAR_CONTEXT + mvar))

          wrap = wrap || astxt || /^[\[\(\.]/.test(expr)
        }

      } while ((match = expr.match(JS_VARSTART)))

      expr = (ss.join('') + expr).trim()

      if (wrap)
        expr = '(function(v){try{v=' + expr +
                '}finally{return ' + WRAP_RETVAL[astxt] + '}}).call(D)'

    }

    return okeys ? expr.replace(/\uFFF30/g, '') : expr

  }

  function newRegExp(restr, opts) {

    return new RegExp(restr, opts)

  }

  return _tmpl

})()

