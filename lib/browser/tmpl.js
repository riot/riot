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


//// ------------------------------------------------------------------------------------
//// brackets() function
//// ------------------------------------------------------------------------------------

// Low level function for track changes to the brackets.
// Parameter can be one of:
//
// RegExp - If the current brackets are the defaults, returns the original regexp, else
//          returns a new regexp with the default brackets replaced by the custom ones.
//          WARNING: new custom regexp discards the /i and /m flags.
// number - If number is...
//          0,1 -returns the current left (0) or right (1) brackets characters
//          2,3 -returns the current left (3) or right (4) escaped brackets characters
//          4   -returns regexp based on /\\({|})/g for match escaped brackets
//          5   -returns regexp based on /(\\?)(?=([{\[\(])|{|})(?:({)|(})|.)?/g for
//               match opening riot and js brackets

// IIFE
var brackets = (function (defaults) {

  // Cache on closure, initialized on first use and on bracket changes

  var cachedBrackets,     // full brackets string in use, for change detection
      pairs               // cache for raw and escaped brackets and regexps

  // Helper function
  // Recreate the cache for the current brackets

  function updateCache(s) {
    cachedBrackets = s

    // Save the new unescaped / escaped brackets pairs (only escape chars that require it,
    // a backslash that is not part of a replacement string token is a literal backslash)

    pairs = s.split(' ')
            .concat(s.replace(/(?=[$\.\?\+\*\[\(\)\|^\\])/g, '\\').split(' '))

    // [4] and [5] are RegExps used by splitByPairs()

    pairs[4] = brackets(/\\({|})/g)         // match one escaped bracket

    // [5] is for both bracket sequences. It matches opening js brackets too, to provide
    // unescaped insertion of these characters in expressions.
    // This regexp use positive lookahead to capture (in $2) js brackets.

    // Why so complicated? We can use two regexps in splitByPairs and swap them in mode
    // changes, but we must deal with lastIndex reassignments also change regexp itself.
    // In simple /(\\?{)|(\\?})|({|\(|\[)/, the first brace character eats the second.
    // pairs[5] give us matches for js _and_ riot brackets without regexp changes and,
    // contrary to what seems, is relatively efficient.

    // TODO: test in old browsers (working in latest ie, ff, and chrome)
    // base: /(\\?)(?=([{\[\(])|{|})(?:({)|(})|.)?/g
    pairs[5] = new RegExp(
        '(\\\\?)(?='       +                // $1: optional escape, start lookahead for
        '([{\\[\\(])|'     +                // $2: open js bracket, first, or
          pairs[2] + '|'   +                //     look for riot opening or
          pairs[3]         +                //     closing bracket.
        ')(?:('            +                // close lookahead, now capture the riot...
          pairs[2] + ')|(' +                // $3: opening bracket and
          pairs[3]         +                // $4: closing bracket
        ')|.)?',                            // match any js bracket (already captured)
        'g')
  }
  // end of updateCache()


  // Exposed brackets() function, with name for easy debugging and error ubication

  return function _brackets(reOrIdx) {

    var s = riot.settings.brackets || defaults    // make sure we use the current setting

    if (cachedBrackets !== s) updateCache(s)      // recreate the cache if needed

    if (reOrIdx instanceof RegExp) {              // for regexp...

      return s === defaults ?                     // if the current brackets are the
        reOrIdx :                                 // defaults, returns regexp as-is

        // Rewrite regexp with the default brackets replaced with the custom ones.
        // Let the user choose whether to double escape characters.
        new RegExp(
          reOrIdx.source.replace(/{|}/g, function (b) { return pairs[(b === '}') + 2] }),
          reOrIdx.global && 'g'
        )
    }

    // `reOrIdx` is not a regexp, assume it is an index to the desired cached element
    return pairs[reOrIdx]

  }
  // end of _brackets() [entry point]

})('{ }')
// end of IIFE for brackets


//// ------------------------------------------------------------------------------------
//// tmpl() function
//// ------------------------------------------------------------------------------------

// IIFE for tmpl()
var tmpl = (function (/*DEBUG*/) {

  ////------------------------------------------------------------------------
  //// PUBLIC ENTRY POINT
  ////------------------------------------------------------------------------

  // Exposed tmpl() function.
  // Build a template (or get it from cache), render with data

  // NOTE: Nested expressions are not supported. Yo don't need escape inner brackets
  //       in expressions, except very specific cases.

  // NOTE: There are only two contexts accesible to the returned function: `this`,
  //       asigned to the 'data' parameter received by tmpl, and the global context
  //       `global` (for node.js) or `window` (on browsers)

  var cache = {}

  function _tmpl(str, data) {

    // by using .call(data,data) there's no need to wrap `this`

    return str && (cache[str] || (cache[str] = create(str))).call(data, data)

  }
  // end of _tmpl() [entry point]


  ////-----------------------------------------------------------------------------------
  //// GETTER CREATION
  ////-----------------------------------------------------------------------------------

  var
    // Invalid Unicode code points (ICH_) used for hide some parts of the expression
    ICH_REGEXP  = '\uFFF0',
    ICH_QSTRING = '\uFFF1',

    // Match a hidden quoted string marker, $1 capture the index to the qstring in the
    // hqs array of create (it is the qstring index in the whole template string, too).
    RE_QSMARKER = /@(\d+)\uFFF1/g,

    // Matches single or double quoted strings, including empty ones and strings with
    // embedded escaped quotes and whitespace. $1 is the left quote (for back ref).
    RE_QSTRINGS = /('|")(?:\\.|[\s\S])*?\1/g,

    // Matches valid comments in (almost) all of its forms, including empty comments
    // and nested opening sequences. (old: /\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//)
    RE_COMMENTS = /\/\*(?:(?!\*\/).|\s)*?\*\//g,

    // Matches true RegExps (not in comments or quoted strings)
    RE_REGEXPS = newRegExp(
      RE_COMMENTS.source + '|' +      // skips comments
      RE_QSTRINGS.source + '|' +      // $1: left quote. skips strings
      '(/(?:\\\\?.|\\s)+?/)',         // $2: regexp (prefix with `//|` to omit '//')
      'g')


  // Private function
  // Creates a function instance for get a value from the received template string.

  function create(str) {

    // You can drop debugging blocks in your minimized version by using uglify
    // conditional compilation options: `-c -d DEBUG=false`

    //if (DEBUG) { if (console && console.info) console.info(' in: \'' +
    //str.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '\'') }

    // Empty strings never get here. This function is only called from _tmpl,
    // and _tmpl returns falsy values before calling here.

    var rex = [],                     // holds the hidden, literal regexps
        hqs = [],                     // saved (non empty) literal strings
        i,

        // Hiding regexps here avoids complications through all the code, and does not
        // affect the logic, but be carefull and don't touch comments or qstrings yet.

        expr = str.replace(RE_REGEXPS, function (s, _, r) {

          if (!r) return s            // if is a comment or string, preserve
          rex.push(escapeStr(r))      // if is a regexp, save it
          return ICH_REGEXP           // replace it with a invalid char
        }),

        // sliptByParts will...
        // - Split the received string into its ttext / expressions parts
        // - Save and hide non empty quoted strings in expressions
        // - Convert comments _in expressions_ to spaces
        // - Unescape escaped brackets

        parts = splitByPairs(expr, hqs)

    // Generates the js expression to return a value within the returned function.
    // Single expressions return raw values, template/shorthands returns strings.

    if (parts.length > 2 || parts[0]) {

      var list = [],
          j

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr =

              i & 1 ?                           // every odd element is an expression

              parseExpr(expr, 1, hqs) :         // mode 1 convert falsy values to "",
                                                // except zero

              '"' + expr                        // ttext: convert to js literal string
                .replace(/\r?\n|\r/g, '\\n')    // normalize and preserve EOLs
                .replace(/"/g, '\\"') +         // escape inner double quotes
              '"'                               // enclose double quotes

          )) list[j++] = expr

      }

      expr = j > 1 ?                            // optimize code for 0-1 parts
             '[' + list.join(',') + '].join("")' :
             j ? '""+' + list[0] : '""'

    }
    else {

      expr = parseExpr(parts[1], 0, hqs)        // single expressions as raw value

    }

    // Restore hidden literals. First, quoted strings; last, regexps

    expr = expr.replace(RE_QSMARKER, function (_, pos) {
            return escapeStr(hqs[pos | 0])    // get the original string by index
          })

    for (i = 0; i < rex.length; ++i) {
      expr = expr.replace(ICH_REGEXP, rex[i])
    }

    //if (DEBUG) { if (console && console.info) console.info('OUT: ' +
    //expr.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')) }

    // Now, we can create the function to return by calling the Function constructor.
    // It'll throw an exception if the generated code has errors (i.e. SyntaxError)
    // The parameter `D` is received by _tmpl, which uses it to evaluate the function.

    return new Function('D', 'return ' + expr + ';')

    // Escape the '\n' and '\r' chars, since these breaks the Function ctor

    function escapeStr(s) {
      return s.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
    }

  }
  // end of create()


  ////-----------------------------------------------------------------------------------
  //// PARSERS
  ////-----------------------------------------------------------------------------------

  // Private function
  // Splits the received string in its template text and expression parts.

  // Search one by one the next expression in str, and save each result by pairs as
  // `[ttext], [expression]` in the returned array.
  // So, if str have one unique expression, the result is `['', expression]`, for
  // text without expressions, the result is `[ttext]`

  // Matches quoted strings or comments (qblocks)
  var RE_QBLOCKS = newRegExp(
      RE_QSTRINGS.source + '|' +
      RE_COMMENTS.source,
      'g'
    )

  function splitByPairs(str, hqs) {

    //$IF(!str, 'falsy str in _tmpl.create!!!')

    /*
      About inner unescaped (and unbalanced) brackets detection

      Template text is easy: closing brackets are ignored, all we have to do is find
      the first unescaped bracket. The real work is in the expressions...

      Expressions are not so easy. We can already ignore opening brackets, but finding
      the correct closing bracket is tricky.
      Think about literal strings and regexps, they can contain almost any combination
      of characters. We can't deal with these complexity with our regexps, so let's
      hide and ignore these*. From there, all we need is to detect the bracketed parts
      and skip them, as they contains most of common chars used by riot brackets.
      With that, we have a 90% reliability in the detections, although (hope few) some
      custom brackets still requires to be escaped (e.g. `<< x \\>> 1 >>`) :(

      * The template comes with regexps hidden, and haveQBlock hides qstrings here.
    */

    var eb = brackets(4),           // regexp, matches current escaped riot brackets
        re = brackets(5),           // regexp, for (riot or js) brackets detection
        parts = [],                 // holds the resulting parts
        start,                      // start position of current template or expression
        match,                      // reused by both outer and nested searches
        pos,                        // current position (exec() result)
        isexpr,                     // we are in ttext (0) or expression (1)
                                    // --- q* vars used by haveQBlock:
        qposLt = -1,                // start position of the current qblock
        qmatch                      // resulting match in the closure

    re.lastIndex = start = isexpr = 0

    while ((match = re.exec(str))) {

      pos = match.index

      // $1: optional escape character
      // $2: opening js bracket `{[(`
      // $3: opening riot bracket
      // $4: closing riot bracket

      if (isexpr) {

        // We are in expression.
        // Brackets inside qblocks and js braces by pairs, are ignored.
        // This works even if the opening bracket of riot is the same as a js bracket,
        // because we already skipped the first (that switched to expression mode).

        if (haveQBlock(re, pos))                // skip any char within quotes
          continue

        if (match[2]) {                         // js opening bracket?

          // Skip bracketed block. Send str, bracket, pos (shifted by escapeChar.length),
          // and haveQBlock as callback, and expect a new position as return value.

          re.lastIndex = skipBracketedPart(str, match[2], !!match[1] + pos, haveQBlock)
          continue
        }
      }

      // At this point, we expect only a _unescaped_ bracket in $2 for text mode,
      // or in $3 for expression. If so, save the part and switch the mode.

      if (match[isexpr +3] && !match[1]) {      // is the expected, unescaped bracket?
                                                // push part, even if empty
        unescapeStr(parts, str.slice(start, pos))

        start = re.lastIndex                    // next position is the new start
        isexpr ^= 1                             // switch mode
      }
    }

    if (start < str.length)                     // push remaining part, if we have one
      unescapeStr(parts, str.slice(start))

    return parts                                // and we are done!


    //// ----------------------
    //// Inner Helper Functions

    // Unescape escaped brackets and store the qstring in the given array.
    // eb is /\\?({|})/g, so $1 excludes the escape character

    function unescapeStr(arr, str) {

      arr.push(str && str.replace(eb, '$1'))

    }
    // end of unescapeStr()


    // Converts comments in spaces, saves and hides quoted strings, updates the outer
    // (re.)lastIndex, and returns true if the `pos` position is inside a comment or
    // quoted string.

    function haveQBlock(re, pos) {

      var qblock,                 // holds the original comment or qstring
          qposRt,
          marker

      // Keep current qblock at right side of pos (current position on the outer loop)

      while (qposLt <= pos) {     // exit if pos == -1 (pos inside the current qblock)

        // If the start of qblock (qposLt) is at left of the beginning of the expression,
        // this has changed, and we need reset the RE_QBLOCKS offset and start a new
        // search after saving any qstring that is in qmatch, since we are sure now this
        // previous qstring belongs to an expression.

        if (qposLt < start) qposRt = start            // reset offset on expression change

        else {

          // qblock is in the current expression, so qmatch is still valid and not null.
          // Test len>2 because empty qstrings min length is 2, and for comments is 4.
          // It's safe to bypass empty strings ...they cann't contain dangerous chars :)

          qposRt = RE_QBLOCKS.lastIndex               // track pointer for next search

          if ((qblock = qmatch[0]).length > 2) {      // comment or non-empty qblock?

            // Replace comment with space or qstring with a marker that includes its
            // original position as an index into the array of replaced qstrings.
            // (qmatch[1] has a quote if it is a qstring)

            marker = qmatch[1] ?                      // quote found? it's a qstring,
              '@' + hqs.length + ICH_QSTRING :        // create marker for qstring
              ' '                                     // else replace comment w/space

            unescapeStr(hqs, qblock)                  // unescape brackets here, too
                                                      // @(backward compatible)
                                                      // replace qblock
            str = str.slice(0, qposLt) + marker + str.slice(qposRt)
                                                      // skip qblock
            re.lastIndex = qposRt = qposLt + marker.length

            pos = -1                                  // signal to reset outer search
                                                      // since str was modified
          }
        }

        // Any qblock found remains unhidden until we're sure it belongs to an expression.
        // If no qblock is found, set qposLt to the end of string (beyond `pos` value)

        RE_QBLOCKS.lastIndex = qposRt                 // begin searching at own offset

        qposLt = (qmatch = RE_QBLOCKS.exec(str)) ?
          qmatch.index :                              // this is the start of qblock
          str.length                                  // avoid entering here again

      } // end while qposLt <= pos

      return pos < 1    // true if str has changed

    }
    // end of haveQBlock()

  }
  // end of splitByPairs()


  // Private function
  // Parse `{ expression }` or `{ name: expression, ... }`

  // For simplicity, and due to RegExp limitations, riot supports a limited subset (closer
  // to CSS1 that CSS2) of the full w3c/html specs for non-quoted identifiers of shorthand
  // names. This simplified regexp is used for the recognition:
  //
  //      `/-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*/`
  //
  // The regexp accept all ISO-8859-1 characters that are valid within an html identifier.
  // The names must begin with one underscore (\x5F), one alphabetic ascii (A-Z, a-z),
  // or one ISO-8859-1 character in the range 160 to 255, optionally prefixed with one
  // dash (\x2D).
  //
  // NOTE: Although you can use Unicode code points beyond \u00FF by quoting the names
  //       (not recommended), only use whitespace as separators since, within names,
  //       riot converts these into spaces.
  //
  // See: http://www.w3.org/TR/CSS21/grammar.html#scanner
  //      http://www.w3.org/TR/CSS21/syndata.html#tokenization

  function parseExpr(expr, mode, qstr) {

    // Convert inner whitespace to compact spaces and trims the space surrounding the
    // expression and various tokens, mainly brackets and separators.
    // We need convert embedded '\r' and '\n' as these chars breaks js code evaluation.
    // replacement is secure, expr already lacks strings, regexp, and comments.

    // WARNING:
    //      Trim and compact is not strictly necessary, but it allows optimized regexps.
    //      e.g. we can use /:/ instead /\s*:\s*/
    //      Many regexps in tmpl code depend on this, so do not touch the next line
    //      until you know how, and which, regexps are affected.

    expr = expr
          .replace(/\s+/g, ' ')
          .replace(/^ | ?([\(\[{},\?\.:]) ?| $/g, '$1')

    if (!expr) return ''

    // Expression only:   mode == 0 -- nonull == false
    // Text + expression: mode == 1 -- nonull == true

    // Detect class shorthands, csinfo is filled with [qstring-idx, name, expr] els
    var csinfo = [],
        cslist

    if (!extractCSList(expr, csinfo)) {

      // `expr` does not begin with "name:", let's assume js expression.
      // Here, the "mode" parameter itself is significant

      return wrapExpr(expr, mode)
    }

    // We have a class shorthand list, something that looks like a literal js object, in
    // the format '{ name: expr, ... }', but with HTML/CSS identifiers as names, and its
    // surrounding brackets already removed by the caller.
    // At runtime, the code generated here returns a space-delimited list of the names
    // for those expressions with trueish values.
    // E.g.: `{ show: isOpen(), done: item.done }` --> "show done"

    cslist = csinfo.map(function (kv) {

      // Be carefull, the `name` element can be a hidden quoted string marker. We must
      // check this for replacing the marker with the original string here, 'cause the
      // processing of whitespace and quote chars on names (HTML identifiers) differs
      // to that of the other strings on the expressions (js code).
      // Once replaced, the marker will not be available anymore. This is desired, as
      // well as the restoration of the strings does not overwrite these names.

      if (kv[0]) {                              // is name a quoted string marker?
        kv[1] = qstr[kv[0] | 0]                 // retrieve string by index
          .slice(1, -1)                         //  and unquote
          .replace(/[ \r\n\t]+/g, ' ').trim()   // compact whitespace between names
      }

      return '(' +                              // wrap all parts to ignore errors.
          wrapExpr(kv[2], 0) +                  // use raw mode
          ')?"'  + kv[1]  + '":""'              // all error/falsy values returns ""

    })

    return cslist.length < 2 ?                  // optimize 'one element' cases
       cslist[0] :
      '[' + cslist.join(',') + '].join(" ").trim()'

  }
  // end of parseExpr()


  // Private function - Helper for parseExpr()
  // If `str` is a shorthand list, return an array with its parts, or falsy if is not.
  // This function cares about nested commas.

  var
      // Matches the `name:` part of a class shorthand
      CSNAME_PART = newRegExp(
        '^(' +                            // always at 0, we are searching rightContext
        RE_QSMARKER.source +              // $1: qstring marker + $2: str index, or...
        '|-?[_A-Za-z\xA0-\xFF][-\\w\xA0-\xFF]*' +
                                          // $1: literal w3c indentifier (almost)
        '):'                              // skip colon, expression follows
      ),

      // Matches open js brackets, comma outside brackets, or the end of str
      CSPART_END = /([\[{\(])|,|$/g       // $1: js bracket

  function extractCSList(str, list) {

    var match,                    // CSNAME_PART results
        end,                      // CSPART_END results
        gre,                      // global RegExp object
        ch,                       // js bracket, or empty for comma or end of str
        n = 0                     // count of extracted shorthands

    // Try to match the first name testing `match !== null && match.index === 0`

    while (str &&                               // search in the ramaining substring
          (match = str.match(CSNAME_PART)) &&   // null match or
          !match.index                          // start > 0 means error
      ) {

      gre = RegExp
      str = gre.rightContext                    // skip the `name:` part
      CSPART_END.lastIndex = 0                  // reset lastIndex for exec

      // Search the next comma, outside brackets, or the end of str.
      // If js bracket is found ($1), skip the bracketed part.

      while ((end = CSPART_END.exec(str)) && (ch = end[1])) {

        CSPART_END.lastIndex = skipBracketedPart(str, ch, end.index)

      }

      list[n++] = [                             // match still valid, push...
          match[2],                             // 0: hidden qstring index
          match[1],                             // 1: unquoted name
          str.slice(0, end.index)               // 2: expression
        ]

      str = gre.rightContext
    }

    // Explicit error detection for easy debugging.
    // If str (rightContext) is not empty, we have a comma after the previous pair,
    // so this must begin with a name. if not, we have a syntax error.
    // This is consistent with the literal objects notation (of js), if the user
    // wants a comma operator, must use parentheses.

    if (n && str)
        throw new SyntaxError('Cannot parse ... ' + str + '}')

    return n

  }
  // end of extractCSList()


  // Private function - Helper for splitByPairs & extractCSList.
  // Skips a bracketed block, ignoring any nested brackets, and returns the next
  // position following the closing bracket for the `opench` character.
  // sqcb is a callback for hide qstrings (haveQBlock) returning -1 if str has
  // changed, in which case this function returns the received original position.

  // Matches js brackets. Used by splitByPairs.skipBracketedPart and skipBrackets
  var JS_BRACKETS = {
        '{': /\{|\}/g,  // eslint-disable-line no-dupe-keys
        '[': /\[|\]/g,
        '(': /\(|\)/g
      }

  function skipBracketedPart(str, opench, chpos, sqcb) {

    var recch = JS_BRACKETS[opench],            // we are using recch for sqcb(), too
        match,
        level = 1                               // when level drops to 0, will have
                                                // found our right bracket.
    recch.lastIndex = chpos + 1                 // skip opench

    while (level && (match = recch.exec(str))) {

      if (sqcb && sqcb(recch, match.index))     // stop on quoted bracket, since str
        return chpos                            // has changed. return previous pos

      match[0] === opench ? ++level : --level
    }

    return match ? recch.lastIndex : str.length

  }

  ////-----------------------------------------------------------------------------------
  //// WRAPPERS
  ////-----------------------------------------------------------------------------------

  // Private function
  // Generates js code to get an expression value, wrapped in a try..finally block
  // to avoid break on errors or undefined vars.
  // The generated code will be inserted in an array, returned by parseExpr()

  var
      // Strings used by wrapExpr()
      VAR_CONTEXT = '"in D?D:' + (typeof window === T_OBJECT ? 'window' : 'global') + ').',
      WRAP_RETVAL = [
          'v',                // raw mode
          'v||v===0?v:""'     // text mode
        ],

      // String for RegExp, matches full iso-8859-1 var names
      SRE_VARNAME = '[$_A-Za-z\xA0-\xFF][$\\w\xA0-\xFF]*',

      // Matches a var name alone. Used by wrapExpr with successive string.match
      // Note:  We are using negative lookahead to exclude properties without capture, so
      //        it works fine with test() or match(). Gotcha is that we are left with a
      //        dangling character in $1. prefixVar() returns it to the str.
      // base: /(?:^ ?|(?![$\w\xA0-ÿ\.])(.))(?!(?:typeof|in|instanceof|void|true|function)\b)(?:(new[ \(])?([$_A-Za-z\xA0-ÿ][$\w\xA0-ÿ]*))/
      JS_VARSTART = newRegExp(
          '(?:^ ?|' +                       // begin in 0, skip optional space (can be one here)
          '(?![$\\w\xA0-\xFF\\.])(.))' +    // $1: non var name nor dot char, w/ negative lookahead. dot|name follows?
          '(?!(?:typeof|in|instanceof|void|true|new|function)\\b)' +
                                            // negative lookahead on previous one, fail the match on some js keywords
          '(' + SRE_VARNAME + ')'           // $2: var name or falsy primitive (JS_FALY)
        ),

      // Matches key names of literal objects
      JS_OBJKEYS = newRegExp(
          '(?=[,{]'   +                     // lookehead for start or separator of k:v pair
          SRE_VARNAME +                     // match a name, but only
          '?:)(.)',                         // $1: capture the bracket or separator
          'g'                               // needed, this is for replace()
        ),

      // For optimization of falsy values with nonull=true (JS_VARSTART let pass these)
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
    if (match) {                            // how much is wrap nedeed?
                                            // wrap vars in expression
      var ss = [],
          mvar,
          wrap = 0,
          gre = RegExp

      do {

        // string.match() with regexp without the global flag returns submatches
        // $1: character not part of the var name, must be pushed before wrap
        // $2: var name

        ss.push(gre.leftContext + (match[1] || ''))   // save left part & dangling char
        expr = gre.rightContext                       // expr to be processed later
        mvar = match[2]

        if (JS_FALSY[mvar])
          ss.push(astxt ? '""' : mvar)                // mode 1 (text) returns ''

        else {
          ss.push(mvar in JS_FALSY ? mvar : ('("' + mvar + VAR_CONTEXT + mvar))

          wrap = wrap || astxt || /^[\[\(\.]/.test(expr)
        }

      } while ((match = expr.match(JS_VARSTART)))

      expr = (ss.join('') + expr).trim()              // don't trim inner spaces here

      if (wrap)
        expr = '(function(v){try{v=' + expr +
                '}finally{return ' + WRAP_RETVAL[astxt] + '}}).call(D)'

      //else if (astxt)
      //  expr = '((v=' + expr + ')||v===0v:"")'

    } // if match

    return okeys ? expr.replace(/\uFFF30/g, '') : expr

  }
  // end of wrapExpr()


  // Private function - Common helper
  // Creates a new regexp (uglify save some bytes with this)

  function newRegExp(restr, opts) {

    return new RegExp(restr, opts)

  }
  // end of newRegExp()


  return _tmpl        // the exposed function


})()
// end of IIFE for tmpl
