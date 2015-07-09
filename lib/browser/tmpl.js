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

/*
  2015-07-03 aMarCruz: Complete rewriting.

    The goals of this update: flexibility, backward compatibility, cleaner user code.

    Some enhancements...

    - Fewer errors in recognizing complex expressions and early detection of errors in
      class shorthands.
      Fixed #784 - The shorthand syntax for class names doesn't support parentheses.
      Now, you can write code like this: `{ foo: ($b++, ($a > 0) || ($b & 1)) }`

    - Unprefixed keywords `void`, `window` and `global`, in addition to `this`.
      These keywords are not prefixed and, if used alone or with only one property,
      will not have try..catch protection.
      This allows the user choose the desired context, generate faster code and can be
      detected bugs that would otherwise remain hidden.
      EDIT: Reverted to old behavior, keywords not wrapped, but protected by try..catch

    - Instantiation with the constructor's name in parentheses use the default context,
      providing flexibility and optimal code for common scenarios.

    - Better recognition of nested brackets, escaping is almost unnecessary.
      Brackets inside js literal strings, and nested brackets properly balanced in
      template and expressions, are ignored completely.

    - Better recognition of literal regexps inside template and expressions.
      User RegExp's do not interfere with the riot internal code generation.

    - Better recognition of comments, including empty ones.
      Comments are allowed anywhere. They are preserved in template text and literal js
      strings, and converted to spaces in the expression code, according to js specs.

    - Support for full ISO-8859-1 charset in js var and class names, allowing the use
      of accented characters.

    - Mac/Win EOL's normalization avoids unexpected results with some editors.
      Normalization is in the template text.
      In shorthand names, whitespace are converted to spaces and compacted.
      Expressions use compactation and literal strings preserve all whitespace.
      (Fix #)

    Behind the scenes...

    - Optimization of generated code for the getter, it must be faster at runtime.
      (tmpl is prepared for working in the server side, generating better code)

    - The `this` context is set at the root level of the getter function --see tmpl(),
      no need to wrap `this` in the returned expression.

    - Regexps created by the RegExp constructor in the tmpl closure are reusing parts.
      This is a bit slower than literal regexps, but allows easier modifications.

    - Enhanced brackets cache, to avoid waste time and resources recreating regexp,
      and custom brackets are escaped only if necessary, so regexps are clearer.
      (Anyway, I think escaping all chars in regexp is dangerous)

    - TODO:
      Facilities for debugging, you can display the generated code for each getter.
*/


//// -------------------
//// brackets() function
//// -------------------

// Low level function for track changes to the brackets.
// Parameter can be one of:
//
// RegExp - If the current brackets are the defaults, returns the original RegExp, else
//          returns a new RegExp with the default brackets replaced by the custom ones.
//          WARNING: new custom RegExp discards the /i and /m flags.
// number - If number is...
//          0,1 -returns the current left (0) or right (1) brackets characters
//          2,3 -returns the current left (3) or right (4) escaped brackets characters
//          4   -returns RegExp based on /\\({|})/g for match escaped brackets
//          5   -returns RegExp based on /(\\?)\{/g for match opening brackets
//          6   -returns RegExp based on /(\\?)(?:({\(\[)|})/g for match opening js
//               brackets or riot closing brackets

// IIFE
var brackets = (function (defaults) {

  // Cache on closure, initialized on first use and on bracket changes

  var cachedBrackets,     // full brackets string in use, for change detection
      pairs               // [0,1] raw left-right brackets pair
                          // [2,3] escaped pair, for safe RegExp constructions

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

    if (reOrIdx instanceof RegExp) {              // for RegExp...

      return s === defaults ?                     // if the current brackets are the
        reOrIdx :                                 // defaults, returns regexp as-is

        // Rewrite RegExp with the default brackets replaced with the custom ones.
        // Let the user choose whether to double escape characters.
        new RegExp(
          reOrIdx.source.replace(/{|}/g, function (b) { return pairs[(b === '}') + 2] }),
          reOrIdx.global && 'g'
        )
    }

    // `reOrIdx` is not a RegExp, assume it is an index to the desired cached element
    return pairs[reOrIdx]

  }
  // end of _brackets() [entry point]

})('{ }')
// end of IIFE for brackets


