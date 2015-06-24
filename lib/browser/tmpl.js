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

//----------------------------------------------------------------------------------------
//if (isUndef(DEBUG)) DEBUG = false

/*
TODO: In the long term, our apps is living 90% on runtime. tmpl() is all about RT.
      riot pseudo-compiler already generates html at build-time from .tag files?
      I don't know, I don't like tag files.
      With Google changes in idx engines, SEO has become less important, and there are
        minor gains sending html by http, even more, it is bad for web apps.
      But what about run tmpl() at build-time and generate js files?
      babeljs generates funcs for ES6 tagged template strings at build-time, and tts
        is not much different from riot tags.
      There are template libs (for mustache fmt) which generate js code at build-time,
        which in turn constructs DOM objects directly, no need of mustache RT, and no
        need for browser parsing big innerHTML, so DOM construction is really _fast_.
      I guess exists vdom fw doing this, too.
      With minor changes, tmpl() can returns an IIFE as string. We can save this string
      to a js file, and load this 'modules' at RT as we do with anything else.

      Please myself, comment the code with pseudo-output of results for clarify data
      utilization and life cycle.
*/
//----------------------------------------------------------------------------------------

// brackets() function
// -------------------

// Low level function for track changes to brackets.
// Parameter can be one of:
//
//  RegExp - If current brackets is the default, returns the original RegExp unmodified,
//           else returns a new exx with the default brackets replaced by custom ones.
//           WARNING: new RegExp discards /i and /m flags.
//  number - Returns the current left (0) or right (1) brackets sequence, or (NEW) the
//           same left (3) or right (4) _escaped_ sequence, as string.
//
// GOTCHA: Be carefull with custom brackets. In the current implementation, brackets parsed
//    with something like `brackets(/[{}]/)` is dangerous. Each part can have 2+ chars and
//    this RE match any chars in these, in any order. Even with `|` is unsecure.
//    e.g.
//    for `riot.settings.brackets = '[_ _]'`
//        `re = riot.util.brackets(/^[{ ]+|[ }]+$/)` assign `/^[\[\_ ]+|[ \_\]]+$/` to re
//     so `'[_ [].slice.call(foo) + a[5] _]'.replace(re, '')`
// returns `'].slice.call(foo) +  a[5'`
//    You need escape this expressions.
//    e.g.
//    '[_ \[].slice.call(foo) + a[5\] _]'`
//
// BTW: `[].slice()` & ASI aren't good friends, please use an alias, that help here too.
//      e.g. `arraySlice = [].slice` // or = `Array.prototype.slice`
//           `'[_ arraySilce.call(foo) + a[5\] _]'` ...
//
// TODO: confirm/test above gotcha partial solution

// IIFE for brackets()
var brackets = (function (defaults) {

  // cache on closure, initialized on first use and on brackets changes
  var cachedBrackets,   // current full raw brackets string, used for cache
      pairs             // [0,1] raw left-right brackets pair
                        // [2,3] escaped pair, for safe construction of custom RegExps

  // Exposed brackets() function, with name for easy debugging and error ubication

  return function _brackets(reOrIdx) {

    // make sure we use the current setting
    var s = riot.settings.brackets || defaults

    // recreate cached vars if needed, RegExp ctor throws here if syntax error
    if (cachedBrackets !== s) {
      cachedBrackets = s
      pairs = s.split(' ')
              .concat(new RegExp(s.replace(/(?=[^ ])/g, '\\')).source.split(' '))

      //$ASSERT(pairs.length === 4 && pairs[0] && pairs[1],
      //  'invalid brackets `' + s + '` : sequence is [' + pairs + ']')
      //$ASSERT(pairs[0] === pairs[1],
      //  'Can\'t set identical left and right brackets')
    }

    if (reOrIdx instanceof RegExp) {

      // if RegExp, rewrite it with current brackets (only if differ from default)
      return s === defaults ? reOrIdx :
        new RegExp(
          reOrIdx.source.replace(/[{}]/g, function (b) { return pairs[(b === '}') + 2] }),
          reOrIdx.global ? 'g' : ''
        )
    }

    // else assume it is an index to the desired brackets part
    //$ASSERT(typeof reOrIdx === 'number' && reOrIdx in pairs, 'Wrong reOrIdx: ' + reOrIdx)

    return pairs[reOrIdx]
  }
  // end of _brackets() [entry point]

})('{ }')
// end of IIFE for brackets


// tmpl() function
// ---------------

// IIFE for tmpl()
var tmpl = (function () {

  var cache = {},

      // RegExp used in wrap() - Generates 3 matches in each iteration
      //
      // minor corrections to already excelent reVars RegExp:
      //
      // Renamed to emphasize their usage and const value.
      //  2. FIX: `\.\w*` to `\.[$\w]+`
      //       -- previous re match '.' too, current require identifier
      //       -- `$` is a valid, common char in key/var names
      //  3. FIX: changed `\w*:` to `\w+\s*:`
      //       -- match only if unquoted name present
      //       -- accept ws between key and colon
      //  4. ENH: ` ` to `\s` -- in concordance with specs, any ws is a valid separator
      //  5. ENH: `[a-z_$]\w*` to `[$a-zA-Z_][$\w]*`
      //       -- `$$` is a valid identifier
      //       -- add A-Z for fix 'i'
      //     FIX: Strip `i` flag after change in 5. js keywords are *case-sensitive*
      //          E.g. `New` is a vname, not a js keyword
      //    NOTE: I never set $ as last char, except for mark EOS
      //
      // GOTCHA: In js/ES5+, var names is not limited to `\w$`, here it is 'cause `\b`
      //         equals to `^\w` (`[^0-9a-zA-Z_]`) only.
      //    e.g. `sirlóin` is a valid vname, but FIND_VNAME see this as the `in` keyword
      //         with `\b(..|in|..)` in 4.
      //         Anyway, I never use non-ASCII in vnames ...do you?
      //
      // TODO: void & delete operators? ..mmm. I think is better pass through *all*
      //       js keywords in the search as vnames, and block it on the callback ..later
      //
      // prev regexp:
      // /(['"\/]).*?[^\\]\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function *\()|([a-z_$]\w*)/gi
      FIND_VNAME =
         /(['"\/]).*?[^\\]\1|\.[$\w]+|\w+\s*:|\b(?:(?:new|typeof|in|instanceof)\s|(?:this|true|false|null|undefined)\b|function\s*\()|([$a-zA-Z_][$\w]*)/g,
        // 1                |2       |3      |4                                                                                      |5                |
        // find variable names:
        // 1. skip quoted strings and regexps: "a b", 'a b', 'a \'b\'', /a b/
        // 2. skip object properties: .name
        // 3. skip object literals: name:       // NEW: accept whitespaces between keyname and colon
        // 4. skip javascript keywords
        // 5. match var name

      // RegExp for parseExpr() - match brackets, eols, and comments
      // NOTE: changes
      // Less need to escape inner brackets: this new regexp match only the most left-right
      // sequence of brackets, and 'cause `\s*` is not included, it is _fast_, but it is
      // restrictive in the input, its need to be applied to an already trimmed expression,
      // with the brackets pair on place. e.g. `{ foo }`
      // Win EOL normalization: see comments of create() function.
      // Comments are treated as spaces, in concordance with spec. `/**/` is catched now.
      // The result may need to be normalized.
      //
      // TODO: Include `{/**/typeof {}}` in tests
      //
      NORMALIZE_EXPR =
         /^{|\r?\n|\/\*.*?\*\/|}$/g
        // 1|2    |3          |4
        // 1. match the initial (_the one most_) left brackets sequence.
        // 2. match Win and Unix EOLs ...sorry Mac.
        // 3. match comments, even empty ones (/**/)
        // 4. Same as 1, but for the final, right most brackets sequence.
        //
        // GOTCHA: Without real analyzer, there's no way to include the `/*` sequence in
        //         literal strings --the `*/` can be included as `*\/`


  // Exposed tmpl() function.
  // Build a template (or get it from cache), render with data

  // Sutile differences in empty/blank string/expressions here:
  //   falsy values, included '', and blank strings (e.g. ' \n') retuns as is.
  //   empty expressions '{ }' returns undefined (i.e. '{}' is ignored).
  //   '{ } ' returns ' ' ...remember: '{ }' is ignored.
  //
  // In this version, `\r\n` in template text out of expressions is normalized to `\n`
  // See comments about EOL in the create() function.
  // Actually, all new lines and double quotes on template text are escaped before
  // evaluation as js literals, but this does not affect the output.

  return function _tmpl(str, data) {

    // (xvar = xvar || default):
    //   1) test xvar, if result is falsy, assign default to xvar
    //   2) else assign xvar to xvar
    // (xvar || (xvar = default)):
    //   Same as 1, skip 2
    // Changed.

    return str && (cache[str] || (cache[str] = create(str)))(data)
    //     1      |2             |3                         |4
    // 1. if str is falsy, return it as is.
    // 2. search already processed template function in cache (str is its own hash key)
    // 3. if template fn not in cache, create the fn and save it to cache
    // 4. evaluate the template fn with the received data and returns result

    // mini-lesson for myself, or "c'mon genius, back to basics"
    // falsy (boolean) logic & implicit return value of expr...
    //    (false && true)                   => false
    //    return null && any_value          => null
    //    return '' && any_value            => ''
    //    str=''; return str && any_value   => '' ...eq to:
    //    return str='', str && any_value   => '' (esoteric & silly uglify-style usage
    //                                             of comma operator's return value)
    // verbose equivalent:
    /*`
      if (!rawTemplateStr) {
        return rawTemplateStr   // any falsy, including '' of course
      }
      else
      {
        var fn = fn[str]
        if (!fn) fn[str] = fn = createGetterForTemplateReturnValue(str)
        return fn(data)
      }
    `*/
    // wow! pretty silly myself-style mini-lesson ;)
  }
  // end of _tmpl() [entry point]


  // Private function: create a template instance

  // NOTE: Main change.
  // Old code escaped '\n' and '"' of **TT** (Template Text, out of {}) and nothing more.
  // However, some days ago I have troubles running the riot test on tag files.
  // The culprits was Win EOL (\r\n) and git's autocrlf convertion.
  // This code add simple normalization to Win EOL: the '\r' is stripped out of the TT,
  // and, for consistency? of the expressions, too.
  //
  // Q: Is Win EOL normalization / inner comments as space a breaking change here?
  // A: I think it is not. Riot is already converting '\n' on expression to spaces,
  //    and TT is mainly HTML, which is happy without '\r's.
  //   (I think, _in HTML_ parts, browsers don't care about EOL types at all).

  function create(str) {

    var b0 = brackets(0),
        b1 = brackets(1),
        eL = brackets(2),     // undocumented: left brackets (escaped)
        parts,
        returnExpr

    // Q: So, empty templates ('') default to '{}', which in turn generates "", ok?
    // A: Wrong! empty never get here. This function is only called for _tmpl, and
    //    _tmpl returns falsy values before calling create().
    //    ...the ` || (b0 + b1)` part in next assignment to str never runs.
    // Q: What goes on if str is all ws?
    // A: This is one unique TT element, w/o expressions (i.e. parts.length == 1)

    //$IF(!str, 'falsy str in _tmpl.create!!!')

    // Using /[^\\]{/ for preservation of escaped brackets is too complicated, so
    // temporarily convert *current* escaped brackets to a non-character
    //str = (str || (b0 + b1))
    str = str.replace(brackets(/\\{|\\}/g), function (c) {  // single call here
            return c === eL ? '\uFFF0' : '\uFFF1'           //  ~50% faster
          })
    // GOTCHA: Point against custom brackets: If you change the brackets, perhaps
    //         for compatibility, your code will be not fully riot-compatible.
    //         i.e. Whenever you change brackets, you must update your templates

    // Split string to TT / Expresion parts, extract2 avoid 2 regexps constructions
    parts = splitByPairs(str, extract2(str, brackets(/({)|(})/g)))

    // To myself:
    // now, we have in parts[] a collection of non-null strings like this.
    // [0] : template text
    // [1] : {expression}
    // [2] : template text
    // [3] : {expression}
    // ...
    // [n] : template text (last element)
    // where pairs elements (template strings) can be empty or contain any char, except
    // unescaped brackets. e.g. `{x}{x} ` generates `['', '{x}', '', '{x}', ' ']`
    // In contrast, odd elements (expressions) can never be blank, at least, they contain
    // their brackets pair, w/ no text outside these brackets (trimmed). These, in turn,
    // may NOT contain other expressions, e.g. `{{}{}}` generates `{}{}`: syntax error.
    // NOTE: new splitByPairs() leaves out last element if empty

    // Create the expression for the value to be returned by the template fn.
    //
    // This is an array of strings and expressions like this:
    // `[ "<b>",
    //    (function(v){try{v=d.prop}catch(e)finally{return v}}).call(d),
    //    "</b>"
    //  ].join("")`
    //
    returnExpr = (

      // is it a single expression or a template? i.e. `{x}` or `<b>{x}</b>`, or ' '
      parts.length < 4 && !parts[0] && !parts[2] ?

        //--- Single expression, generate code with no defaults on falsy, else...
        parseExpr(parts[1]) :

        //--- Alternating Template Text / Expression elements
        '[' +

          parts.map(function (s, i) {       // ok, map() & join() skips undefineds

            // Expression or text? (every second part is an expression)
            return i % 2 ?

              // Expression: generate safe code, default '' for falsy values !== 0
              parseExpr(s, true) :

              // Template text: prepare to embed as js literal string.
              '"' + s
                .replace(/\r?\n/g, '\\n')   // normalize and preserve new lines
                .replace(/"/g, '\\"') +     // escape double quotes
              '"'

          }).join(',') +

        '].join("")'

    ) .replace(/\uFFF0/g, b0)       // bring escaped `{` and `}` back,
      .replace(/\uFFF1/g, b1)       //  this time unescaped.

    return new Function('d', 'return ' + returnExpr + ';')  // return the getter fn
                                                            // we are done.
  }
  // end of create()


  // Private function: parse { ... } expression

  function parseExpr(expr, nonull) {

    // TODO: The original code deleted all comments, this code turns _inner_ comments
    //       into spaces.
    //       js spec is clear: comments != '', check it with `void/**/0 === void 0`
    //    Q: is riot away from the specs here?
    //
    // TODO: The original code trims **all** surrounding brackets chars w/o any test
    //       with brackets(/^[{ ]+|[ }]+$/) ...why?
    //       Ok, we haven't nested expressions, but it forces to escape all surrounding
    //       inner brackets, complicating user code w/o reason.
    // DONE: NORMALIZE_EXPR fix last, and temp change on comments interpretation.
    //       ASSERT new restrictions.
    //
    // MORE: Again, what about inner Mac CRs? leave out Unicode names?

    // expr must comes here trimed, with brackets in place.
    //$ASSERT(expr[0] === brackets(0) && expr[1] === brackets(1),
    //  'parseExpr: missing brackets in expr: ' + parseExpr.replace(/[\r\n\t]/, ' '))

    // Normalize Win EOLs, convert \n and comments to spaces, trim brackets and blanks
    // no need set NORMALIZE_EXPR.lastIndex with replace()

    expr = expr.replace(brackets(NORMALIZE_EXPR), ' ').trim() // need trim() here

    // is it an object literal? i.e. `{ key : value }`
    //
    // WARNING: Very restrictive and anyway fragile regexps here.
    //
    //       Quoted keys limited to [\w- ] on search but free later, on replace??
    //       Too many chances for fail on tabs, unbalanced quotes, and so on...
    //       We can get more flexible and faster detection here for free.
    //       I guess the caller does good detection but, anyway... one unique
    //       search/test +replace +wrap operation w/2 regexp seems obvious, instead the
    //       current test +extract +map +replace +replace +wrap w/ 5 (different) regexp,
    //       although the call to wrap in the inner v.replace is great!
    //
    // TODO: I know, breaking changes, new logic needs test ...later
    //
    return /^\s*[\w- "']+ *:/.test(expr) ?  // true for `":`, `x-":`, `'x:'`, etc
                                            // false for `$:`, `"p#v":` ...etc

      // if object literal, return trueish keys
      // e.g.: `{ show: isOpen(), done: item.done } -> "show done"`
      '[' +
        // extract key:val pairs, ignoring any nested objects
        extract(expr,

          /["' ]*[\w- ]+["' ]*:/,           // name part: name:, "name":, 'name':, name :
          /,(?=["' ]*[\w- ]+["' ]*:)|}|$/   // expression part: everything upto a comma
                                            // followed by a name (see above) or end of line
        ).map(function (pair) {

          // get key, val parts
          return pair.replace(/^[ "']*(.+?)[ "']*: *(.+?),? *$/, function (_, k, v) {
            // wrap all conditional parts to ignore errors
            return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k + '":"",'
          })

        }).join('') +

      '].join(" ").trim()' :

      // else if js expression, evaluate as javascript
      wrap(expr, nonull)

  }
  // end of parseExpr()


  // Private function: generates js code to get a value from an expression, wrapped in
  //   try..catch blocks to avoid breaking on errors or undefined vars. This code will
  //   be inserted in an array, returned by parseExpr()

  // e.g.
  //  (function (v) {
  //     try { v = d.value === undefined ? window.value : d.value }
  //     catch(e) {}
  //     finally { return v || v === 0 ? v : "" }
  //   }).call(d)
  //
  // The original code generated `x` for (jstoken+vname)==='' *AND* s===(jstoken|vname).
  // With the `!s` test above, I think it is *not possible*. Anyway, expected result was:
  // e.g.
  //   (function (v) {
  //      try { v=x }          //<--- if s.replace(...) === ''
  //      catch(e) {}
  //      finally { return (!v && v!==0) ? "" : v }
  //    }
  //   ).call(d)
  // Leaving blank generates `try{v=}` (syntax error), so why not use it?
  // BTW: Can exist `x` in the default context?
  //
  // WARNING: although try..catch blocks are needed to prevent the program from chashing,
  // could mask more serious problems. So I think this is something that should be left
  // to user's implementation.
  //
  // LAST: We have try + catch-all blocks with simple assignation and no external calls
  //       --except perhaps some set/getter, maybe we don't need wrap with finally{}
  //
  // TODO: Thinking about uglify..., there's a whole section in the docs concerning the
  //       name of the properties, and recommend consistent use of o['prop'] vs o.prop
  //       notations, to avoid bugs due to mangle.
  //       We need to be flexible and give an option to users here? check later

  function wrap(expr, nonull) {

    if (!(expr = expr.trim())) return ''    // we have lightweight string for trim()

    return '(function(v){try{v=' +

      // prefix vars (name => data.name)
      expr.replace(FIND_VNAME, function (unchanged, _, vname) {

        if (!vname) return unchanged

        // defaults to global scope if (!vname in d), no default context here
        return '(d.' + vname + '===undefined?' +
          (isUndef(window) ? 'global.' : 'window.') + vname + ':d.' + vname +')'

          // break the expression with 'syntax error' if resulting 'expr' is empty
      }) +

      '}catch(e){}finally{return ' + (

        // default to empty string for falsy values except zero
        nonull === true ? 'v||v===0?v:""' : 'v'   // changed, more clear ternary

      ) + '}}).call(d)'

  }
  // end of wrap()


  // Private function: split string by an array of substrings.
  //   Key function for create tmpl, secure & optimize this

  // Search one by one the next occurrence of substring in str, and save each result by
  // pairs [_left-substring, matched-substring_] in the returned array.
  // Each search starts in the next character following the previous match.
  // All substrings must exists in str; if it not, saves [_'', non-matched-substring_]
  // but the start position of next search will be wrong.
  // Last element of returned array is the remaining of str --even if empty, so it
  // always has an odd length.

  // TODO: Too heavy code. We can get here a new, very long template string. optimize.
  // DONE: lightweight for(), stopped using multiple allocations for string & arrays.

  function splitByPairs(str, substrings) {

    var parts = [],
        start = 0     // we can have a very long string here, so be nice to GC and do
                      //  not re-allocate strings, use indexOf's start parameter

    // map() is intended to generate an array, so has too many overhead.
    // forEach() does not exists in IE8, and our each() skip nulls.
    // plain for seems ok
    for (var i = 0; i < substrings.length; ++i) {
      if (i in substrings) {                      // skip undefined elements
        var substr = substrings[i],
            j = str.indexOf(substr, start)        // search from current start position
        parts.push(str.slice(start, j), substr)   // push previous and matched parts
        start = j + substr.length                 // new start to skip processed parts
      }
    }

    // push remaining part, only if we have one - don't [].concat
    if (start < str.length) parts.push(str.slice(start))

    return parts

  }
  // end of splitByPairs()


  // Private function: match strings between opening and closing regexp,
  //  skipping any inner/nested matches
  //
  //  WARNING: open/close RegExps must not contain captured sub-matches,
  //           otherwise this function will fail (see NOTE on extract2).

  function extract(str, open, close) {

    return extract2(str, new RegExp('(' + open.source + ')|(' + close.source + ')', 'g'))

  }
  // end of extract()


  // low-level extraction allows create() avoid creation of 2 new RegExp per call.
  //
  // NOTE: `re` must be in format `/(match)|(match)/g` --exactly two simultaneous
  //       and _different_ captured matches, global, w/o sub-matches.

  function extract2(str, re) {

    var start = 0,
        level = 0,
        matches = []

    // Changed to simplified logic, 1 of 2 (push / pop) selection.
    // Each iteration generates only one of 'open' or 'close' values --the other
    // remains undefined, and we can't get nulls, so test with !=null is safe.

    str.replace(re, function (_, open, close, pos) {

      // Next test for 'open' fails with null or undefined, but success with ''.
      // if test fail, assume we have a 'close'
      // NOTE: old code test first `if(!level && open)` and finish with
      //       `if(!level && cose!=null)`, wich I think is strange.
      //       Is it perhaps the correction of some old bug?

      if (open != null) {
        // open new
        if (!level) start = pos   // if open outer (level 0), mark the start
        ++level                   // increment (push) level
      }
      else {
        // close last
        --level                   // decrease (pop) level
        if (!level) matches.push(str.slice(start, pos + close.length))
                                  // if closing outer, grab the match
      }
    })

    return matches

  }
  // end of extract2

})()
// end of IIFE for tmpl