//// ---------------
//// tmpl() function
//// ---------------

// IIFE for tmpl()
var tmpl = (function (/*DEBUG*/) {

  var
    // Invalid Unicode code points (ICH_) used for hide some parts of the expression
    ICH_REGEXP  = '\uFFF0',
    ICH_QSTRING = '\uFFF1',
    ICH_OBJKEYS = '\uFFF2',

    // Match a hidden quoted string marker, $1 capture the index to the qstring in the
    // hqs array of create (it is the qstring index in the whole template string, too).
    RE_QSMARKER = /\x01(\d+)\uFFF1/g,

    // Matches single or double quoted strings, including empty ones and strings with
    // embedded escaped quotes and whitespace. $1 is the left quote (for back ref).
    RE_QSTRINGS = /('|")(?:\\.|[\s\S])*?\1/g,

    // Matches valid comments in (almost) all of its forms, including empty comments
    // and nested opening sequences.
    RE_COMMENTS = /\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//g,

    // Matches true RegExps (not in comments or quoted strings)
    RE_REGEXPS = newRegExp(
      RE_COMMENTS.source + '|' +        // skips comments
      RE_QSTRINGS.source + '|' +        // $1: left quote. skips strings
      '(\\/(?:\\\\.|[\\s\\S])+?\\/)',   // $2: regexp
      'g'),

    EMPTYSTR = '""'


  // Private function
  // Creates a function instance for get a value from the received template string.

  function create(str) {

    // You can drop debugging blocks in your minimized version by using uglify
    // conditional compilation options: `-c -d DEBUG=false`

    //if (DEBUG) { if (console && console.info) console.info('recv: \'' +
    //str.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '\'') }

    // Empty strings never get here. This function is only called from _tmpl,
    // and _tmpl returns falsy values before calling here.

    var rex = [],                 // holds the hidden, literal regexps
        hqs = [],                 // saved (non empty) literal strings

        // Hiding regexps here avoids complications through all the code, and does not
        // affect the logic, but be carefull and don't touch comments or qstrings yet.

        expr = str.replace(RE_REGEXPS, function (s, _, r) {

          if (!r) return s        // if is a comment or string, preserve
          rex.push(escapeStr(r))  // if is a regexp, save it
          return ICH_REGEXP       // replace it with a invalid char

        }),

        // sliptByParts will...
        // - Split the received string into its ttext / expressions parts
        // - Save and hide non empty quoted strings in expressions
        // - Convert comments _in expressions_ to spaces
        // - Unescape escaped brackets

        parts = splitByPairs(expr, hqs)

    // Generates the js expression to return a value with the returned function.
    // Single expressions return raw values, within templates, returns text.

    // GOTCHA: Expressions in Class Shorthands are protected with try blocks to a
    //         more granular level than the rest, so they have different behavior

    if (parts.length > 2 || parts[0]) {

      var list = [],
          i,
          j = 0

      for (i = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr =

              i & 1 ?                         // every odd element is an expression

              parseExpr(expr, hqs, 1) :       // mode 1 (raw) prevents falsy values, other
                                              // than zero, are displayed in the output

              '"' + expr                      // raw text: convert to js literal string
                .replace(/\r?\n|\r/g, '\\n')  // normalize and preserve EOLs
                .replace(/"/g, '\\"') +       // escape inner double quotes
              '"'                             // enclose double quotes

          ) || expr === 0) list[j++] = expr

      }

      expr = j > 1 ?                          // optimize code for 0-1 parts
             '[' + list.join(',') + '].join("")' :
             j ? '""+' + list[0] : EMPTYSTR

    }
    else {

      expr = parseExpr(parts[1], hqs, 0)    // this is a single expression (e.g. `{ x }`)
                                            // returns the raw value of the expression, or
                                            // undefined if the expression generates error
                                            // at evaluation time (mostly ReferenceError)
    }

    // Restore hidden literals in order.
    // First, quoted strings; last, the regexps

    expr = restoreByChar(

            expr.replace(RE_QSMARKER, function (_, pos) {
              return escapeStr(
                      hqs[pos | 0]          // retrieve the original string by index
                    )
            }),
          rex, ICH_REGEXP)

    //if (DEBUG) { if (console && console.info) console.info(' OUT: ' +
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

  var
      // Matches quoted strings or comments (qblocks)
      RE_QBLOCKS = newRegExp(
        RE_QSTRINGS.source + '|' +
        RE_COMMENTS.source,
        'g'
      ),

      // Matches js brackets. Used by splitByPairs.skipBracketedPart and skipBrackets
      JS_BRACKETS = {
        '{': /\{|\}/g,  // eslint-disable-line no-dupe-keys
        '[': /\[|\]/g,
        '(': /\(|\)/g
      }


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

      * The template comes with regexps hidden, and skipQBlocks hides qstrings here.
    */

    // We can get a long string here, so be nice to GC and try to not re-allocate

    var eb = brackets(4),           // regexp, matches current escaped riot brackets
        re = brackets(5),           // regexp, for (riot or js) brackets detection
        parts = [],                 // holds the resulting parts
        start,                      // start position of current template or expression
        match,                      // reused by both outer and nested searches
        pos,                        // current position (exec() result)
        isexpr,                     // we are in ttext (0) or expression (1)
                                    // --- q* vars used by skipQBlocks:
        qposLt = -1,                // start position of the current qblock
        qmatch                      // resulting match in the closure

    re.lastIndex = start = isexpr = 0

    while ((match = re.exec(str))) {

      pos = match.index

      // `re` is based on `/(\\?)(?=([{\[\(])|{{|}})(?:({{)|(}})|.)?/g`, so:
      // $1: optional escape character
      // $2: opening js bracket `{[(`
      // $3: opening riot bracket
      // $4: closing riot bracket

      if (isexpr) {

        // We are in expression.
        // Brackets inside qblocks and js braces by pairs, are ignored.
        // This works even if the opening bracket of riot is the same as a js bracket,
        // because we already skipped the first (that switched to expression mode).

        if ((pos = skipQBlocks(re, pos)) < 0)
          continue                              // skip any character within quotes

        if (match[2]) {                         // any opening bracket here is part
                                                // of the expression, so
          skipBracketedPart(match[2])           // skip this block
          continue                              // and continue with the next char
        }
      }

      // At this point, we expect only a _unescaped_ bracket in $2 for text mode,
      // or in $3 for expression. If so, save the part and switch the mode.

      if (match[isexpr +3] && !match[1]) {      // is the expected, unescaped bracket?
                                                // push part, even if empty
        pushUnescapedStr(parts, str.slice(start, pos))

        start = re.lastIndex                    // next position is the new start
        isexpr ^= 1                             // switch mode
      }

    }

    if (start < str.length)                     // push remaining part, if we have one
      pushUnescapedStr(parts, str.slice(start))

    return parts                                // and we are done!

    //// ----------------------
    //// Inner Helper Functions

    // Returns the position +1 of the closing bracket of `opench`

    function skipBracketedPart(opench) {

      var recch = JS_BRACKETS[opench],          // JS_BRACKETS is decl in 'common helpers'
                                                // we are using recch w/ skipQBlocks, too
          level = 1                             // when level drops to 0, will have
                                                // found our right bracket.

      // Skip the first opening bracket using `pos` because the match can be on riot
      // brackets with length over 1 and re.lastIndex be offset with this excess.
      // e.g. with '{{' we must count the first brace only, but match includes both.

      recch.lastIndex = !!match[1] + pos + 1    // escape.length + pos + 1

      while (level && (match = recch.exec(str))) {

        if (~skipQBlocks(recch, match.index))
          match[0] === opench ? ++level : --level
      }

      re.lastIndex = match ? recch.lastIndex : str.length

    }
    // end of skipBracketedPart()


    // Unescape escaped brackets and store the qstring in the given array.
    // eb is /\\?({|})/g, so $1 excludes the escape character

    function pushUnescapedStr(arr, str) {

      arr.push(str && str.replace(eb, '$1'))

    }
    // end of pushUnescapedStr()


    // Converts comments in spaces, saves and hides quoted strings, updates the outer
    // (re.)lastIndex, and returns true if the `pos` position is inside a comment or
    // quoted string.

    function skipQBlocks(re, pos) {

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
              '\x01' + hqs.length + ICH_QSTRING :     // create marker for qstring
              ' '                                     // else replace comment w/space

            pushUnescapedStr(hqs, qblock)             // unescape brackets here, too
                                                      // @(backward compatible)
            if (pos < qposRt) pos = -1                // signal if pos is inside qblock
                                                      // replace qblock
            str = str.slice(0, qposLt) + marker + str.slice(qposRt)
            qposRt = qposLt + marker.length           // skip qblock

            // If pos is inside the qblock, move the outer regexp pointer out of qblock
            // else, adjust pos and outer pointer according to the new length of str.
            // we can't return true here, as it is needed a new search

            re.lastIndex = ~pos ?
              (pos += marker.length - qblock.length) + 1 :
              qposRt
          }
        }

        // Any qblock found remains unhidden until we're sure it belongs to an expression.
        // If no qblock is found, set qposLt to the end of string (beyond `pos` value)

        RE_QBLOCKS.lastIndex = qposRt                 // begin searching at own offset

        qposLt = (qmatch = RE_QBLOCKS.exec(str)) ?
          qmatch.index :                              // this is the start of qblock
          str.length + 1                              // avoid entering here again

      } // end while qposLt <= pos

      return pos  // -1 if pos is inside qblock

    }
    // end of skipQBlocks()

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

  function parseExpr(expr, qstr, mode) {

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
          .replace(/ ?([\(\[{},\?\.:]) ?/g, '$1').trim()

    if (!expr) return ''

    // Detection of expression type

    var pairs = extractCSList(expr)           // get [[qstring-idx, name, expr]]

    // Expression only:   mode == 0 -- nonull == false
    // Text + expression: mode == 1 -- nonull == true

    if (!pairs) {

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

    var list = pairs.map(function (kv) {

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
          wrapExpr(kv[2], 2) +                  // use raw-test mode (multiblock)
          ')?"'  + kv[1]  + '":""'              // all error/falsy values returns ""

    })

    return list.length < 2 ?                    // optimize 'one element' cases
       list[0] :
      '[' + list.join(',') + '].join(" ").trim()'

  }
  // end of parseExpr()


  // Private function - Helper for parseExpr()
  // If `str` is a shorthand list, return an array with its parts, or falsy if is not.
  // This function cares about nested commas.

  var
      // Matches the `name:` part of a class shorthand
      CSNAME_PART = newRegExp(
        '^(' +                          // always at 0, we are searching rightContext
        RE_QSMARKER.source +            // $1: qstring marker + $2: qstring index, or...
        '|-?[_A-Za-z\xA0-\xFF][-\\w\xA0-\xFF]*' +
                                        // $1: literal w3c indentifier (almost)
        '):'                            // skip colon, expression follows
      ),

      // Matches open js brackets, comma outside brackets, or the end of str
      CSPART_END = /([\[{\(])|,|$/g     // $1: js bracket

  function extractCSList(str) {

    var list = [],                      // [qstring index, name, and expr] for each pair
        match,                          // CSNAME_PART results
        mend,                           // CSPART_END results
        gre,
        ch

    // Try to match the first name testing `match !== null && match.index === 0`

    while (
        str &&                                // search in the ramaining substring
        (match = str.match(CSNAME_PART)) &&   // null match or
        !match.index                          // start > 0 means error
      ) {

      gre = RegExp
      str = gre.rightContext                  // skip the `name:` part
      CSPART_END.lastIndex = 0                // reset lastIndex for exec

                                              // search next comma outside brackets
      while ((mend = CSPART_END.exec(str)) && (ch = mend[1])) {

        CSPART_END.lastIndex = skipBrackets(str, CSPART_END.lastIndex, ch)
      }

      list.push([                             // match still valid, push...
          match[2],                           // 0: hidden qstring index
          match[1],                           // 1: unquoted name
          str.slice(0, mend.index)            // 2: expression
        ])

      str = gre.rightContext
    }

    if (!mend) return 0        // returns falsy if str is a "normal" js expression

    // Explicit error detection for easy debugging.
    // If str (rightContext) is not empty, we have a comma after the previous pair,
    // so this must begin with a name. if not, we have a syntax error.
    // This is consistent with the literal objects notation (of js), if the user
    // wants a comma operator, must use parentheses.

    if (str)
      throw new SyntaxError('Cannot parse ... ' + str + '}')

    return list

  }
  // end of extractCSList()


  ////-----------------------------------------------------------------------------------
  //// WRAPPERS
  ////-----------------------------------------------------------------------------------

  var
      // Strings used by wrapTest() and wrapExpr()
      VAR_CONTEXT = '"in D?D:' + (typeof window === T_OBJECT ? 'window' : 'global') + ').',
      WRAP_PREFIX = '(function(v){try{v=',
      WRAP_SUFFIX = [
          '}catch(e){}return v}).call(D)',            // raw & test modes (0, 2)
          '}catch(e){}return v||v===0?v:""}).call(D)' // mixed mode (1)
        ],

      // String for RegExp, match a var name -- accept 8 bit, iso-8859-1 chars
      SRE_VARNAME = '[$_A-Za-z\xA0-\xFF][$\\w\xA0-\xFF]*',

      // Matches a var name only. Used by wrapExpr with successive string.match
      // Note:  We are using negative lookahead to exclude properties without capture, so
      //        it works fine with test() or match(). Gotcha is that we are left with a
      //        dangling character in $1. prefixVar() returns it to the str.
      // base: /(?:^ ?|(?![$\w\xA0-ÿ\.])(.))(?!(?:typeof|in|instanceof|void|true|function)\b)(?:(new[ \(])?([$_A-Za-z\xA0-ÿ][$\w\xA0-ÿ]*))/
      JS_VARSTART = newRegExp(
          '(?:^ ?|' +                       // begin in 0, skip optional space (can be one here)
          '(?![$\\w\xA0-\xFF\\.])(.))' +    // $1: non alphanumeric nor dot char, w/ negative lookahead. dot|name follows?
          '(?!(?:typeof|in|instanceof|void|true|function)\\b)' +
                                            // negative lookahead over the previous one, fail the match on some js keywords
          '(?:(new[ \\(])?(' +              // $2: optional `new` keyword, supports `new(ctor)` contructions
          SRE_VARNAME + '))'                // $3: var name or falsy primitive (see JS_FALY)
        ),

      // Matches one property or parameter (open bracket). For using with JS_VARSTART
      JS_VARCHAIN = newRegExp(
          '^' +                             // match start --searching is in a substring of expr
          '(\\(|\\[)|' +                    // $1: js open brackets
          '(\\.[$\\w\xA0-\xFF]*)|' +        // $2: dot + property name or digits (e.g. prop.0)
          '(\\++|--) ?'                     // $3: postfix operator and space (no leading space please)
        ),

      // Matches key names of literal objects
      JS_OBJKEYS = newRegExp(
          '(?=[,{]'   +                     // lookehead for start or separator of k:v pair
          SRE_VARNAME +                     // match a name, but only
          '?:)(.)',                         // $1: capture the bracket or separator
          'g'                               // needed, this is for replace()
        ),

      // Matches marks set to hide the key names on literal objects
      JS_KEYMARK = newRegExp(
          ICH_OBJKEYS + '0',
          'g'
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


  // Private function
  // Generates js code to get an expression value, wrapped in a try..finally block
  // to avoid break on errors or undefined vars.
  // The generated code will be inserted in an array, returned by parseExpr()

  function wrapExpr(expr, mode) {

    // Expression only:   mode == 0 -- nonull == false
    // Text + expression: mode == 1 -- nonull == true
    // Class shortcuts:   mode == 2 -- nonull == false -- if (pairs)

    var okeys = ~expr.indexOf('{')

    if (okeys)
      expr = expr.replace(JS_OBJKEYS, '$1' + ICH_OBJKEYS + '0')

    if (JS_VARSTART.test(expr)) {                 // how much is wrap nedeed?
                                                  // wrap vars in expression
      expr = (mode === 2 ? wrapTest : wrapVars)(expr, mode)

    }

    if (okeys)
      expr = expr.replace(JS_KEYMARK, '')

    return expr

  }
  // end of wrapExpr()


  // Private function
  // Helper for wrapExpr() with class shorthands
  // Wrap each var in expression, and their chained props/methods, in its own block.
  // Because each var is wrapped with a function, and we are returning the var value
  // and not its reference, it is necessary to give special support to some things
  // such as asignment operators, wich require lvalues.
  // e.g.
  //   `++(function(){return (D||window).prop})()` does not increment `prop` itself

  // NOTE:  Nested variables (e.g. calling parameters or literal object values) are
  //        protected with the parent try block, just like wrapVar does with "normal"
  //        expressions.

  // NOTE:  With this function, riot provides basic support for postfix increment /
  //        decrement operators only, in shorthand expressions. It is unlikely we
  //        support other assignment operators in this major version.

  function wrapTest(expr, root, wrap) {

    // First entry: root == 2 -- nonull == false
    // Recursive:   root == 0 -- nonull == false

    var ss = [],
        match,
        mvar,
        gre,
        br

    // We need wrap all the properties and methods chained to the current var.
    // The tricky part is knowing where the chain stops.

    while ((match = expr.match(JS_VARSTART))) {       // expr.match resets lastIndex

      // $1: character not part of the var name, must be pushed before wrap
      // $2: optional 'new ' keyword, including `new(ctor)()` forms
      // $3: var name

      gre = RegExp
      ss.push(gre.leftContext)
      expr = gre.rightContext
      mvar = match[3]

      if (JS_FALSY[mvar])

        ss.push(EMPTYSTR)                           // falsy with nonull=true returns ''

      else if ((mvar = prefixVar(match, ss, mvar))) {
                                                    // prefixVar said we can continue
        (wrap || (wrap = {})).v = root ? 0 : 1

        while (!expr.search(JS_VARCHAIN)) {         // while search === 0

          // Search for js opening braces. If found, protect enclosed vars with explicit
          // context, but without try block @(backward compatible).
          // Note: grab $1 before calling skipBrackets, 'cause it changes RegExp

          if ((br = gre.$1)) {                      // js bracket? prefix enclosed vars

            var i = gre.lastMatch.length,           // don't include left brackets
                j = skipBrackets(expr, i, br)       // find pos following close brackets

            mvar += br + wrapTest(                  // concat left brackets, wrap inner
                    expr.slice(i, j), 0, wrap)      //  expr, including right bracket
                                                    //  w/recursion
            expr  = expr.substr(j)                  // skip proccesed part
          }
          else {

            expr  = gre.rightContext                // skip this prop/method
            mvar += gre.$2 || gre.$3                // add prop or operator

            if (gre.$3)                             // if we have ++ or --
              break                                 // we finish with mvar
            wrap.v++
          }
        }

        // TODO: Detect safe cases to avoid wrap, as in wrapExpr? too complicate

        ss.push(                                    // protect this (one) variable in
          (root & wrap.v) ?                         // their own block, if necessary
            WRAP_PREFIX + mvar + WRAP_SUFFIX[0] :
            mvar
        )
      }
    }

    return (ss.join('') + expr).trim()              // don't strip inner spaces

  }
  // end of wrapTest()


  // Private function
  // Helper for wrapText and wrapExpr
  // Note: received match was generated by the JS_VARSTART regexp

  function prefixVar(match, ss, mvar) {

    // match[2] is undefined, or the 'new' keyword followed by space or parentheses.
    // Complexity grows if we parse parentheses here so, if we have 'new(', revert
    // the match and return falsy.

    var newop = match[2] || ''

    if (newop && newop.slice(-1) === '(') {     // there can be no spaces after '('
      ss.push(match[0])                         // don't mess with next ctor
      return false                              // signal to caller
    }

    // match[1] has one char not part of the var name
    // push char not part of var name and returns the var name prefixed with the
    // ontional 'new' operator (first) and code for context detection (last).

    if (match[1]) ss.push(match[1])             // char not part of var name

    return newop +
          (mvar in JS_FALSY ?                   // this, global, window
           mvar :
          '("' + mvar + VAR_CONTEXT + mvar)    // ("mvar"in D?D:window).mvar

  }
  // end of prefixVar()


  // Private function - Helper for wrapExpr()
  // For unique expression or alternate template text / expressions.
  // If it is necessary, this function encloses the expression in a `try..finally` block
  // and preffix all non qualified variables (w/o `this`, `window`, or `global`) with
  // their possible context, to avoid ReferenceError exceptions.
  // e.g. `("prop" in D:D?global).prop` -- 'D' is set to `this` by the caller.

  function wrapVars(expr, falsy) {

    // Expression only:   falsy == 0 -- nonull == false -> return raw value
    // Text + expression: falsy == 1 -- nonull == true  -> "" if falsy

    var ss = [],
        match,
        mvar,
        wrap = 0,
        gre = RegExp

    while ((match = expr.match(JS_VARSTART))) {     // string.match over regexp without
                                                    // global flag returns submatches

      // $1: character not part of the var name, must be pushed before wrap
      // $2: optional 'new ' keyword, including `new(ctor)()` forms
      // $3: var name

      ss.push(gre.leftContext)                      // save the part not to wrap
      expr = gre.rightContext                       // expr to be processed later
      mvar = match[3]

      if (JS_FALSY[mvar])

        ss.push(wrap ? EMPTYSTR : mvar)             // falsy with nonull=true returns ''

      else if ((mvar = prefixVar(match, ss, mvar))) {

        ss.push(mvar)                               // has context, but no try block

        // We don't need wrap for:
        // vars with zero or one property AND nonull = false, because prefixVar prefixed
        // the var with the context (D||window), and this notation returns undefined.
        // We do wrap if falsy convertion is nedeed or to avoid complexity if we have
        // more than one property or a method call.
        // i.e.
        //                            // assume mvar is not declared
        //   (D||global).mvar         // returns undefined, no error
        //   (D||global).mvar.prop    // throws TypeError
        //   (D||global).mvar()       // throws TypeError

        wrap = wrap || falsy || /^[\[\(\.]/.test(expr)
      }
    }

    expr = (ss.join('') + expr).trim()              // don't trim inner spaces here

    return wrap ?                                   // wrap whole expression in try
      WRAP_PREFIX + expr + WRAP_SUFFIX[falsy] :     // block only if needed
      expr

  }
  // end of wrapVars()


  ////-----------------------------------------------------------------------------------
  //// COMMON HELPERS
  ////-----------------------------------------------------------------------------------


  // Private function
  // Creates a new RegExp (uglify save some bytes with this)

  function newRegExp(restr, opts) {

    return new RegExp(restr, opts)

  }
  // end of newRegExp()


  // Private function
  // Returns the position +1 of closing js bracket, skipping nested brackets.
  // Parameter 'pos' must point to the pos following the open bracket.

  function skipBrackets(str, pos, opench) {

    var re = JS_BRACKETS[opench],
        match

    re.lastIndex = pos
    pos = 1                         // we are done when pos drops to 0

    while (pos && (match = re.exec(str))) {
      match[0] === opench ? ++pos : --pos
    }

    return match ? re.lastIndex : str.length

  }
  // end of skipBrackets()


  // Private function
  // Restore hidden literals stored in array to str

  function restoreByChar(str, arr, ch) {

    for (var i = 0; i < arr.length; ++i) {
      str = str.replace(ch, arr[i])
    }

    return str

  }
  // end of restoreByChar()


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

  return function _tmpl(str, data) {

    // by using .call(data,data) there's no need to wrap `this`

    return str && (cache[str] || (cache[str] = create(str))).call(data, data)

  }
  // end of _tmpl() [entry point]

})()
// end of IIFE for tmpl
