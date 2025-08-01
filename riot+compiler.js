/* Riot v10.0.0-rc.1, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.riot = {}));
})(this, (function (exports) { 'use strict';

  // Riot.js constants that can be used across more modules

  const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
    DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
    PLUGINS_SET = new Set(),
    IS_DIRECTIVE = 'is',
    VALUE_ATTRIBUTE = 'value',
    REF_ATTRIBUTE = 'ref',
    EVENT_ATTRIBUTE_RE = /^on/,
    MOUNT_METHOD_KEY = 'mount',
    UPDATE_METHOD_KEY = 'update',
    UNMOUNT_METHOD_KEY = 'unmount',
    SHOULD_UPDATE_KEY = 'shouldUpdate',
    ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
    ON_MOUNTED_KEY = 'onMounted',
    ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
    ON_UPDATED_KEY = 'onUpdated',
    ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
    ON_UNMOUNTED_KEY = 'onUnmounted',
    PROPS_KEY = 'props',
    STATE_KEY = 'state',
    SLOTS_KEY = 'slots',
    ROOT_KEY = 'root',
    IS_PURE_SYMBOL = Symbol('pure'),
    IS_COMPONENT_UPDATING = Symbol('is_updating'),
    PARENT_KEY_SYMBOL = Symbol('parent'),
    TEMPLATE_KEY_SYMBOL = Symbol('template'),
    ROOT_ATTRIBUTES_KEY_SYMBOL = Symbol('root-attributes');

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type
  }

  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */
  function isSvg(el) {
    const owner = el.ownerSVGElement;

    return !!owner || owner === null
  }

  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */
  function isTemplate(el) {
    return el.tagName.toLowerCase() === 'template'
  }

  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */
  function isFunction(value) {
    return checkType(value, 'function')
  }

  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */
  function isBoolean(value) {
    return checkType(value, 'boolean')
  }

  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */
  function isObject(value) {
    return !isNil(value) && value.constructor === Object
  }

  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */
  function isNil(value) {
    return value === null || value === undefined
  }

  /**
   * Detect node js environment
   * @returns {boolean} true if the runtime is node
   */
  function isNode() {
    return typeof globalThis.process !== 'undefined'
  }

  /**
   * Check if an attribute is a DOM handler
   * @param   {string} attribute - attribute string
   * @returns {boolean} true only for dom listener attribute nodes
   */
  function isEventAttribute$1(attribute) {
    return EVENT_ATTRIBUTE_RE.test(attribute)
  }

  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT$1 = 2;
  const VALUE = 3;
  const REF = 4;

  const expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT: TEXT$1,
    VALUE,
    REF,
  };

  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */
  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase())
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @param   { string } cause - optional error cause object
   * @returns { undefined } hoppla... at this point the program should stop working
   */
  function panic$1(message, cause) {
    throw new Error(message, { cause })
  }
  /**
   * Returns the memoized (cached) function.
   * // borrowed from https://www.30secondsofcode.org/js/s/memoize
   * @param {Function} fn - function to memoize
   * @returns {Function} memoize function
   */
  function memoize$1(fn) {
    const cache = new Map();
    const cached = (val) => {
      return cache.has(val)
        ? cache.get(val)
        : cache.set(val, fn.call(this, val)) && cache.get(val)
    };
    cached.cache = cache;
    return cached
  }

  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @param   {Object} scope - the scope where the attribute values will be evaluated
   * @returns {Object} key value pairs with the result of the computation
   */
  function generatePropsFromAttributes(attributes, scope) {
    return attributes.reduce((acc, { type, name, evaluate }) => {
      const value = evaluate(scope);

      switch (true) {
        // spread attribute
        case !name && type === ATTRIBUTE:
          return {
            ...acc,
            ...value,
          }
        // ref attribute
        case type === REF:
          acc.ref = value;
          break
        // value attribute
        case type === VALUE:
          acc.value = value;
          break
        // normal attributes
        default:
          acc[dashToCamelCase(name)] = value;
      }

      return acc
    }, {})
  }

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG$1 = 3;
  const SLOT = 4;

  const bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG: TAG$1,
    SLOT,
  };

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */
  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase(attribute.name)] = attribute.value;
      return acc
    }, {})
  }

  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */

  // Ignore this helper because it's needed only for svg tags
  function moveChildren(source, target) {
    // eslint-disable-next-line fp/no-loops
    while (source.firstChild) target.appendChild(source.firstChild);
  }

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    // eslint-disable-next-line fp/no-loops
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */
  function clearChildren(children) {
    // eslint-disable-next-line fp/no-loops,fp/no-let
    for (let i = 0; i < children.length; i++) removeChild(children[i]);
  }

  /**
   * Remove a node
   * @param {HTMLElement}node - node to remove
   * @returns {undefined}
   */
  const removeChild = (node) => node.remove();

  /**
   * Insert before a node
   * @param {HTMLElement} newNode - node to insert
   * @param {HTMLElement} refNode - ref child
   * @returns {undefined}
   */
  const insertBefore = (newNode, refNode) =>
    refNode &&
    refNode.parentNode &&
    refNode.parentNode.insertBefore(newNode, refNode);

  /**
   * Replace a node
   * @param {HTMLElement} newNode - new node to add to the DOM
   * @param {HTMLElement} replaced - node to replace
   * @returns {undefined}
   */
  const replaceChild = (newNode, replaced) =>
    replaced &&
    replaced.parentNode &&
    replaced.parentNode.replaceChild(newNode, replaced);

  // does simply nothing
  function noop$1() {
    return this
  }

  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */
  function autobindMethods(source, methods) {
    methods.forEach((method) => {
      source[method] = source[method].bind(source);
    });

    return source
  }

  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */
  function callOrAssign(source) {
    return isFunction(source)
      ? source.prototype && source.prototype.constructor
        ? new source()
        : source()
      : source
  }

  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the property overriding the default options
   * @returns {Object} - the original object modified
   */
  function defineProperty(source, key, value, options = {}) {
    /* eslint-disable fp/no-mutating-methods */
    Object.defineProperty(source, key, {
      value,
      enumerable: false,
      writable: false,
      configurable: true,
      ...options,
    });
    /* eslint-enable fp/no-mutating-methods */

    return source
  }

  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the property overriding the default options
   * @returns {Object} the original object modified
   */
  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach(([key, value]) => {
      defineProperty(source, key, value, options);
    });

    return source
  }

  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */
  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach(([key, value]) => {
      if (!source[key]) source[key] = value;
    });

    return source
  }

  /* Riot Compiler, @license MIT */

  const TAG_LOGIC_PROPERTY = 'exports';
  const TAG_CSS_PROPERTY = 'css';
  const TAG_TEMPLATE_PROPERTY = 'template';
  const TAG_NAME_PROPERTY = 'name';
  const RIOT_MODULE_ID = 'riot';
  const RIOT_INTERFACE_WRAPPER_NAME = 'RiotComponentWrapper';
  const RIOT_TAG_INTERFACE_NAME = 'RiotComponent';

  const JAVASCRIPT_OUTPUT_NAME = 'javascript';
  const CSS_OUTPUT_NAME = 'css';
  const TEMPLATE_OUTPUT_NAME = 'template';

  // Tag names
  const JAVASCRIPT_TAG = 'script';
  const STYLE_TAG = 'style';
  const TEXTAREA_TAG = 'textarea';

  // Boolean attributes
  const IS_RAW = 'isRaw';
  const IS_SELF_CLOSING = 'isSelfClosing';
  const IS_VOID = 'isVoid';
  const IS_BOOLEAN = 'isBoolean';
  const IS_CUSTOM = 'isCustom';
  const IS_SPREAD = 'isSpread';

  var c = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CSS_OUTPUT_NAME: CSS_OUTPUT_NAME,
    IS_BOOLEAN: IS_BOOLEAN,
    IS_CUSTOM: IS_CUSTOM,
    IS_RAW: IS_RAW,
    IS_SELF_CLOSING: IS_SELF_CLOSING,
    IS_SPREAD: IS_SPREAD,
    IS_VOID: IS_VOID,
    JAVASCRIPT_OUTPUT_NAME: JAVASCRIPT_OUTPUT_NAME,
    JAVASCRIPT_TAG: JAVASCRIPT_TAG,
    STYLE_TAG: STYLE_TAG,
    TEMPLATE_OUTPUT_NAME: TEMPLATE_OUTPUT_NAME,
    TEXTAREA_TAG: TEXTAREA_TAG
  });

  /**
   * Not all the types are handled in this module.
   *
   * @enum {number}
   * @readonly
   */
  const TAG = 1; /* TAG */
  const ATTR = 2; /* ATTR */
  const TEXT = 3; /* TEXT */
  const CDATA = 4; /* CDATA */
  const COMMENT = 8; /* COMMENT */
  const DOCUMENT = 9; /* DOCUMENT */
  const DOCTYPE = 10; /* DOCTYPE */
  const DOCUMENT_FRAGMENT = 11; /* DOCUMENT_FRAGMENT */

  var types$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ATTR: ATTR,
    CDATA: CDATA,
    COMMENT: COMMENT,
    DOCTYPE: DOCTYPE,
    DOCUMENT: DOCUMENT,
    DOCUMENT_FRAGMENT: DOCUMENT_FRAGMENT,
    TAG: TAG,
    TEXT: TEXT
  });

  const rootTagNotFound = 'Root tag not found.';
  const unclosedTemplateLiteral = 'Unclosed ES6 template literal.';
  const unexpectedEndOfFile = 'Unexpected end of file.';
  const unclosedComment = 'Unclosed comment.';
  const unclosedNamedBlock = 'Unclosed "%1" block.';
  const duplicatedNamedTag =
    'Multiple inline "<%1>" tags are not supported.';
  const unexpectedCharInExpression = 'Unexpected character %1.';
  const unclosedExpression = 'Unclosed expression.';

  /**
   * Matches the start of valid tags names; used with the first 2 chars after the `'<'`.
   * @const
   * @private
   */
  const TAG_2C = /^(?:\/[a-zA-Z]|[a-zA-Z][^\s>/]?)/;
  /**
   * Matches valid tags names AFTER the validation with `TAG_2C`.
   * $1: tag name including any `'/'`, $2: non self-closing brace (`>`) w/o attributes.
   * @const
   * @private
   */
  const TAG_NAME = /(\/?[^\s>/]+)\s*(>)?/g;
  /**
   * Matches an attribute name-value pair (both can be empty).
   * $1: attribute name, $2: value including any quotes.
   * @const
   * @private
   */
  const ATTR_START = /(\S[^>/=\s]*)(?:\s*=\s*([^>/])?)?/g;

  /**
   * Matches the spread operator
   * it will be used for the spread attributes
   * @type {RegExp}
   */
  const SPREAD_OPERATOR = /\.\.\./;
  /**
   * Matches the closing tag of a `script` and `style` block.
   * Used by parseText fo find the end of the block.
   * @const
   * @private
   */
  const RE_SCRYLE = {
    script: /<\/script\s*>/gi,
    style: /<\/style\s*>/gi,
    textarea: /<\/textarea\s*>/gi,
  };

  // Do not touch text content inside this tags
  const RAW_TAGS = /^\/?(?:pre|textarea)$/;

  /**
   * Add an item into a collection, if the collection is not an array
   * we create one and add the item to it
   * @param   {Array} collection - target collection
   * @param   {*} item - item to add to the collection
   * @returns {Array} array containing the new item added to it
   */
  function addToCollection(collection = [], item) {
    collection.push(item);
    return collection
  }

  /**
   * Run RegExp.exec starting from a specific position
   * @param   {RegExp} re - regex
   * @param   {number} pos - last index position
   * @param   {string} string - regex target
   * @returns {Array} regex result
   */
  function execFromPos(re, pos, string) {
    re.lastIndex = pos;
    return re.exec(string)
  }

  /**
   * Escape special characters in a given string, in preparation to create a regex.
   *
   * @param   {string} str - Raw string
   * @returns {string} Escaped string.
   */
  var escapeStr = (str) => str.replace(/(?=[-[\](){^*+?.$|\\])/g, '\\');

  function formatError(data, message, pos) {
    if (!pos) {
      pos = data.length;
    }
    // count unix/mac/win eols
    const line = (data.slice(0, pos).match(/\r\n?|\n/g) || '').length + 1;
    let col = 0;
    while (--pos >= 0 && !/[\r\n]/.test(data[pos])) {
      ++col;
    }
    return `[${line},${col}]: ${message}`
  }

  const $_ES6_BQ = '`';

  /**
   * Searches the next backquote that signals the end of the ES6 Template Literal
   * or the "${" sequence that starts a JS expression, skipping any escaped
   * character.
   *
   * @param   {string}    code  - Whole code
   * @param   {number}    pos   - The start position of the template
   * @param   {string[]}  stack - To save nested ES6 TL count
   * @returns {number}    The end of the string (-1 if not found)
   */
  function skipES6TL(code, pos, stack) {
    // we are in the char following the backquote (`),
    // find the next unescaped backquote or the sequence "${"
    const re = /[`$\\]/g;
    let c;
    while (((re.lastIndex = pos), re.exec(code))) {
      pos = re.lastIndex;
      c = code[pos - 1];
      if (c === '`') {
        return pos
      }
      if (c === '$' && code[pos++] === '{') {
        stack.push($_ES6_BQ, '}');
        return pos
      }
      // else this is an escaped char
    }
    throw formatError(code, unclosedTemplateLiteral, pos)
  }

  /**
   * Custom error handler can be implemented replacing this method.
   * The `state` object includes the buffer (`data`)
   * The error position (`loc`) contains line (base 1) and col (base 0).
   * @param {string} data - string containing the error
   * @param {string} msg - Error message
   * @param {number} pos - Position of the error
   * @returns {undefined} throw an exception error
   */
  function panic(data, msg, pos) {
    const message = formatError(data, msg, pos);
    throw new Error(message)
  }

  // forked from https://github.com/aMarCruz/skip-regex

  // safe characters to precced a regex (including `=>`, `**`, and `...`)
  const beforeReChars = '[{(,;:?=|&!^~>%*/';
  const beforeReSign = `${beforeReChars}+-`;

  // keyword that can preceed a regex (`in` is handled as special case)
  const beforeReWords = [
    'case',
    'default',
    'do',
    'else',
    'in',
    'instanceof',
    'prefix',
    'return',
    'typeof',
    'void',
    'yield',
  ];

  // Last chars of all the beforeReWords elements to speed up the process.
  const wordsEndChar = beforeReWords.reduce((s, w) => s + w.slice(-1), '');

  // Matches literal regex from the start of the buffer.
  // The buffer to search must not include line-endings.
  const RE_LIT_REGEX =
    /^\/(?=[^*>/])[^[/\\]*(?:(?:\\.|\[(?:\\.|[^\]\\]*)*\])[^[\\/]*)*?\/[gimuy]*/;

  // Valid characters for JavaScript variable names and literal numbers.
  const RE_JS_VCHAR = /[$\w]/;

  // Match dot characters that could be part of tricky regex
  const RE_DOT_CHAR = /.*/g;

  /**
   * Searches the position of the previous non-blank character inside `code`,
   * starting with `pos - 1`.
   *
   * @param   {string} code - Buffer to search
   * @param   {number} pos  - Starting position
   * @returns {number} Position of the first non-blank character to the left.
   * @private
   */
  function _prev(code, pos) {
    while (--pos >= 0 && /\s/.test(code[pos]));
    return pos
  }

  /**
   * Check if the character in the `start` position within `code` can be a regex
   * and returns the position following this regex or `start+1` if this is not
   * one.
   *
   * NOTE: Ensure `start` points to a slash (this is not checked).
   *
   * @function skipRegex
   * @param   {string} code  - Buffer to test in
   * @param   {number} start - Position the first slash inside `code`
   * @returns {number} Position of the char following the regex.
   *
   */
  /* c8 ignore next */
  function skipRegex(code, start) {
    let pos = (RE_DOT_CHAR.lastIndex = start++);

    // `exec()` will extract from the slash to the end of the line
    //   and the chained `match()` will match the possible regex.
    const match = (RE_DOT_CHAR.exec(code) || ' ')[0].match(RE_LIT_REGEX);

    if (match) {
      const next = pos + match[0].length; // result comes from `re.match`

      pos = _prev(code, pos);
      let c = code[pos];

      // start of buffer or safe prefix?
      if (pos < 0 || beforeReChars.includes(c)) {
        return next
      }

      // from here, `pos` is >= 0 and `c` is code[pos]
      if (c === '.') {
        // can be `...` or something silly like 5./2
        if (code[pos - 1] === '.') {
          start = next;
        }
      } else {
        if (c === '+' || c === '-') {
          // tricky case
          if (
            code[--pos] !== c || // if have a single operator or
            (pos = _prev(code, pos)) < 0 || // ...have `++` and no previous token
            beforeReSign.includes((c = code[pos]))
          ) {
            return next // ...this is a regex
          }
        }

        if (wordsEndChar.includes(c)) {
          // looks like a keyword?
          const end = pos + 1;

          // get the complete (previous) keyword
          while (--pos >= 0 && RE_JS_VCHAR.test(code[pos]));

          // it is in the allowed keywords list?
          if (beforeReWords.includes(code.slice(pos + 1, end))) {
            start = next;
          }
        }
      }
    }

    return start
  }

  /*
   * Mini-parser for expressions.
   * The main pourpose of this module is to find the end of an expression
   * and return its text without the enclosing brackets.
   * Does not works with comments, but supports ES6 template strings.
   */
  /**
   * @exports exprExtr
   */
  const S_SQ_STR = /'[^'\n\r\\]*(?:\\(?:\r\n?|[\S\s])[^'\n\r\\]*)*'/.source;
  /**
   * Matches double quoted JS strings taking care about nested quotes
   * and EOLs (escaped EOLs are Ok).
   *
   * @const
   * @private
   */
  const S_STRING = `${S_SQ_STR}|${S_SQ_STR.replace(/'/g, '"')}`;
  /**
   * Regex cache
   *
   * @type {Object.<string, RegExp>}
   * @const
   * @private
   */
  const reBr = {};
  /**
   * Makes an optimal regex that matches quoted strings, brackets, backquotes
   * and the closing brackets of an expression.
   *
   * @param   {string} b - Closing brackets
   * @returns {RegExp} - optimized regex
   */
  function _regex(b) {
    let re = reBr[b];
    if (!re) {
      let s = escapeStr(b);
      if (b.length > 1) {
        s = `${s}|[`;
      } else {
        s = /[{}[\]()]/.test(b) ? '[' : `[${s}`;
      }
      reBr[b] = re = new RegExp(`${S_STRING}|${s}\`/\\{}[\\]()]`, 'g');
    }
    return re
  }

  /**
   * Update the scopes stack removing or adding closures to it
   * @param   {Array} stack - array stacking the expression closures
   * @param   {string} char - current char to add or remove from the stack
   * @param   {string} idx  - matching index
   * @param   {string} code - expression code
   * @returns {Object} result
   * @returns {Object} result.char - either the char received or the closing braces
   * @returns {Object} result.index - either a new index to skip part of the source code,
   *                                  or 0 to keep from parsing from the old position
   */
  function updateStack(stack, char, idx, code) {
    let index = 0;

    switch (char) {
      case '[':
      case '(':
      case '{':
        stack.push(char === '[' ? ']' : char === '(' ? ')' : '}');
        break
      case ')':
      case ']':
      case '}':
        if (char !== stack.pop()) {
          panic(code, unexpectedCharInExpression.replace('%1', char), index);
        }

        if (char === '}' && stack[stack.length - 1] === $_ES6_BQ) {
          char = stack.pop();
        }

        index = idx + 1;
        break
      case '/':
        index = skipRegex(code, idx);
    }

    return { char, index }
  }

  /**
   * Parses the code string searching the end of the expression.
   * It skips braces, quoted strings, regexes, and ES6 template literals.
   *
   * @function exprExtr
   * @param   {string}  code  - Buffer to parse
   * @param   {number}  start - Position of the opening brace
   * @param   {[string,string]} bp - Brackets pair
   * @returns {Object} Expression's end (after the closing brace) or -1
   *                            if it is not an expr.
   */
  function exprExtr(code, start, bp) {
    const [openingBraces, closingBraces] = bp;
    const offset = start + openingBraces.length; // skips the opening brace
    const stack = []; // expected closing braces ('`' for ES6 TL)
    const re = _regex(closingBraces);

    re.lastIndex = offset; // begining of the expression

    let end;
    let match;

    while ((match = re.exec(code))) {
      // eslint-disable-line
      const idx = match.index;
      const str = match[0];
      end = re.lastIndex;

      // end the iteration
      if (str === closingBraces && !stack.length) {
        return {
          text: code.slice(offset, idx),
          start,
          end,
        }
      }

      const { char, index } = updateStack(stack, str[0], idx, code);
      // update the end value depending on the new index received
      end = index || end;
      // update the regex last index
      re.lastIndex = char === $_ES6_BQ ? skipES6TL(code, end, stack) : end;
    }

    if (stack.length) {
      panic(code, unclosedExpression, end);
    }
  }

  /**
   * Outputs the last parsed node. Can be used with a builder too.
   *
   * @param   {ParserStore} store - Parsing store
   * @returns {undefined} void function
   * @private
   */
  function flush(store) {
    const last = store.last;
    store.last = null;
    if (last && store.root) {
      store.builder.push(last);
    }
  }

  /**
   * Get the code chunks from start and end range
   * @param   {string}  source  - source code
   * @param   {number}  start   - Start position of the chunk we want to extract
   * @param   {number}  end     - Ending position of the chunk we need
   * @returns {string}  chunk of code extracted from the source code received
   * @private
   */
  function getChunk(source, start, end) {
    return source.slice(start, end)
  }

  /**
   * states text in the last text node, or creates a new one if needed.
   *
   * @param {ParserState}   state   - Current parser state
   * @param {number}  start   - Start position of the tag
   * @param {number}  end     - Ending position (last char of the tag)
   * @param {Object}  extra   - extra properties to add to the text node
   * @param {RawExpr[]} extra.expressions  - Found expressions
   * @param {string}    extra.unescape     - Brackets to unescape
   * @returns {undefined} - void function
   * @private
   */
  function pushText(state, start, end, extra = {}) {
    const text = getChunk(state.data, start, end);
    const expressions = extra.expressions;
    const unescape = extra.unescape;

    let q = state.last;
    state.pos = end;

    if (q && q.type === TEXT) {
      q.text += text;
      q.end = end;
    } else {
      flush(state);
      state.last = q = { type: TEXT, text, start, end };
    }

    if (expressions && expressions.length) {
      q.expressions = (q.expressions || []).concat(expressions);
    }

    if (unescape) {
      q.unescape = unescape;
    }

    return TEXT
  }

  /**
   * Find the end of the attribute value or text node
   * Extract expressions.
   * Detect if value have escaped brackets.
   *
   * @param   {ParserState} state  - Parser state
   * @param   {HasExpr} node       - Node if attr, info if text
   * @param   {string} endingChars - Ends the value or text
   * @param   {number} start       - Starting position
   * @returns {number} Ending position
   * @private
   */
  function expr(state, node, endingChars, start) {
    const re = b0re(state, endingChars);

    re.lastIndex = start; // reset re position

    const { unescape, expressions, end } = parseExpressions(state, re);

    if (node) {
      if (unescape) {
        node.unescape = unescape;
      }
      if (expressions.length) {
        node.expressions = expressions;
      }
    } else {
      pushText(state, start, end, { expressions, unescape });
    }

    return end
  }

  /**
   * Parse a text chunk finding all the expressions in it
   * @param   {ParserState} state  - Parser state
   * @param   {RegExp} re - regex to match the expressions contents
   * @returns {Object} result containing the expression found, the string to unescape and the end position
   */
  function parseExpressions(state, re) {
    const { data, options } = state;
    const { brackets } = options;
    const expressions = [];
    let unescape, pos, match;

    // Anything captured in $1 (closing quote or character) ends the loop...
    while ((match = re.exec(data)) && !match[1]) {
      // ...else, we have an opening bracket and maybe an expression.
      pos = match.index;
      if (data[pos - 1] === '\\') {
        unescape = match[0]; // it is an escaped opening brace
      } else {
        const tmpExpr = exprExtr(data, pos, brackets);
        if (tmpExpr) {
          expressions.push(tmpExpr);
          re.lastIndex = tmpExpr.end;
        }
      }
    }

    // Even for text, the parser needs match a closing char
    if (!match) {
      panic(data, unexpectedEndOfFile, pos);
    }

    return {
      unescape,
      expressions,
      end: match.index,
    }
  }

  /**
   * Creates a regex for the given string and the left bracket.
   * The string is captured in $1.
   *
   * @param   {ParserState} state  - Parser state
   * @param   {string} str - String to search
   * @returns {RegExp} Resulting regex.
   * @private
   */
  function b0re(state, str) {
    const { brackets } = state.options;
    const re = state.regexCache[str];

    if (re) return re

    const b0 = escapeStr(brackets[0]);
    // cache the regex extending the regexCache object
    Object.assign(state.regexCache, { [str]: new RegExp(`(${str})|${b0}`, 'g') });

    return state.regexCache[str]
  }

  // similar to _.uniq
  const uniq$1 = l => l.filter((x, i, a) => a.indexOf(x) === i);

  /**
   * SVG void elements that cannot be auto-closed and shouldn't contain child nodes.
   * @const {Array}
   */
  const VOID_SVG_TAGS_LIST$1 = [
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',
    'stop',
    'use'
  ];

  /**
   * List of html elements where the value attribute is allowed
   * @type {Array}
   */
  const HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_LIST$1 = [
    'button',
    'data',
    'input',
    'select',
    'li',
    'meter',
    'option',
    'output',
    'progress',
    'textarea',
    'param'
  ];

  /**
   * List of all the available svg tags
   * @const {Array}
   * @see {@link https://github.com/wooorm/svg-tag-names}
   */
  const SVG_TAGS_LIST$1 = uniq$1([
    'a',
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'animation',
    'audio',
    'canvas',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'discard',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feDropShadow',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'handler',
    'hatch',
    'hatchpath',
    'hkern',
    'iframe',
    'image',
    'linearGradient',
    'listener',
    'marker',
    'mask',
    'mesh',
    'meshgradient',
    'meshpatch',
    'meshrow',
    'metadata',
    'missing-glyph',
    'mpath',
    'pattern',
    'prefetch',
    'radialGradient',
    'script',
    'set',
    'solidColor',
    'solidcolor',
    'style',
    'svg',
    'switch',
    'symbol',
    'tbreak',
    'text',
    'textArea',
    'textPath',
    'title',
    'tref',
    'tspan',
    'unknown',
    'video',
    'view',
    'vkern'
  ].concat(VOID_SVG_TAGS_LIST$1)).sort();

  /**
   * HTML void elements that cannot be auto-closed and shouldn't contain child nodes.
   * @type {Array}
   * @see   {@link http://www.w3.org/TR/html-markup/syntax.html#syntax-elements}
   * @see   {@link http://www.w3.org/TR/html5/syntax.html#void-elements}
   */
  const VOID_HTML_TAGS_LIST$1 = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];

  /**
   * List of all the html tags
   * @const {Array}
   * @see {@link https://github.com/sindresorhus/html-tags}
   */
  const HTML_TAGS_LIST$1 = uniq$1([
    'a',
    'abbr',
    'address',
    'article',
    'aside',
    'audio',
    'b',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'canvas',
    'caption',
    'cite',
    'code',
    'colgroup',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'html',
    'i',
    'iframe',
    'ins',
    'kbd',
    'label',
    'legend',
    'main',
    'map',
    'mark',
    'math',
    'menu',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'p',
    'picture',
    'pre',
    'q',
    'rb',
    'rp',
    'rt',
    'rtc',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'slot',
    'small',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'tbody',
    'td',
    'template',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'u',
    'ul',
    'var',
    'video'
  ]
    .concat(VOID_HTML_TAGS_LIST$1)
    .concat(HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_LIST$1)
  ).sort();

  /**
   * List of all boolean HTML attributes
   * @const {RegExp}
   * @see {@link https://www.w3.org/TR/html5/infrastructure.html#sec-boolean-attributes}
   */
  const BOOLEAN_ATTRIBUTES_LIST$1 = [
    'disabled',
    'visible',
    'checked',
    'readonly',
    'required',
    'allowfullscreen',
    'autofocus',
    'autoplay',
    'compact',
    'controls',
    'default',
    'formnovalidate',
    'hidden',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'noresize',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'reversed',
    'seamless',
    'selected',
    'sortable',
    'truespeed',
    'typemustmatch'
  ];

  /**
   * Join a list of items with the pipe symbol (usefull for regex list concatenation)
   * @private
   * @param   {Array} list - list of strings
   * @returns {string} the list received joined with pipes
   */
  function joinWithPipe$1(list) {
    return list.join('|')
  }

  /**
   * Convert list of strings to regex in order to test against it ignoring the cases
   * @private
   * @param   {...Array} lists - array of strings
   * @returns {RegExp} regex that will match all the strings in the array received ignoring the cases
   */
  function listsToRegex$1(...lists) {
    return new RegExp(`^/?(?:${joinWithPipe$1(lists.map(joinWithPipe$1))})$`, 'i')
  }

  /**
   * Regex matching all the html tags ignoring the cases
   * @const {RegExp}
   */
  const HTML_TAGS_RE = listsToRegex$1(HTML_TAGS_LIST$1);

  /**
   * Regex matching all the svg tags ignoring the cases
   * @const {RegExp}
   */
  const SVG_TAGS_RE = listsToRegex$1(SVG_TAGS_LIST$1);

  /**
   * Regex matching all the void html tags ignoring the cases
   * @const {RegExp}
   */
  const VOID_HTML_TAGS_RE =  listsToRegex$1(VOID_HTML_TAGS_LIST$1);

  /**
   * Regex matching all the void svg tags ignoring the cases
   * @const {RegExp}
   */
  const VOID_SVG_TAGS_RE =  listsToRegex$1(VOID_SVG_TAGS_LIST$1);

  /**
   * Regex matching all the html tags where the value tag is allowed
   * @const {RegExp}
   */
  listsToRegex$1(HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_LIST$1);

  /**
   * Regex matching all the boolean attributes
   * @const {RegExp}
   */
  const BOOLEAN_ATTRIBUTES_RE =  listsToRegex$1(BOOLEAN_ATTRIBUTES_LIST$1);

  /**
   * True if it's a self closing tag
   * @param   {string}  tag - test tag
   * @returns {boolean} true if void
   * @example
   * isVoid('meta') // true
   * isVoid('circle') // true
   * isVoid('IMG') // true
   * isVoid('div') // false
   * isVoid('mask') // false
   */
  function isVoid(tag) {
    return [
      VOID_HTML_TAGS_RE,
      VOID_SVG_TAGS_RE
    ].some(r => r.test(tag))
  }

  /**
   * True if it's not SVG nor a HTML known tag
   * @param   {string}  tag - test tag
   * @returns {boolean} true if custom element
   * @example
   * isCustom('my-component') // true
   * isCustom('div') // false
   */
  function isCustom(tag) {
    return [
      HTML_TAGS_RE,
      SVG_TAGS_RE
    ].every(l => !l.test(tag))
  }

  /**
   * True if it's a boolean attribute
   * @param   {string} attribute - test attribute
   * @returns {boolean} true if the attribute is a boolean type
   * @example
   * isBoolAttribute('selected') // true
   * isBoolAttribute('class') // false
   */
  function isBoolAttribute(attribute) {
    return BOOLEAN_ATTRIBUTES_RE.test(attribute)
  }

  /**
   * Memoization function
   * @param   {Function} fn - function to memoize
   * @returns {*} return of the function to memoize
   */
  function memoize(fn) {
    const cache = new WeakMap();

    return (...args) => {
      if (cache.has(args[0])) return cache.get(args[0])

      const ret = fn(...args);

      cache.set(args[0], ret);

      return ret
    }
  }

  const expressionsContentRe = memoize((brackets) =>
    RegExp(`(${brackets[0]}[^${brackets[1]}]*?${brackets[1]})`, 'g'),
  );
  const isSpreadAttribute$1 = (name) => SPREAD_OPERATOR.test(name);
  const isAttributeExpression = (name, brackets) => name[0] === brackets[0];
  const getAttributeEnd = (state, attr) =>
    expr(state, attr, '[>/\\s]', attr.start);

  /**
   * The more complex parsing is for attributes as it can contain quoted or
   * unquoted values or expressions.
   *
   * @param   {ParserStore} state  - Parser state
   * @returns {number} New parser mode.
   * @private
   */
  function attr(state) {
    const { data, last, pos, root } = state;
    const tag = last; // the last (current) tag in the output
    const _CH = /\S/g; // matches the first non-space char
    const ch = execFromPos(_CH, pos, data);

    switch (true) {
      case !ch:
        state.pos = data.length; // reaching the end of the buffer with
        // NodeTypes.ATTR will generate error
        break
      case ch[0] === '>':
        // closing char found. If this is a self-closing tag with the name of the
        // Root tag, we need decrement the counter as we are changing mode.
        state.pos = tag.end = _CH.lastIndex;
        if (tag[IS_SELF_CLOSING]) {
          state.scryle = null; // allow selfClosing script/style tags
          if (root && root.name === tag.name) {
            state.count--; // "pop" root tag
          }
        }
        return TEXT
      case ch[0] === '/':
        state.pos = _CH.lastIndex; // maybe. delegate the validation
        tag[IS_SELF_CLOSING] = true; // the next loop
        break
      default:
        delete tag[IS_SELF_CLOSING]; // ensure unmark as selfclosing tag
        setAttribute(state, ch.index, tag);
    }

    return ATTR
  }

  /**
   * Parses an attribute and its expressions.
   *
   * @param   {ParserStore}  state  - Parser state
   * @param   {number} pos    - Starting position of the attribute
   * @param   {Object} tag    - Current parent tag
   * @returns {undefined} void function
   * @private
   */
  function setAttribute(state, pos, tag) {
    const { data } = state;
    const expressionContent = expressionsContentRe(state.options.brackets);
    const re = ATTR_START; // (\S[^>/=\s]*)(?:\s*=\s*([^>/])?)? g
    const start = (re.lastIndex = expressionContent.lastIndex = pos); // first non-whitespace
    const attrMatches = re.exec(data);
    const isExpressionName = isAttributeExpression(
      attrMatches[1],
      state.options.brackets,
    );
    const match = isExpressionName
      ? [null, expressionContent.exec(data)[1], null]
      : attrMatches;

    if (match) {
      const end = re.lastIndex;
      const attr = parseAttribute(state, match, start, end, isExpressionName);

      //assert(q && q.type === Mode.TAG, 'no previous tag for the attr!')
      // Pushes the attribute and shifts the `end` position of the tag (`last`).
      state.pos = tag.end = attr.end;
      tag.attributes = addToCollection(tag.attributes, attr);
    }
  }

  function parseNomalAttribute(state, attr, quote) {
    const { data } = state;
    let { end } = attr;

    if (isBoolAttribute(attr.name)) {
      attr[IS_BOOLEAN] = true;
    }

    // parse the whole value (if any) and get any expressions on it
    if (quote) {
      // Usually, the value's first char (`quote`) is a quote and the lastIndex
      // (`end`) is the start of the value.
      let valueStart = end;
      // If it not, this is an unquoted value and we need adjust the start.
      if (quote !== '"' && quote !== "'") {
        quote = ''; // first char of value is not a quote
        valueStart--; // adjust the starting position
      }

      end = expr(state, attr, quote || '[>/\\s]', valueStart);

      // adjust the bounds of the value and save its content
      return Object.assign(attr, {
        value: getChunk(data, valueStart, end),
        valueStart,
        end: quote ? ++end : end,
      })
    }

    return attr
  }

  /**
   * Parse expression names <a {href}>
   * @param   {ParserStore}  state  - Parser state
   * @param   {Object} attr - attribute object parsed
   * @returns {Object} normalized attribute object
   */
  function parseSpreadAttribute(state, attr) {
    const end = getAttributeEnd(state, attr);

    return {
      [IS_SPREAD]: true,
      start: attr.start,
      expressions: attr.expressions.map((expr) =>
        Object.assign(expr, {
          text: expr.text.replace(SPREAD_OPERATOR, '').trim(),
        }),
      ),
      end: end,
    }
  }

  /**
   * Parse expression names <a {href}>
   * @param   {ParserStore}  state  - Parser state
   * @param   {Object} attr - attribute object parsed
   * @returns {Object} normalized attribute object
   */
  function parseExpressionNameAttribute(state, attr) {
    const end = getAttributeEnd(state, attr);

    return {
      start: attr.start,
      name: attr.expressions[0].text.trim(),
      expressions: attr.expressions,
      end: end,
    }
  }

  /**
   * Parse the attribute values normalising the quotes
   * @param   {ParserStore}  state  - Parser state
   * @param   {Array} match - results of the attributes regex
   * @param   {number} start - attribute start position
   * @param   {number} end - attribute end position
   * @param   {boolean} isExpressionName - true if the attribute name is an expression
   * @returns {Object} attribute object
   */
  function parseAttribute(state, match, start, end, isExpressionName) {
    const attr = {
      name: match[1],
      value: '',
      start,
      end,
    };

    const quote = match[2]; // first letter of value or nothing

    switch (true) {
      case isSpreadAttribute$1(attr.name):
        return parseSpreadAttribute(state, attr)
      case isExpressionName === true:
        return parseExpressionNameAttribute(state, attr)
      default:
        return parseNomalAttribute(state, attr, quote)
    }
  }

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry$1(fn, ...acc) {
    return (...args) => {
      args = [...acc, ...args];

      return args.length < fn.length ?
        curry$1(fn, ...args) :
        fn(...args)
    }
  }

  /**
   * Parses comments in long or short form
   * (any DOCTYPE & CDATA blocks are parsed as comments).
   *
   * @param   {ParserState} state  - Parser state
   * @param   {string} data       - Buffer to parse
   * @param   {number} start      - Position of the '<!' sequence
   * @returns {number} node type id
   * @private
   */
  function comment(state, data, start) {
    const pos = start + 2; // skip '<!'
    const isLongComment = data.substr(pos, 2) === '--';
    const str = isLongComment ? '-->' : '>';
    const end = data.indexOf(str, pos);

    if (end < 0) {
      panic(data, unclosedComment, start);
    }

    pushComment(
      state,
      start,
      end + str.length,
      data.substring(start, end + str.length),
    );

    return TEXT
  }

  /**
   * Parse a comment.
   *
   * @param   {ParserState}  state - Current parser state
   * @param   {number}  start - Start position of the tag
   * @param   {number}  end   - Ending position (last char of the tag)
   * @param   {string}  text  - Comment content
   * @returns {undefined} void function
   * @private
   */
  function pushComment(state, start, end, text) {
    state.pos = end;
    if (state.options.comments === true) {
      flush(state);
      state.last = {
        type: COMMENT,
        start,
        end,
        text,
      };
    }
  }

  /**
   * Pushes a new *tag* and set `last` to this, so any attributes
   * will be included on this and shifts the `end`.
   *
   * @param   {ParserState} state  - Current parser state
   * @param   {string}  name      - Name of the node including any slash
   * @param   {number}  start     - Start position of the tag
   * @param   {number}  end       - Ending position (last char of the tag + 1)
   * @returns {undefined} - void function
   * @private
   */
  function pushTag(state, name, start, end) {
    const root = state.root;
    const last = { type: TAG, name, start, end };

    if (isCustom(name)) {
      last[IS_CUSTOM] = true;
    }

    if (isVoid(name)) {
      last[IS_VOID] = true;
    }

    state.pos = end;

    if (root) {
      if (name === root.name) {
        state.count++;
      } else if (name === root.close) {
        state.count--;
      }
      flush(state);
    } else {
      // start with root (keep ref to output)
      state.root = { name: last.name, close: `/${name}` };
      state.count = 1;
    }

    state.last = last;
  }

  /**
   * Parse the tag following a '<' character, or delegate to other parser
   * if an invalid tag name is found.
   *
   * @param   {ParserState} state  - Parser state
   * @returns {number} New parser mode
   * @private
   */
  function tag(state) {
    const { pos, data } = state; // pos of the char following '<'
    const start = pos - 1; // pos of '<'
    const str = data.substr(pos, 2); // first two chars following '<'

    switch (true) {
      case str[0] === '!':
        return comment(state, data, start)
      case TAG_2C.test(str):
        return parseTag(state, start)
      default:
        return pushText(state, start, pos) // pushes the '<' as text
    }
  }

  function parseTag(state, start) {
    const { data, pos } = state;
    const re = TAG_NAME; // (\/?[^\s>/]+)\s*(>)? g
    const match = execFromPos(re, pos, data);
    const end = re.lastIndex;
    const name = match[1].toLowerCase(); // $1: tag name including any '/'
    // script/style block is parsed as another tag to extract attributes
    if (name in RE_SCRYLE) {
      state.scryle = name; // used by parseText
    }

    pushTag(state, name, start, end);
    // only '>' can ends the tag here, the '/' is handled in parseAttribute
    if (!match[2]) {
      return ATTR
    }

    return TEXT
  }

  /**
   * Parses regular text and script/style blocks ...scryle for short :-)
   * (the content of script and style is text as well)
   *
   * @param   {ParserState} state - Parser state
   * @returns {number} New parser mode.
   * @private
   */
  function text(state) {
    const { pos, data, scryle } = state;

    switch (true) {
      case typeof scryle === 'string': {
        const name = scryle;
        const re = RE_SCRYLE[name];
        const match = execFromPos(re, pos, data);

        if (!match) {
          panic(data, unclosedNamedBlock.replace('%1', name), pos - 1);
        }

        const start = match.index;
        const end = re.lastIndex;
        state.scryle = null; // reset the script/style flag now
        // write the tag content
        if (start > pos) {
          parseSpecialTagsContent(state, name, match);
        } else if (name !== TEXTAREA_TAG) {
          state.last.text = {
            type: TEXT,
            text: '',
            start: pos,
            end: pos,
          };
        }
        // now the closing tag, either </script> or </style>
        pushTag(state, `/${name}`, start, end);
        break
      }
      case data[pos] === '<':
        state.pos++;
        return TAG
      default:
        expr(state, null, '<', pos);
    }

    return TEXT
  }

  /**
   * Parse the text content depending on the name
   * @param   {ParserState} state - Parser state
   * @param   {string} name  - one of the tags matched by the RE_SCRYLE regex
   * @param   {Array}  match - result of the regex matching the content of the parsed tag
   * @returns {undefined} void function
   */
  function parseSpecialTagsContent(state, name, match) {
    const { pos } = state;
    const start = match.index;

    if (name === TEXTAREA_TAG) {
      expr(state, null, match[0], pos);
    } else {
      pushText(state, pos, start);
    }
  }

  /*---------------------------------------------------------------------
   * Tree builder for the riot tag parser.
   *
   * The output has a root property and separate arrays for `html`, `css`,
   * and `js` tags.
   *
   * The root tag is included as first element in the `html` array.
   * Script tags marked with "defer" are included in `html` instead `js`.
   *
   * - Mark SVG tags
   * - Mark raw tags
   * - Mark void tags
   * - Split prefixes from expressions
   * - Unescape escaped brackets and escape EOLs and backslashes
   * - Compact whitespace (option `compact`) for non-raw tags
   * - Create an array `parts` for text nodes and attributes
   *
   * Throws on unclosed tags or closing tags without start tag.
   * Selfclosing and void tags has no nodes[] property.
   */

  /**
   * Escape the carriage return and the line feed from a string
   * @param   {string} string - input string
   * @returns {string} output string escaped
   */
  function escapeReturn(string) {
    return string.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
  }

  // check whether a tag has the 'src' attribute set like for example `<script src="">`
  const hasSrcAttribute = (node) =>
    (node.attributes || []).some((attr) => attr.name === 'src');

  /**
   * Escape double slashes in a string
   * @param   {string} string - input string
   * @returns {string} output string escaped
   */
  function escapeSlashes(string) {
    return string.replace(/\\/g, '\\\\')
  }

  /**
   * Replace the multiple spaces with only one
   * @param   {string} string - input string
   * @returns {string} string without trailing spaces
   */
  function cleanSpaces(string) {
    return string.replace(/\s+/g, ' ')
  }

  const TREE_BUILDER_STRUCT = Object.seal({
    get() {
      const store = this.store;
      // The real root tag is in store.root.nodes[0]
      return {
        [TEMPLATE_OUTPUT_NAME]: store.root.nodes[0],
        [CSS_OUTPUT_NAME]: store[STYLE_TAG],
        [JAVASCRIPT_OUTPUT_NAME]: store[JAVASCRIPT_TAG],
      }
    },

    /**
     * Process the current tag or text.
     * @param {Object} node - Raw pseudo-node from the parser
     * @returns {undefined} void function
     */
    push(node) {
      const store = this.store;

      switch (node.type) {
        case COMMENT:
          this.pushComment(store, node);
          break
        case TEXT:
          this.pushText(store, node);
          break
        case TAG: {
          const name = node.name;
          const closingTagChar = '/';
          const [firstChar] = name;

          if (firstChar === closingTagChar && !node.isVoid) {
            this.closeTag(store, node, name);
          } else if (firstChar !== closingTagChar) {
            this.openTag(store, node);
          }
          break
        }
      }
    },
    pushComment(store, node) {
      const parent = store.last;

      parent.nodes.push(node);
    },
    closeTag(store, node) {
      const last = store.scryle || store.last;

      last.end = node.end;

      // update always the root node end position
      if (store.root.nodes[0]) store.root.nodes[0].end = node.end;

      if (store.scryle) {
        store.scryle = null;
      } else {
        store.last = store.stack.pop();
      }
    },

    openTag(store, node) {
      const name = node.name;
      const attrs = node.attributes;
      const isCoreTag =
        (JAVASCRIPT_TAG === name && !hasSrcAttribute(node)) || name === STYLE_TAG;

      if (isCoreTag) {
        // Only accept one of each
        if (store[name]) {
          panic(
            this.store.data,
            duplicatedNamedTag.replace('%1', name),
            node.start,
          );
        }

        store[name] = node;
        store.scryle = store[name];
      } else {
        // store.last holds the last tag pushed in the stack and this are
        // non-void, non-empty tags, so we are sure the `lastTag` here
        // have a `nodes` property.
        const lastTag = store.last;
        const newNode = node;

        lastTag.nodes.push(newNode);

        if (lastTag[IS_RAW] || RAW_TAGS.test(name)) {
          node[IS_RAW] = true;
        }

        if (!node[IS_SELF_CLOSING] && !node[IS_VOID]) {
          store.stack.push(lastTag);
          newNode.nodes = [];
          store.last = newNode;
        }
      }

      if (attrs) {
        this.attrs(attrs);
      }
    },
    attrs(attributes) {
      attributes.forEach((attr) => {
        if (attr.value) {
          this.split(attr, attr.value, attr.valueStart, true);
        }
      });
    },
    pushText(store, node) {
      const text = node.text;
      const scryle = store.scryle;
      if (!scryle) {
        // store.last always have a nodes property
        const parent = store.last;

        const pack = this.compact && !parent[IS_RAW];
        const empty = !/\S/.test(text);
        if (pack && empty) {
          return
        }
        this.split(node, text, node.start, pack);
        parent.nodes.push(node);
      } else {
        scryle.text = node;
      }
    },
    split(node, source, start, pack) {
      const expressions = node.expressions;
      const parts = [];

      if (expressions) {
        let pos = 0;

        expressions.forEach((expr) => {
          const text = source.slice(pos, expr.start - start);
          const code = expr.text;
          parts.push(
            this.sanitise(node, text, pack),
            escapeReturn(escapeSlashes(code).trim()),
          );
          pos = expr.end - start;
        });

        if (pos < node.end) {
          parts.push(this.sanitise(node, source.slice(pos), pack));
        }
      } else {
        parts[0] = this.sanitise(node, source, pack);
      }

      node.parts = parts.filter((p) => p); // remove the empty strings
    },
    // unescape escaped brackets and split prefixes of expressions
    sanitise(node, text, pack) {
      let rep = node.unescape;
      if (rep) {
        let idx = 0;
        rep = `\\${rep}`;
        while ((idx = text.indexOf(rep, idx)) !== -1) {
          text = text.substr(0, idx) + text.substr(idx + 1);
          idx++;
        }
      }

      text = escapeSlashes(text);

      return pack ? cleanSpaces(text) : escapeReturn(text)
    },
  });

  function createTreeBuilder(data, options) {
    const root = {
      type: TAG,
      name: '',
      start: 0,
      end: 0,
      nodes: [],
    };

    return Object.assign(Object.create(TREE_BUILDER_STRUCT), {
      compact: options.compact !== false,
      store: {
        last: root,
        stack: [],
        scryle: null,
        root,
        style: null,
        script: null,
        data,
      },
    })
  }

  /**
   * Factory for the Parser class, exposing only the `parse` method.
   * The export adds the Parser class as property.
   *
   * @param   {Object}   options - User Options
   * @param   {Function} customBuilder - Tree builder factory
   * @returns {Function} Public Parser implementation.
   */
  function parser$1(options, customBuilder) {
    const state = curry$1(createParserState)(options, createTreeBuilder);
    return {
      parse: (data) => parse$1(state(data)),
    }
  }

  /**
   * Create a new state object
   * @param   {Object} userOptions - parser options
   * @param   {Function} builder - Tree builder factory
   * @param   {string} data - data to parse
   * @returns {ParserState} it represents the current parser state
   */
  function createParserState(userOptions, builder, data) {
    const options = Object.assign(
      {
        brackets: ['{', '}'],
        compact: true,
        comments: false,
      },
      userOptions,
    );

    return {
      options,
      regexCache: {},
      pos: 0,
      count: -1,
      root: null,
      last: null,
      scryle: null,
      builder: builder(data, options),
      data,
    }
  }

  /**
   * It creates a raw output of pseudo-nodes with one of three different types,
   * all of them having a start/end position:
   *
   * - TAG     -- Opening or closing tags
   * - TEXT    -- Raw text
   * - COMMENT -- Comments
   *
   * @param   {ParserState}  state - Current parser state
   * @returns {ParserResult} Result, contains data and output properties.
   */
  function parse$1(state) {
    const { data } = state;

    walk(state);
    flush(state);

    if (state.count) {
      panic(
        data,
        state.count > 0 ? unexpectedEndOfFile : rootTagNotFound,
        state.pos,
      );
    }

    return {
      data,
      output: state.builder.get(),
    }
  }

  /**
   * Parser walking recursive function
   * @param {ParserState}  state - Current parser state
   * @param {string} type - current parsing context
   * @returns {undefined} void function
   */
  function walk(state, type) {
    const { data } = state;
    // extend the state adding the tree builder instance and the initial data
    const length = data.length;

    // The "count" property is set to 1 when the first tag is found.
    // This becomes the root and precedent text or comments are discarded.
    // So, at the end of the parsing count must be zero.
    if (state.pos < length && state.count) {
      walk(state, eat(state, type));
    }
  }

  /**
   * Function to help iterating on the current parser state
   * @param {ParserState}  state - Current parser state
   * @param   {string} type - current parsing context
   * @returns {string} parsing context
   */
  function eat(state, type) {
    switch (type) {
      case TAG:
        return tag(state)
      case ATTR:
        return attr(state)
      default:
        return text(state)
    }
  }

  /**
   * Expose the internal constants
   */
  const constants = c;

  /**
   * The nodeTypes definition
   */
  const nodeTypes = types$2;

  const BINDING_TYPES = 'bindingTypes';
  const EACH_BINDING_TYPE = 'EACH';
  const IF_BINDING_TYPE = 'IF';
  const TAG_BINDING_TYPE = 'TAG';
  const SLOT_BINDING_TYPE = 'SLOT';

  const EXPRESSION_TYPES = 'expressionTypes';
  const ATTRIBUTE_EXPRESSION_TYPE = 'ATTRIBUTE';
  const VALUE_EXPRESSION_TYPE = 'VALUE';
  const REF_EXPRESSION_TYPE = 'REF';
  const TEXT_EXPRESSION_TYPE = 'TEXT';
  const EVENT_EXPRESSION_TYPE = 'EVENT';

  const TEMPLATE_FN = 'template';
  const SCOPE = '_scope';
  const GET_COMPONENT_FN = 'getComponent';

  // keys needed to create the DOM bindings
  const BINDING_SELECTOR_KEY = 'selector';
  const BINDING_GET_COMPONENT_KEY = 'getComponent';
  const BINDING_TEMPLATE_KEY = 'template';
  const BINDING_TYPE_KEY = 'type';
  const BINDING_REDUNDANT_ATTRIBUTE_KEY = 'redundantAttribute';
  const BINDING_CONDITION_KEY = 'condition';
  const BINDING_ITEM_NAME_KEY = 'itemName';
  const BINDING_GET_KEY_KEY = 'getKey';
  const BINDING_INDEX_NAME_KEY = 'indexName';
  const BINDING_EVALUATE_KEY = 'evaluate';
  const BINDING_NAME_KEY = 'name';
  const BINDING_SLOTS_KEY = 'slots';
  const BINDING_EXPRESSIONS_KEY = 'expressions';
  const BINDING_IS_BOOLEAN_ATTRIBUTE = 'isBoolean';
  const BINDING_CHILD_NODE_INDEX_KEY = 'childNodeIndex';
  // slots keys
  const BINDING_BINDINGS_KEY = 'bindings';
  const BINDING_ID_KEY = 'id';
  const BINDING_HTML_KEY = 'html';
  const BINDING_ATTRIBUTES_KEY = 'attributes';

  // DOM directives
  const IF_DIRECTIVE = 'if';
  const EACH_DIRECTIVE = 'each';
  const KEY_ATTRIBUTE = 'key';
  const SLOT_ATTRIBUTE = 'slot';
  const NAME_ATTRIBUTE = 'name';

  // Misc
  const DEFAULT_SLOT_NAME = 'default';
  const TEXT_NODE_EXPRESSION_PLACEHOLDER = ' ';
  const BINDING_SELECTOR_PREFIX = 'expr';
  const SLOT_TAG_NODE_NAME = 'slot';
  const PROGRESS_TAG_NODE_NAME = 'progress';
  const TEMPLATE_TAG_NODE_NAME = 'template';

  // Riot Parser constants
  constants.IS_RAW;
  const IS_VOID_NODE = constants.IS_VOID;
  const IS_CUSTOM_NODE = constants.IS_CUSTOM;
  const IS_BOOLEAN_ATTRIBUTE = constants.IS_BOOLEAN;
  const IS_SPREAD_ATTRIBUTE = constants.IS_SPREAD;

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function getAugmentedNamespace(n) {
    if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
    var f = n.default;
  	if (typeof f == "function") {
  		var a = function a () {
  			var isInstance = false;
        try {
          isInstance = this instanceof a;
        } catch {}
  			if (isInstance) {
          return Reflect.construct(f, arguments, this.constructor);
  			}
  			return f.apply(this, arguments);
  		};
  		a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  var main$1 = {};

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise, SuppressedError, Symbol */

  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };

  function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
  };

  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
  }

  function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
  }

  function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  }
  function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  }
  function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
  }
  function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
  }
  function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
  }

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
  }

  var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
  });

  function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
  }

  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
  }

  /** @deprecated */
  function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
  }

  /** @deprecated */
  function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
  }

  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  }

  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
  }

  function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
  }

  function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
  }

  function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
  }
  var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
    o["default"] = v;
  };

  function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  }

  function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
  }

  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  }

  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
  }

  function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
  }

  function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
      if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
      var dispose;
      if (async) {
          if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
          dispose = value[Symbol.asyncDispose];
      }
      if (dispose === void 0) {
          if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
          dispose = value[Symbol.dispose];
      }
      if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
      env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
      env.stack.push({ async: true });
    }
    return value;
  }

  var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  function __disposeResources(env) {
    function fail(e) {
      env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    function next() {
      while (env.stack.length) {
        var rec = env.stack.pop();
        try {
          var result = rec.dispose && rec.dispose.call(rec.value);
          if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        catch (e) {
            fail(e);
        }
      }
      if (env.hasError) throw env.error;
    }
    return next();
  }

  var tslib_es6 = {
    __extends,
    __assign,
    __rest,
    __decorate,
    __param,
    __metadata,
    __awaiter,
    __generator,
    __createBinding,
    __exportStar,
    __values,
    __read,
    __spread,
    __spreadArrays,
    __spreadArray,
    __await,
    __asyncGenerator,
    __asyncDelegator,
    __asyncValues,
    __makeTemplateObject,
    __importStar,
    __importDefault,
    __classPrivateFieldGet,
    __classPrivateFieldSet,
    __classPrivateFieldIn,
    __addDisposableResource,
    __disposeResources,
  };

  var tslib_es6$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __addDisposableResource: __addDisposableResource,
    get __assign () { return __assign; },
    __asyncDelegator: __asyncDelegator,
    __asyncGenerator: __asyncGenerator,
    __asyncValues: __asyncValues,
    __await: __await,
    __awaiter: __awaiter,
    __classPrivateFieldGet: __classPrivateFieldGet,
    __classPrivateFieldIn: __classPrivateFieldIn,
    __classPrivateFieldSet: __classPrivateFieldSet,
    __createBinding: __createBinding,
    __decorate: __decorate,
    __disposeResources: __disposeResources,
    __esDecorate: __esDecorate,
    __exportStar: __exportStar,
    __extends: __extends,
    __generator: __generator,
    __importDefault: __importDefault,
    __importStar: __importStar,
    __makeTemplateObject: __makeTemplateObject,
    __metadata: __metadata,
    __param: __param,
    __propKey: __propKey,
    __read: __read,
    __rest: __rest,
    __runInitializers: __runInitializers,
    __setFunctionName: __setFunctionName,
    __spread: __spread,
    __spreadArray: __spreadArray,
    __spreadArrays: __spreadArrays,
    __values: __values,
    default: tslib_es6
  });

  var require$$0 = /*@__PURE__*/getAugmentedNamespace(tslib_es6$1);

  var require$$1 = undefined;

  var main = {};

  var fork = {exports: {}};

  var types$1 = {exports: {}};

  var shared = {};

  var hasRequiredShared;

  function requireShared () {
  	if (hasRequiredShared) return shared;
  	hasRequiredShared = 1;
  	Object.defineProperty(shared, "__esModule", { value: true });
  	shared.maybeSetModuleExports = void 0;
  	var tslib_1 = require$$0;
  	var types_1 = tslib_1.__importDefault(requireTypes());
  	function default_1(fork) {
  	    var types = fork.use(types_1.default);
  	    var Type = types.Type;
  	    var builtin = types.builtInTypes;
  	    var isNumber = builtin.number;
  	    // An example of constructing a new type with arbitrary constraints from
  	    // an existing type.
  	    function geq(than) {
  	        return Type.from(function (value) { return isNumber.check(value) && value >= than; }, isNumber + " >= " + than);
  	    }
  	    // Default value-returning functions that may optionally be passed as a
  	    // third argument to Def.prototype.field.
  	    var defaults = {
  	        // Functions were used because (among other reasons) that's the most
  	        // elegant way to allow for the emptyArray one always to give a new
  	        // array instance.
  	        "null": function () { return null; },
  	        "emptyArray": function () { return []; },
  	        "false": function () { return false; },
  	        "true": function () { return true; },
  	        "undefined": function () { },
  	        "use strict": function () { return "use strict"; }
  	    };
  	    var naiveIsPrimitive = Type.or(builtin.string, builtin.number, builtin.boolean, builtin.null, builtin.undefined);
  	    var isPrimitive = Type.from(function (value) {
  	        if (value === null)
  	            return true;
  	        var type = typeof value;
  	        if (type === "object" ||
  	            type === "function") {
  	            return false;
  	        }
  	        return true;
  	    }, naiveIsPrimitive.toString());
  	    return {
  	        geq: geq,
  	        defaults: defaults,
  	        isPrimitive: isPrimitive,
  	    };
  	}
  	shared.default = default_1;
  	// This function accepts a getter function that should return an object
  	// conforming to the NodeModule interface above. Typically, this means calling
  	// maybeSetModuleExports(() => module) at the very end of any module that has a
  	// default export, so the default export value can replace module.exports and
  	// thus CommonJS consumers can continue to rely on require("./that/module")
  	// returning the default-exported value, rather than always returning an exports
  	// object with a default property equal to that value. This function should help
  	// preserve backwards compatibility for CommonJS consumers, as a replacement for
  	// the ts-add-module-exports package.
  	function maybeSetModuleExports(moduleGetter) {
  	    try {
  	        var nodeModule = moduleGetter();
  	        var originalExports = nodeModule.exports;
  	        var defaultExport = originalExports["default"];
  	    }
  	    catch (_a) {
  	        // It's normal/acceptable for this code to throw a ReferenceError due to
  	        // the moduleGetter function attempting to access a non-existent global
  	        // `module` variable. That's the reason we use a getter function here:
  	        // so the calling code doesn't have to do its own typeof module ===
  	        // "object" checking (because it's always safe to pass `() => module` as
  	        // an argument, even when `module` is not defined in the calling scope).
  	        return;
  	    }
  	    if (defaultExport &&
  	        defaultExport !== originalExports &&
  	        typeof originalExports === "object") {
  	        // Make all properties found in originalExports properties of the
  	        // default export, including the default property itself, so that
  	        // require(nodeModule.id).default === require(nodeModule.id).
  	        Object.assign(defaultExport, originalExports, { "default": defaultExport });
  	        // Object.assign only transfers enumerable properties, and
  	        // __esModule is (and should remain) non-enumerable.
  	        if (originalExports.__esModule) {
  	            Object.defineProperty(defaultExport, "__esModule", { value: true });
  	        }
  	        // This line allows require(nodeModule.id) === defaultExport, rather
  	        // than (only) require(nodeModule.id).default === defaultExport.
  	        nodeModule.exports = defaultExport;
  	    }
  	}
  	shared.maybeSetModuleExports = maybeSetModuleExports;
  	
  	return shared;
  }

  types$1.exports;

  var hasRequiredTypes;

  function requireTypes () {
  	if (hasRequiredTypes) return types$1.exports;
  	hasRequiredTypes = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		exports.Def = void 0;
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var Op = Object.prototype;
  		var objToStr = Op.toString;
  		var hasOwn = Op.hasOwnProperty;
  		var BaseType = /** @class */ (function () {
  		    function BaseType() {
  		    }
  		    BaseType.prototype.assert = function (value, deep) {
  		        if (!this.check(value, deep)) {
  		            var str = shallowStringify(value);
  		            throw new Error(str + " does not match type " + this);
  		        }
  		        return true;
  		    };
  		    BaseType.prototype.arrayOf = function () {
  		        var elemType = this;
  		        return new ArrayType(elemType);
  		    };
  		    return BaseType;
  		}());
  		var ArrayType = /** @class */ (function (_super) {
  		    tslib_1.__extends(ArrayType, _super);
  		    function ArrayType(elemType) {
  		        var _this = _super.call(this) || this;
  		        _this.elemType = elemType;
  		        _this.kind = "ArrayType";
  		        return _this;
  		    }
  		    ArrayType.prototype.toString = function () {
  		        return "[" + this.elemType + "]";
  		    };
  		    ArrayType.prototype.check = function (value, deep) {
  		        var _this = this;
  		        return Array.isArray(value) && value.every(function (elem) { return _this.elemType.check(elem, deep); });
  		    };
  		    return ArrayType;
  		}(BaseType));
  		var IdentityType = /** @class */ (function (_super) {
  		    tslib_1.__extends(IdentityType, _super);
  		    function IdentityType(value) {
  		        var _this = _super.call(this) || this;
  		        _this.value = value;
  		        _this.kind = "IdentityType";
  		        return _this;
  		    }
  		    IdentityType.prototype.toString = function () {
  		        return String(this.value);
  		    };
  		    IdentityType.prototype.check = function (value, deep) {
  		        var result = value === this.value;
  		        if (!result && typeof deep === "function") {
  		            deep(this, value);
  		        }
  		        return result;
  		    };
  		    return IdentityType;
  		}(BaseType));
  		var ObjectType = /** @class */ (function (_super) {
  		    tslib_1.__extends(ObjectType, _super);
  		    function ObjectType(fields) {
  		        var _this = _super.call(this) || this;
  		        _this.fields = fields;
  		        _this.kind = "ObjectType";
  		        return _this;
  		    }
  		    ObjectType.prototype.toString = function () {
  		        return "{ " + this.fields.join(", ") + " }";
  		    };
  		    ObjectType.prototype.check = function (value, deep) {
  		        return (objToStr.call(value) === objToStr.call({}) &&
  		            this.fields.every(function (field) {
  		                return field.type.check(value[field.name], deep);
  		            }));
  		    };
  		    return ObjectType;
  		}(BaseType));
  		var OrType = /** @class */ (function (_super) {
  		    tslib_1.__extends(OrType, _super);
  		    function OrType(types) {
  		        var _this = _super.call(this) || this;
  		        _this.types = types;
  		        _this.kind = "OrType";
  		        return _this;
  		    }
  		    OrType.prototype.toString = function () {
  		        return this.types.join(" | ");
  		    };
  		    OrType.prototype.check = function (value, deep) {
  		        if (this.types.some(function (type) { return type.check(value, !!deep); })) {
  		            return true;
  		        }
  		        if (typeof deep === "function") {
  		            deep(this, value);
  		        }
  		        return false;
  		    };
  		    return OrType;
  		}(BaseType));
  		var PredicateType = /** @class */ (function (_super) {
  		    tslib_1.__extends(PredicateType, _super);
  		    function PredicateType(name, predicate) {
  		        var _this = _super.call(this) || this;
  		        _this.name = name;
  		        _this.predicate = predicate;
  		        _this.kind = "PredicateType";
  		        return _this;
  		    }
  		    PredicateType.prototype.toString = function () {
  		        return this.name;
  		    };
  		    PredicateType.prototype.check = function (value, deep) {
  		        var result = this.predicate(value, deep);
  		        if (!result && typeof deep === "function") {
  		            deep(this, value);
  		        }
  		        return result;
  		    };
  		    return PredicateType;
  		}(BaseType));
  		var Def = /** @class */ (function () {
  		    function Def(type, typeName) {
  		        this.type = type;
  		        this.typeName = typeName;
  		        this.baseNames = [];
  		        this.ownFields = Object.create(null);
  		        // Includes own typeName. Populated during finalization.
  		        this.allSupertypes = Object.create(null);
  		        // Linear inheritance hierarchy. Populated during finalization.
  		        this.supertypeList = [];
  		        // Includes inherited fields.
  		        this.allFields = Object.create(null);
  		        // Non-hidden keys of allFields.
  		        this.fieldNames = [];
  		        // This property will be overridden as true by individual Def instances
  		        // when they are finalized.
  		        this.finalized = false;
  		        // False by default until .build(...) is called on an instance.
  		        this.buildable = false;
  		        this.buildParams = [];
  		    }
  		    Def.prototype.isSupertypeOf = function (that) {
  		        if (that instanceof Def) {
  		            if (this.finalized !== true ||
  		                that.finalized !== true) {
  		                throw new Error("");
  		            }
  		            return hasOwn.call(that.allSupertypes, this.typeName);
  		        }
  		        else {
  		            throw new Error(that + " is not a Def");
  		        }
  		    };
  		    Def.prototype.checkAllFields = function (value, deep) {
  		        var allFields = this.allFields;
  		        if (this.finalized !== true) {
  		            throw new Error("" + this.typeName);
  		        }
  		        function checkFieldByName(name) {
  		            var field = allFields[name];
  		            var type = field.type;
  		            var child = field.getValue(value);
  		            return type.check(child, deep);
  		        }
  		        return value !== null &&
  		            typeof value === "object" &&
  		            Object.keys(allFields).every(checkFieldByName);
  		    };
  		    Def.prototype.bases = function () {
  		        var supertypeNames = [];
  		        for (var _i = 0; _i < arguments.length; _i++) {
  		            supertypeNames[_i] = arguments[_i];
  		        }
  		        var bases = this.baseNames;
  		        if (this.finalized) {
  		            if (supertypeNames.length !== bases.length) {
  		                throw new Error("");
  		            }
  		            for (var i = 0; i < supertypeNames.length; i++) {
  		                if (supertypeNames[i] !== bases[i]) {
  		                    throw new Error("");
  		                }
  		            }
  		            return this;
  		        }
  		        supertypeNames.forEach(function (baseName) {
  		            // This indexOf lookup may be O(n), but the typical number of base
  		            // names is very small, and indexOf is a native Array method.
  		            if (bases.indexOf(baseName) < 0) {
  		                bases.push(baseName);
  		            }
  		        });
  		        return this; // For chaining.
  		    };
  		    return Def;
  		}());
  		exports.Def = Def;
  		var Field = /** @class */ (function () {
  		    function Field(name, type, defaultFn, hidden) {
  		        this.name = name;
  		        this.type = type;
  		        this.defaultFn = defaultFn;
  		        this.hidden = !!hidden;
  		    }
  		    Field.prototype.toString = function () {
  		        return JSON.stringify(this.name) + ": " + this.type;
  		    };
  		    Field.prototype.getValue = function (obj) {
  		        var value = obj[this.name];
  		        if (typeof value !== "undefined") {
  		            return value;
  		        }
  		        if (typeof this.defaultFn === "function") {
  		            value = this.defaultFn.call(obj);
  		        }
  		        return value;
  		    };
  		    return Field;
  		}());
  		function shallowStringify(value) {
  		    if (Array.isArray(value)) {
  		        return "[" + value.map(shallowStringify).join(", ") + "]";
  		    }
  		    if (value && typeof value === "object") {
  		        return "{ " + Object.keys(value).map(function (key) {
  		            return key + ": " + value[key];
  		        }).join(", ") + " }";
  		    }
  		    return JSON.stringify(value);
  		}
  		function typesPlugin(_fork) {
  		    var Type = {
  		        or: function () {
  		            var types = [];
  		            for (var _i = 0; _i < arguments.length; _i++) {
  		                types[_i] = arguments[_i];
  		            }
  		            return new OrType(types.map(function (type) { return Type.from(type); }));
  		        },
  		        from: function (value, name) {
  		            if (value instanceof ArrayType ||
  		                value instanceof IdentityType ||
  		                value instanceof ObjectType ||
  		                value instanceof OrType ||
  		                value instanceof PredicateType) {
  		                return value;
  		            }
  		            // The Def type is used as a helper for constructing compound
  		            // interface types for AST nodes.
  		            if (value instanceof Def) {
  		                return value.type;
  		            }
  		            // Support [ElemType] syntax.
  		            if (isArray.check(value)) {
  		                if (value.length !== 1) {
  		                    throw new Error("only one element type is permitted for typed arrays");
  		                }
  		                return new ArrayType(Type.from(value[0]));
  		            }
  		            // Support { someField: FieldType, ... } syntax.
  		            if (isObject.check(value)) {
  		                return new ObjectType(Object.keys(value).map(function (name) {
  		                    return new Field(name, Type.from(value[name], name));
  		                }));
  		            }
  		            if (typeof value === "function") {
  		                var bicfIndex = builtInCtorFns.indexOf(value);
  		                if (bicfIndex >= 0) {
  		                    return builtInCtorTypes[bicfIndex];
  		                }
  		                if (typeof name !== "string") {
  		                    throw new Error("missing name");
  		                }
  		                return new PredicateType(name, value);
  		            }
  		            // As a last resort, toType returns a type that matches any value that
  		            // is === from. This is primarily useful for literal values like
  		            // toType(null), but it has the additional advantage of allowing
  		            // toType to be a total function.
  		            return new IdentityType(value);
  		        },
  		        // Define a type whose name is registered in a namespace (the defCache) so
  		        // that future definitions will return the same type given the same name.
  		        // In particular, this system allows for circular and forward definitions.
  		        // The Def object d returned from Type.def may be used to configure the
  		        // type d.type by calling methods such as d.bases, d.build, and d.field.
  		        def: function (typeName) {
  		            return hasOwn.call(defCache, typeName)
  		                ? defCache[typeName]
  		                : defCache[typeName] = new DefImpl(typeName);
  		        },
  		        hasDef: function (typeName) {
  		            return hasOwn.call(defCache, typeName);
  		        }
  		    };
  		    var builtInCtorFns = [];
  		    var builtInCtorTypes = [];
  		    function defBuiltInType(name, example) {
  		        var objStr = objToStr.call(example);
  		        var type = new PredicateType(name, function (value) { return objToStr.call(value) === objStr; });
  		        if (example && typeof example.constructor === "function") {
  		            builtInCtorFns.push(example.constructor);
  		            builtInCtorTypes.push(type);
  		        }
  		        return type;
  		    }
  		    // These types check the underlying [[Class]] attribute of the given
  		    // value, rather than using the problematic typeof operator. Note however
  		    // that no subtyping is considered; so, for instance, isObject.check
  		    // returns false for [], /./, new Date, and null.
  		    var isString = defBuiltInType("string", "truthy");
  		    var isFunction = defBuiltInType("function", function () { });
  		    var isArray = defBuiltInType("array", []);
  		    var isObject = defBuiltInType("object", {});
  		    var isRegExp = defBuiltInType("RegExp", /./);
  		    var isDate = defBuiltInType("Date", new Date());
  		    var isNumber = defBuiltInType("number", 3);
  		    var isBoolean = defBuiltInType("boolean", true);
  		    var isNull = defBuiltInType("null", null);
  		    var isUndefined = defBuiltInType("undefined", undefined);
  		    var isBigInt = typeof BigInt === "function"
  		        ? defBuiltInType("BigInt", BigInt(1234))
  		        : new PredicateType("BigInt", function () { return false; });
  		    var builtInTypes = {
  		        string: isString,
  		        function: isFunction,
  		        array: isArray,
  		        object: isObject,
  		        RegExp: isRegExp,
  		        Date: isDate,
  		        number: isNumber,
  		        boolean: isBoolean,
  		        null: isNull,
  		        undefined: isUndefined,
  		        BigInt: isBigInt,
  		    };
  		    // In order to return the same Def instance every time Type.def is called
  		    // with a particular name, those instances need to be stored in a cache.
  		    var defCache = Object.create(null);
  		    function defFromValue(value) {
  		        if (value && typeof value === "object") {
  		            var type = value.type;
  		            if (typeof type === "string" &&
  		                hasOwn.call(defCache, type)) {
  		                var d = defCache[type];
  		                if (d.finalized) {
  		                    return d;
  		                }
  		            }
  		        }
  		        return null;
  		    }
  		    var DefImpl = /** @class */ (function (_super) {
  		        tslib_1.__extends(DefImpl, _super);
  		        function DefImpl(typeName) {
  		            var _this = _super.call(this, new PredicateType(typeName, function (value, deep) { return _this.check(value, deep); }), typeName) || this;
  		            return _this;
  		        }
  		        DefImpl.prototype.check = function (value, deep) {
  		            if (this.finalized !== true) {
  		                throw new Error("prematurely checking unfinalized type " + this.typeName);
  		            }
  		            // A Def type can only match an object value.
  		            if (value === null || typeof value !== "object") {
  		                return false;
  		            }
  		            var vDef = defFromValue(value);
  		            if (!vDef) {
  		                // If we couldn't infer the Def associated with the given value,
  		                // and we expected it to be a SourceLocation or a Position, it was
  		                // probably just missing a "type" field (because Esprima does not
  		                // assign a type property to such nodes). Be optimistic and let
  		                // this.checkAllFields make the final decision.
  		                if (this.typeName === "SourceLocation" ||
  		                    this.typeName === "Position") {
  		                    return this.checkAllFields(value, deep);
  		                }
  		                // Calling this.checkAllFields for any other type of node is both
  		                // bad for performance and way too forgiving.
  		                return false;
  		            }
  		            // If checking deeply and vDef === this, then we only need to call
  		            // checkAllFields once. Calling checkAllFields is too strict when deep
  		            // is false, because then we only care about this.isSupertypeOf(vDef).
  		            if (deep && vDef === this) {
  		                return this.checkAllFields(value, deep);
  		            }
  		            // In most cases we rely exclusively on isSupertypeOf to make O(1)
  		            // subtyping determinations. This suffices in most situations outside
  		            // of unit tests, since interface conformance is checked whenever new
  		            // instances are created using builder functions.
  		            if (!this.isSupertypeOf(vDef)) {
  		                return false;
  		            }
  		            // The exception is when deep is true; then, we recursively check all
  		            // fields.
  		            if (!deep) {
  		                return true;
  		            }
  		            // Use the more specific Def (vDef) to perform the deep check, but
  		            // shallow-check fields defined by the less specific Def (this).
  		            return vDef.checkAllFields(value, deep)
  		                && this.checkAllFields(value, false);
  		        };
  		        DefImpl.prototype.build = function () {
  		            var _this = this;
  		            var buildParams = [];
  		            for (var _i = 0; _i < arguments.length; _i++) {
  		                buildParams[_i] = arguments[_i];
  		            }
  		            // Calling Def.prototype.build multiple times has the effect of merely
  		            // redefining this property.
  		            this.buildParams = buildParams;
  		            if (this.buildable) {
  		                // If this Def is already buildable, update self.buildParams and
  		                // continue using the old builder function.
  		                return this;
  		            }
  		            // Every buildable type will have its "type" field filled in
  		            // automatically. This includes types that are not subtypes of Node,
  		            // like SourceLocation, but that seems harmless (TODO?).
  		            this.field("type", String, function () { return _this.typeName; });
  		            // Override Dp.buildable for this Def instance.
  		            this.buildable = true;
  		            var addParam = function (built, param, arg, isArgAvailable) {
  		                if (hasOwn.call(built, param))
  		                    return;
  		                var all = _this.allFields;
  		                if (!hasOwn.call(all, param)) {
  		                    throw new Error("" + param);
  		                }
  		                var field = all[param];
  		                var type = field.type;
  		                var value;
  		                if (isArgAvailable) {
  		                    value = arg;
  		                }
  		                else if (field.defaultFn) {
  		                    // Expose the partially-built object to the default
  		                    // function as its `this` object.
  		                    value = field.defaultFn.call(built);
  		                }
  		                else {
  		                    var message = "no value or default function given for field " +
  		                        JSON.stringify(param) + " of " + _this.typeName + "(" +
  		                        _this.buildParams.map(function (name) {
  		                            return all[name];
  		                        }).join(", ") + ")";
  		                    throw new Error(message);
  		                }
  		                if (!type.check(value)) {
  		                    throw new Error(shallowStringify(value) +
  		                        " does not match field " + field +
  		                        " of type " + _this.typeName);
  		                }
  		                built[param] = value;
  		            };
  		            // Calling the builder function will construct an instance of the Def,
  		            // with positional arguments mapped to the fields original passed to .build.
  		            // If not enough arguments are provided, the default value for the remaining fields
  		            // will be used.
  		            var builder = function () {
  		                var args = [];
  		                for (var _i = 0; _i < arguments.length; _i++) {
  		                    args[_i] = arguments[_i];
  		                }
  		                var argc = args.length;
  		                if (!_this.finalized) {
  		                    throw new Error("attempting to instantiate unfinalized type " +
  		                        _this.typeName);
  		                }
  		                var built = Object.create(nodePrototype);
  		                _this.buildParams.forEach(function (param, i) {
  		                    if (i < argc) {
  		                        addParam(built, param, args[i], true);
  		                    }
  		                    else {
  		                        addParam(built, param, null, false);
  		                    }
  		                });
  		                Object.keys(_this.allFields).forEach(function (param) {
  		                    // Use the default value.
  		                    addParam(built, param, null, false);
  		                });
  		                // Make sure that the "type" field was filled automatically.
  		                if (built.type !== _this.typeName) {
  		                    throw new Error("");
  		                }
  		                return built;
  		            };
  		            // Calling .from on the builder function will construct an instance of the Def,
  		            // using field values from the passed object. For fields missing from the passed object,
  		            // their default value will be used.
  		            builder.from = function (obj) {
  		                if (!_this.finalized) {
  		                    throw new Error("attempting to instantiate unfinalized type " +
  		                        _this.typeName);
  		                }
  		                var built = Object.create(nodePrototype);
  		                Object.keys(_this.allFields).forEach(function (param) {
  		                    if (hasOwn.call(obj, param)) {
  		                        addParam(built, param, obj[param], true);
  		                    }
  		                    else {
  		                        addParam(built, param, null, false);
  		                    }
  		                });
  		                // Make sure that the "type" field was filled automatically.
  		                if (built.type !== _this.typeName) {
  		                    throw new Error("");
  		                }
  		                return built;
  		            };
  		            Object.defineProperty(builders, getBuilderName(this.typeName), {
  		                enumerable: true,
  		                value: builder
  		            });
  		            return this;
  		        };
  		        // The reason fields are specified using .field(...) instead of an object
  		        // literal syntax is somewhat subtle: the object literal syntax would
  		        // support only one key and one value, but with .field(...) we can pass
  		        // any number of arguments to specify the field.
  		        DefImpl.prototype.field = function (name, type, defaultFn, hidden) {
  		            if (this.finalized) {
  		                console.error("Ignoring attempt to redefine field " +
  		                    JSON.stringify(name) + " of finalized type " +
  		                    JSON.stringify(this.typeName));
  		                return this;
  		            }
  		            this.ownFields[name] = new Field(name, Type.from(type), defaultFn, hidden);
  		            return this; // For chaining.
  		        };
  		        DefImpl.prototype.finalize = function () {
  		            var _this = this;
  		            // It's not an error to finalize a type more than once, but only the
  		            // first call to .finalize does anything.
  		            if (!this.finalized) {
  		                var allFields = this.allFields;
  		                var allSupertypes = this.allSupertypes;
  		                this.baseNames.forEach(function (name) {
  		                    var def = defCache[name];
  		                    if (def instanceof Def) {
  		                        def.finalize();
  		                        extend(allFields, def.allFields);
  		                        extend(allSupertypes, def.allSupertypes);
  		                    }
  		                    else {
  		                        var message = "unknown supertype name " +
  		                            JSON.stringify(name) +
  		                            " for subtype " +
  		                            JSON.stringify(_this.typeName);
  		                        throw new Error(message);
  		                    }
  		                });
  		                // TODO Warn if fields are overridden with incompatible types.
  		                extend(allFields, this.ownFields);
  		                allSupertypes[this.typeName] = this;
  		                this.fieldNames.length = 0;
  		                for (var fieldName in allFields) {
  		                    if (hasOwn.call(allFields, fieldName) &&
  		                        !allFields[fieldName].hidden) {
  		                        this.fieldNames.push(fieldName);
  		                    }
  		                }
  		                // Types are exported only once they have been finalized.
  		                Object.defineProperty(namedTypes, this.typeName, {
  		                    enumerable: true,
  		                    value: this.type
  		                });
  		                this.finalized = true;
  		                // A linearization of the inheritance hierarchy.
  		                populateSupertypeList(this.typeName, this.supertypeList);
  		                if (this.buildable &&
  		                    this.supertypeList.lastIndexOf("Expression") >= 0) {
  		                    wrapExpressionBuilderWithStatement(this.typeName);
  		                }
  		            }
  		        };
  		        return DefImpl;
  		    }(Def));
  		    // Note that the list returned by this function is a copy of the internal
  		    // supertypeList, *without* the typeName itself as the first element.
  		    function getSupertypeNames(typeName) {
  		        if (!hasOwn.call(defCache, typeName)) {
  		            throw new Error("");
  		        }
  		        var d = defCache[typeName];
  		        if (d.finalized !== true) {
  		            throw new Error("");
  		        }
  		        return d.supertypeList.slice(1);
  		    }
  		    // Returns an object mapping from every known type in the defCache to the
  		    // most specific supertype whose name is an own property of the candidates
  		    // object.
  		    function computeSupertypeLookupTable(candidates) {
  		        var table = {};
  		        var typeNames = Object.keys(defCache);
  		        var typeNameCount = typeNames.length;
  		        for (var i = 0; i < typeNameCount; ++i) {
  		            var typeName = typeNames[i];
  		            var d = defCache[typeName];
  		            if (d.finalized !== true) {
  		                throw new Error("" + typeName);
  		            }
  		            for (var j = 0; j < d.supertypeList.length; ++j) {
  		                var superTypeName = d.supertypeList[j];
  		                if (hasOwn.call(candidates, superTypeName)) {
  		                    table[typeName] = superTypeName;
  		                    break;
  		                }
  		            }
  		        }
  		        return table;
  		    }
  		    var builders = Object.create(null);
  		    // This object is used as prototype for any node created by a builder.
  		    var nodePrototype = {};
  		    // Call this function to define a new method to be shared by all AST
  		    // nodes. The replaced method (if any) is returned for easy wrapping.
  		    function defineMethod(name, func) {
  		        var old = nodePrototype[name];
  		        // Pass undefined as func to delete nodePrototype[name].
  		        if (isUndefined.check(func)) {
  		            delete nodePrototype[name];
  		        }
  		        else {
  		            isFunction.assert(func);
  		            Object.defineProperty(nodePrototype, name, {
  		                enumerable: true,
  		                configurable: true,
  		                value: func
  		            });
  		        }
  		        return old;
  		    }
  		    function getBuilderName(typeName) {
  		        return typeName.replace(/^[A-Z]+/, function (upperCasePrefix) {
  		            var len = upperCasePrefix.length;
  		            switch (len) {
  		                case 0: return "";
  		                // If there's only one initial capital letter, just lower-case it.
  		                case 1: return upperCasePrefix.toLowerCase();
  		                default:
  		                    // If there's more than one initial capital letter, lower-case
  		                    // all but the last one, so that XMLDefaultDeclaration (for
  		                    // example) becomes xmlDefaultDeclaration.
  		                    return upperCasePrefix.slice(0, len - 1).toLowerCase() +
  		                        upperCasePrefix.charAt(len - 1);
  		            }
  		        });
  		    }
  		    function getStatementBuilderName(typeName) {
  		        typeName = getBuilderName(typeName);
  		        return typeName.replace(/(Expression)?$/, "Statement");
  		    }
  		    var namedTypes = {};
  		    // Like Object.keys, but aware of what fields each AST type should have.
  		    function getFieldNames(object) {
  		        var d = defFromValue(object);
  		        if (d) {
  		            return d.fieldNames.slice(0);
  		        }
  		        if ("type" in object) {
  		            throw new Error("did not recognize object of type " +
  		                JSON.stringify(object.type));
  		        }
  		        return Object.keys(object);
  		    }
  		    // Get the value of an object property, taking object.type and default
  		    // functions into account.
  		    function getFieldValue(object, fieldName) {
  		        var d = defFromValue(object);
  		        if (d) {
  		            var field = d.allFields[fieldName];
  		            if (field) {
  		                return field.getValue(object);
  		            }
  		        }
  		        return object && object[fieldName];
  		    }
  		    // Iterate over all defined fields of an object, including those missing
  		    // or undefined, passing each field name and effective value (as returned
  		    // by getFieldValue) to the callback. If the object has no corresponding
  		    // Def, the callback will never be called.
  		    function eachField(object, callback, context) {
  		        getFieldNames(object).forEach(function (name) {
  		            callback.call(this, name, getFieldValue(object, name));
  		        }, context);
  		    }
  		    // Similar to eachField, except that iteration stops as soon as the
  		    // callback returns a truthy value. Like Array.prototype.some, the final
  		    // result is either true or false to indicates whether the callback
  		    // returned true for any element or not.
  		    function someField(object, callback, context) {
  		        return getFieldNames(object).some(function (name) {
  		            return callback.call(this, name, getFieldValue(object, name));
  		        }, context);
  		    }
  		    // Adds an additional builder for Expression subtypes
  		    // that wraps the built Expression in an ExpressionStatements.
  		    function wrapExpressionBuilderWithStatement(typeName) {
  		        var wrapperName = getStatementBuilderName(typeName);
  		        // skip if the builder already exists
  		        if (builders[wrapperName])
  		            return;
  		        // the builder function to wrap with builders.ExpressionStatement
  		        var wrapped = builders[getBuilderName(typeName)];
  		        // skip if there is nothing to wrap
  		        if (!wrapped)
  		            return;
  		        var builder = function () {
  		            var args = [];
  		            for (var _i = 0; _i < arguments.length; _i++) {
  		                args[_i] = arguments[_i];
  		            }
  		            return builders.expressionStatement(wrapped.apply(builders, args));
  		        };
  		        builder.from = function () {
  		            var args = [];
  		            for (var _i = 0; _i < arguments.length; _i++) {
  		                args[_i] = arguments[_i];
  		            }
  		            return builders.expressionStatement(wrapped.from.apply(builders, args));
  		        };
  		        builders[wrapperName] = builder;
  		    }
  		    function populateSupertypeList(typeName, list) {
  		        list.length = 0;
  		        list.push(typeName);
  		        var lastSeen = Object.create(null);
  		        for (var pos = 0; pos < list.length; ++pos) {
  		            typeName = list[pos];
  		            var d = defCache[typeName];
  		            if (d.finalized !== true) {
  		                throw new Error("");
  		            }
  		            // If we saw typeName earlier in the breadth-first traversal,
  		            // delete the last-seen occurrence.
  		            if (hasOwn.call(lastSeen, typeName)) {
  		                delete list[lastSeen[typeName]];
  		            }
  		            // Record the new index of the last-seen occurrence of typeName.
  		            lastSeen[typeName] = pos;
  		            // Enqueue the base names of this type.
  		            list.push.apply(list, d.baseNames);
  		        }
  		        // Compaction loop to remove array holes.
  		        for (var to = 0, from = to, len = list.length; from < len; ++from) {
  		            if (hasOwn.call(list, from)) {
  		                list[to++] = list[from];
  		            }
  		        }
  		        list.length = to;
  		    }
  		    function extend(into, from) {
  		        Object.keys(from).forEach(function (name) {
  		            into[name] = from[name];
  		        });
  		        return into;
  		    }
  		    function finalize() {
  		        Object.keys(defCache).forEach(function (name) {
  		            defCache[name].finalize();
  		        });
  		    }
  		    return {
  		        Type: Type,
  		        builtInTypes: builtInTypes,
  		        getSupertypeNames: getSupertypeNames,
  		        computeSupertypeLookupTable: computeSupertypeLookupTable,
  		        builders: builders,
  		        defineMethod: defineMethod,
  		        getBuilderName: getBuilderName,
  		        getStatementBuilderName: getStatementBuilderName,
  		        namedTypes: namedTypes,
  		        getFieldNames: getFieldNames,
  		        getFieldValue: getFieldValue,
  		        eachField: eachField,
  		        someField: someField,
  		        finalize: finalize,
  		    };
  		}
  		exports.default = typesPlugin;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (types$1, types$1.exports));
  	return types$1.exports;
  }

  var pathVisitor = {exports: {}};

  var nodePath = {exports: {}};

  var path = {exports: {}};

  path.exports;

  var hasRequiredPath;

  function requirePath () {
  	if (hasRequiredPath) return path.exports;
  	hasRequiredPath = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var Op = Object.prototype;
  		var hasOwn = Op.hasOwnProperty;
  		function pathPlugin(fork) {
  		    var types = fork.use(types_1.default);
  		    var isArray = types.builtInTypes.array;
  		    var isNumber = types.builtInTypes.number;
  		    var Path = function Path(value, parentPath, name) {
  		        if (!(this instanceof Path)) {
  		            throw new Error("Path constructor cannot be invoked without 'new'");
  		        }
  		        if (parentPath) {
  		            if (!(parentPath instanceof Path)) {
  		                throw new Error("");
  		            }
  		        }
  		        else {
  		            parentPath = null;
  		            name = null;
  		        }
  		        // The value encapsulated by this Path, generally equal to
  		        // parentPath.value[name] if we have a parentPath.
  		        this.value = value;
  		        // The immediate parent Path of this Path.
  		        this.parentPath = parentPath;
  		        // The name of the property of parentPath.value through which this
  		        // Path's value was reached.
  		        this.name = name;
  		        // Calling path.get("child") multiple times always returns the same
  		        // child Path object, for both performance and consistency reasons.
  		        this.__childCache = null;
  		    };
  		    var Pp = Path.prototype;
  		    function getChildCache(path) {
  		        // Lazily create the child cache. This also cheapens cache
  		        // invalidation, since you can just reset path.__childCache to null.
  		        return path.__childCache || (path.__childCache = Object.create(null));
  		    }
  		    function getChildPath(path, name) {
  		        var cache = getChildCache(path);
  		        var actualChildValue = path.getValueProperty(name);
  		        var childPath = cache[name];
  		        if (!hasOwn.call(cache, name) ||
  		            // Ensure consistency between cache and reality.
  		            childPath.value !== actualChildValue) {
  		            childPath = cache[name] = new path.constructor(actualChildValue, path, name);
  		        }
  		        return childPath;
  		    }
  		    // This method is designed to be overridden by subclasses that need to
  		    // handle missing properties, etc.
  		    Pp.getValueProperty = function getValueProperty(name) {
  		        return this.value[name];
  		    };
  		    Pp.get = function get() {
  		        var names = [];
  		        for (var _i = 0; _i < arguments.length; _i++) {
  		            names[_i] = arguments[_i];
  		        }
  		        var path = this;
  		        var count = names.length;
  		        for (var i = 0; i < count; ++i) {
  		            path = getChildPath(path, names[i]);
  		        }
  		        return path;
  		    };
  		    Pp.each = function each(callback, context) {
  		        var childPaths = [];
  		        var len = this.value.length;
  		        var i = 0;
  		        // Collect all the original child paths before invoking the callback.
  		        for (var i = 0; i < len; ++i) {
  		            if (hasOwn.call(this.value, i)) {
  		                childPaths[i] = this.get(i);
  		            }
  		        }
  		        // Invoke the callback on just the original child paths, regardless of
  		        // any modifications made to the array by the callback. I chose these
  		        // semantics over cleverly invoking the callback on new elements because
  		        // this way is much easier to reason about.
  		        context = context || this;
  		        for (i = 0; i < len; ++i) {
  		            if (hasOwn.call(childPaths, i)) {
  		                callback.call(context, childPaths[i]);
  		            }
  		        }
  		    };
  		    Pp.map = function map(callback, context) {
  		        var result = [];
  		        this.each(function (childPath) {
  		            result.push(callback.call(this, childPath));
  		        }, context);
  		        return result;
  		    };
  		    Pp.filter = function filter(callback, context) {
  		        var result = [];
  		        this.each(function (childPath) {
  		            if (callback.call(this, childPath)) {
  		                result.push(childPath);
  		            }
  		        }, context);
  		        return result;
  		    };
  		    function emptyMoves() { }
  		    function getMoves(path, offset, start, end) {
  		        isArray.assert(path.value);
  		        if (offset === 0) {
  		            return emptyMoves;
  		        }
  		        var length = path.value.length;
  		        if (length < 1) {
  		            return emptyMoves;
  		        }
  		        var argc = arguments.length;
  		        if (argc === 2) {
  		            start = 0;
  		            end = length;
  		        }
  		        else if (argc === 3) {
  		            start = Math.max(start, 0);
  		            end = length;
  		        }
  		        else {
  		            start = Math.max(start, 0);
  		            end = Math.min(end, length);
  		        }
  		        isNumber.assert(start);
  		        isNumber.assert(end);
  		        var moves = Object.create(null);
  		        var cache = getChildCache(path);
  		        for (var i = start; i < end; ++i) {
  		            if (hasOwn.call(path.value, i)) {
  		                var childPath = path.get(i);
  		                if (childPath.name !== i) {
  		                    throw new Error("");
  		                }
  		                var newIndex = i + offset;
  		                childPath.name = newIndex;
  		                moves[newIndex] = childPath;
  		                delete cache[i];
  		            }
  		        }
  		        delete cache.length;
  		        return function () {
  		            for (var newIndex in moves) {
  		                var childPath = moves[newIndex];
  		                if (childPath.name !== +newIndex) {
  		                    throw new Error("");
  		                }
  		                cache[newIndex] = childPath;
  		                path.value[newIndex] = childPath.value;
  		            }
  		        };
  		    }
  		    Pp.shift = function shift() {
  		        var move = getMoves(this, -1);
  		        var result = this.value.shift();
  		        move();
  		        return result;
  		    };
  		    Pp.unshift = function unshift() {
  		        var args = [];
  		        for (var _i = 0; _i < arguments.length; _i++) {
  		            args[_i] = arguments[_i];
  		        }
  		        var move = getMoves(this, args.length);
  		        var result = this.value.unshift.apply(this.value, args);
  		        move();
  		        return result;
  		    };
  		    Pp.push = function push() {
  		        var args = [];
  		        for (var _i = 0; _i < arguments.length; _i++) {
  		            args[_i] = arguments[_i];
  		        }
  		        isArray.assert(this.value);
  		        delete getChildCache(this).length;
  		        return this.value.push.apply(this.value, args);
  		    };
  		    Pp.pop = function pop() {
  		        isArray.assert(this.value);
  		        var cache = getChildCache(this);
  		        delete cache[this.value.length - 1];
  		        delete cache.length;
  		        return this.value.pop();
  		    };
  		    Pp.insertAt = function insertAt(index) {
  		        var argc = arguments.length;
  		        var move = getMoves(this, argc - 1, index);
  		        if (move === emptyMoves && argc <= 1) {
  		            return this;
  		        }
  		        index = Math.max(index, 0);
  		        for (var i = 1; i < argc; ++i) {
  		            this.value[index + i - 1] = arguments[i];
  		        }
  		        move();
  		        return this;
  		    };
  		    Pp.insertBefore = function insertBefore() {
  		        var args = [];
  		        for (var _i = 0; _i < arguments.length; _i++) {
  		            args[_i] = arguments[_i];
  		        }
  		        var pp = this.parentPath;
  		        var argc = args.length;
  		        var insertAtArgs = [this.name];
  		        for (var i = 0; i < argc; ++i) {
  		            insertAtArgs.push(args[i]);
  		        }
  		        return pp.insertAt.apply(pp, insertAtArgs);
  		    };
  		    Pp.insertAfter = function insertAfter() {
  		        var args = [];
  		        for (var _i = 0; _i < arguments.length; _i++) {
  		            args[_i] = arguments[_i];
  		        }
  		        var pp = this.parentPath;
  		        var argc = args.length;
  		        var insertAtArgs = [this.name + 1];
  		        for (var i = 0; i < argc; ++i) {
  		            insertAtArgs.push(args[i]);
  		        }
  		        return pp.insertAt.apply(pp, insertAtArgs);
  		    };
  		    function repairRelationshipWithParent(path) {
  		        if (!(path instanceof Path)) {
  		            throw new Error("");
  		        }
  		        var pp = path.parentPath;
  		        if (!pp) {
  		            // Orphan paths have no relationship to repair.
  		            return path;
  		        }
  		        var parentValue = pp.value;
  		        var parentCache = getChildCache(pp);
  		        // Make sure parentCache[path.name] is populated.
  		        if (parentValue[path.name] === path.value) {
  		            parentCache[path.name] = path;
  		        }
  		        else if (isArray.check(parentValue)) {
  		            // Something caused path.name to become out of date, so attempt to
  		            // recover by searching for path.value in parentValue.
  		            var i = parentValue.indexOf(path.value);
  		            if (i >= 0) {
  		                parentCache[path.name = i] = path;
  		            }
  		        }
  		        else {
  		            // If path.value disagrees with parentValue[path.name], and
  		            // path.name is not an array index, let path.value become the new
  		            // parentValue[path.name] and update parentCache accordingly.
  		            parentValue[path.name] = path.value;
  		            parentCache[path.name] = path;
  		        }
  		        if (parentValue[path.name] !== path.value) {
  		            throw new Error("");
  		        }
  		        if (path.parentPath.get(path.name) !== path) {
  		            throw new Error("");
  		        }
  		        return path;
  		    }
  		    Pp.replace = function replace(replacement) {
  		        var results = [];
  		        var parentValue = this.parentPath.value;
  		        var parentCache = getChildCache(this.parentPath);
  		        var count = arguments.length;
  		        repairRelationshipWithParent(this);
  		        if (isArray.check(parentValue)) {
  		            var originalLength = parentValue.length;
  		            var move = getMoves(this.parentPath, count - 1, this.name + 1);
  		            var spliceArgs = [this.name, 1];
  		            for (var i = 0; i < count; ++i) {
  		                spliceArgs.push(arguments[i]);
  		            }
  		            var splicedOut = parentValue.splice.apply(parentValue, spliceArgs);
  		            if (splicedOut[0] !== this.value) {
  		                throw new Error("");
  		            }
  		            if (parentValue.length !== (originalLength - 1 + count)) {
  		                throw new Error("");
  		            }
  		            move();
  		            if (count === 0) {
  		                delete this.value;
  		                delete parentCache[this.name];
  		                this.__childCache = null;
  		            }
  		            else {
  		                if (parentValue[this.name] !== replacement) {
  		                    throw new Error("");
  		                }
  		                if (this.value !== replacement) {
  		                    this.value = replacement;
  		                    this.__childCache = null;
  		                }
  		                for (i = 0; i < count; ++i) {
  		                    results.push(this.parentPath.get(this.name + i));
  		                }
  		                if (results[0] !== this) {
  		                    throw new Error("");
  		                }
  		            }
  		        }
  		        else if (count === 1) {
  		            if (this.value !== replacement) {
  		                this.__childCache = null;
  		            }
  		            this.value = parentValue[this.name] = replacement;
  		            results.push(this);
  		        }
  		        else if (count === 0) {
  		            delete parentValue[this.name];
  		            delete this.value;
  		            this.__childCache = null;
  		            // Leave this path cached as parentCache[this.name], even though
  		            // it no longer has a value defined.
  		        }
  		        else {
  		            throw new Error("Could not replace path");
  		        }
  		        return results;
  		    };
  		    return Path;
  		}
  		exports.default = pathPlugin;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (path, path.exports));
  	return path.exports;
  }

  var scope$1 = {exports: {}};

  scope$1.exports;

  var hasRequiredScope;

  function requireScope () {
  	if (hasRequiredScope) return scope$1.exports;
  	hasRequiredScope = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var hasOwn = Object.prototype.hasOwnProperty;
  		function scopePlugin(fork) {
  		    var types = fork.use(types_1.default);
  		    var Type = types.Type;
  		    var namedTypes = types.namedTypes;
  		    var Node = namedTypes.Node;
  		    var Expression = namedTypes.Expression;
  		    var isArray = types.builtInTypes.array;
  		    var b = types.builders;
  		    var Scope = function Scope(path, parentScope) {
  		        if (!(this instanceof Scope)) {
  		            throw new Error("Scope constructor cannot be invoked without 'new'");
  		        }
  		        if (!TypeParameterScopeType.check(path.value)) {
  		            ScopeType.assert(path.value);
  		        }
  		        var depth;
  		        if (parentScope) {
  		            if (!(parentScope instanceof Scope)) {
  		                throw new Error("");
  		            }
  		            depth = parentScope.depth + 1;
  		        }
  		        else {
  		            parentScope = null;
  		            depth = 0;
  		        }
  		        Object.defineProperties(this, {
  		            path: { value: path },
  		            node: { value: path.value },
  		            isGlobal: { value: !parentScope, enumerable: true },
  		            depth: { value: depth },
  		            parent: { value: parentScope },
  		            bindings: { value: {} },
  		            types: { value: {} },
  		        });
  		    };
  		    var ScopeType = Type.or(
  		    // Program nodes introduce global scopes.
  		    namedTypes.Program, 
  		    // Function is the supertype of FunctionExpression,
  		    // FunctionDeclaration, ArrowExpression, etc.
  		    namedTypes.Function, 
  		    // In case you didn't know, the caught parameter shadows any variable
  		    // of the same name in an outer scope.
  		    namedTypes.CatchClause);
  		    // These types introduce scopes that are restricted to type parameters in
  		    // Flow (this doesn't apply to ECMAScript).
  		    var TypeParameterScopeType = Type.or(namedTypes.Function, namedTypes.ClassDeclaration, namedTypes.ClassExpression, namedTypes.InterfaceDeclaration, namedTypes.TSInterfaceDeclaration, namedTypes.TypeAlias, namedTypes.TSTypeAliasDeclaration);
  		    var FlowOrTSTypeParameterType = Type.or(namedTypes.TypeParameter, namedTypes.TSTypeParameter);
  		    Scope.isEstablishedBy = function (node) {
  		        return ScopeType.check(node) || TypeParameterScopeType.check(node);
  		    };
  		    var Sp = Scope.prototype;
  		    // Will be overridden after an instance lazily calls scanScope.
  		    Sp.didScan = false;
  		    Sp.declares = function (name) {
  		        this.scan();
  		        return hasOwn.call(this.bindings, name);
  		    };
  		    Sp.declaresType = function (name) {
  		        this.scan();
  		        return hasOwn.call(this.types, name);
  		    };
  		    Sp.declareTemporary = function (prefix) {
  		        if (prefix) {
  		            if (!/^[a-z$_]/i.test(prefix)) {
  		                throw new Error("");
  		            }
  		        }
  		        else {
  		            prefix = "t$";
  		        }
  		        // Include this.depth in the name to make sure the name does not
  		        // collide with any variables in nested/enclosing scopes.
  		        prefix += this.depth.toString(36) + "$";
  		        this.scan();
  		        var index = 0;
  		        while (this.declares(prefix + index)) {
  		            ++index;
  		        }
  		        var name = prefix + index;
  		        return this.bindings[name] = types.builders.identifier(name);
  		    };
  		    Sp.injectTemporary = function (identifier, init) {
  		        identifier || (identifier = this.declareTemporary());
  		        var bodyPath = this.path.get("body");
  		        if (namedTypes.BlockStatement.check(bodyPath.value)) {
  		            bodyPath = bodyPath.get("body");
  		        }
  		        bodyPath.unshift(b.variableDeclaration("var", [b.variableDeclarator(identifier, init || null)]));
  		        return identifier;
  		    };
  		    Sp.scan = function (force) {
  		        if (force || !this.didScan) {
  		            for (var name in this.bindings) {
  		                // Empty out this.bindings, just in cases.
  		                delete this.bindings[name];
  		            }
  		            for (var name in this.types) {
  		                // Empty out this.types, just in cases.
  		                delete this.types[name];
  		            }
  		            scanScope(this.path, this.bindings, this.types);
  		            this.didScan = true;
  		        }
  		    };
  		    Sp.getBindings = function () {
  		        this.scan();
  		        return this.bindings;
  		    };
  		    Sp.getTypes = function () {
  		        this.scan();
  		        return this.types;
  		    };
  		    function scanScope(path, bindings, scopeTypes) {
  		        var node = path.value;
  		        if (TypeParameterScopeType.check(node)) {
  		            var params = path.get('typeParameters', 'params');
  		            if (isArray.check(params.value)) {
  		                params.each(function (childPath) {
  		                    addTypeParameter(childPath, scopeTypes);
  		                });
  		            }
  		        }
  		        if (ScopeType.check(node)) {
  		            if (namedTypes.CatchClause.check(node)) {
  		                // A catch clause establishes a new scope but the only variable
  		                // bound in that scope is the catch parameter. Any other
  		                // declarations create bindings in the outer scope.
  		                addPattern(path.get("param"), bindings);
  		            }
  		            else {
  		                recursiveScanScope(path, bindings, scopeTypes);
  		            }
  		        }
  		    }
  		    function recursiveScanScope(path, bindings, scopeTypes) {
  		        var node = path.value;
  		        if (path.parent &&
  		            namedTypes.FunctionExpression.check(path.parent.node) &&
  		            path.parent.node.id) {
  		            addPattern(path.parent.get("id"), bindings);
  		        }
  		        if (!node) ;
  		        else if (isArray.check(node)) {
  		            path.each(function (childPath) {
  		                recursiveScanChild(childPath, bindings, scopeTypes);
  		            });
  		        }
  		        else if (namedTypes.Function.check(node)) {
  		            path.get("params").each(function (paramPath) {
  		                addPattern(paramPath, bindings);
  		            });
  		            recursiveScanChild(path.get("body"), bindings, scopeTypes);
  		            recursiveScanScope(path.get("typeParameters"), bindings, scopeTypes);
  		        }
  		        else if ((namedTypes.TypeAlias && namedTypes.TypeAlias.check(node)) ||
  		            (namedTypes.InterfaceDeclaration && namedTypes.InterfaceDeclaration.check(node)) ||
  		            (namedTypes.TSTypeAliasDeclaration && namedTypes.TSTypeAliasDeclaration.check(node)) ||
  		            (namedTypes.TSInterfaceDeclaration && namedTypes.TSInterfaceDeclaration.check(node))) {
  		            addTypePattern(path.get("id"), scopeTypes);
  		        }
  		        else if (namedTypes.VariableDeclarator.check(node)) {
  		            addPattern(path.get("id"), bindings);
  		            recursiveScanChild(path.get("init"), bindings, scopeTypes);
  		        }
  		        else if (node.type === "ImportSpecifier" ||
  		            node.type === "ImportNamespaceSpecifier" ||
  		            node.type === "ImportDefaultSpecifier") {
  		            addPattern(
  		            // Esprima used to use the .name field to refer to the local
  		            // binding identifier for ImportSpecifier nodes, but .id for
  		            // ImportNamespaceSpecifier and ImportDefaultSpecifier nodes.
  		            // ESTree/Acorn/ESpree use .local for all three node types.
  		            path.get(node.local ? "local" :
  		                node.name ? "name" : "id"), bindings);
  		        }
  		        else if (Node.check(node) && !Expression.check(node)) {
  		            types.eachField(node, function (name, child) {
  		                var childPath = path.get(name);
  		                if (!pathHasValue(childPath, child)) {
  		                    throw new Error("");
  		                }
  		                recursiveScanChild(childPath, bindings, scopeTypes);
  		            });
  		        }
  		    }
  		    function pathHasValue(path, value) {
  		        if (path.value === value) {
  		            return true;
  		        }
  		        // Empty arrays are probably produced by defaults.emptyArray, in which
  		        // case is makes sense to regard them as equivalent, if not ===.
  		        if (Array.isArray(path.value) &&
  		            path.value.length === 0 &&
  		            Array.isArray(value) &&
  		            value.length === 0) {
  		            return true;
  		        }
  		        return false;
  		    }
  		    function recursiveScanChild(path, bindings, scopeTypes) {
  		        var node = path.value;
  		        if (!node || Expression.check(node)) ;
  		        else if (namedTypes.FunctionDeclaration.check(node) &&
  		            node.id !== null) {
  		            addPattern(path.get("id"), bindings);
  		        }
  		        else if (namedTypes.ClassDeclaration &&
  		            namedTypes.ClassDeclaration.check(node) &&
  		            node.id !== null) {
  		            addPattern(path.get("id"), bindings);
  		            recursiveScanScope(path.get("typeParameters"), bindings, scopeTypes);
  		        }
  		        else if ((namedTypes.InterfaceDeclaration &&
  		            namedTypes.InterfaceDeclaration.check(node)) ||
  		            (namedTypes.TSInterfaceDeclaration &&
  		                namedTypes.TSInterfaceDeclaration.check(node))) {
  		            addTypePattern(path.get("id"), scopeTypes);
  		        }
  		        else if (ScopeType.check(node)) {
  		            if (namedTypes.CatchClause.check(node) &&
  		                // TODO Broaden this to accept any pattern.
  		                namedTypes.Identifier.check(node.param)) {
  		                var catchParamName = node.param.name;
  		                var hadBinding = hasOwn.call(bindings, catchParamName);
  		                // Any declarations that occur inside the catch body that do
  		                // not have the same name as the catch parameter should count
  		                // as bindings in the outer scope.
  		                recursiveScanScope(path.get("body"), bindings, scopeTypes);
  		                // If a new binding matching the catch parameter name was
  		                // created while scanning the catch body, ignore it because it
  		                // actually refers to the catch parameter and not the outer
  		                // scope that we're currently scanning.
  		                if (!hadBinding) {
  		                    delete bindings[catchParamName];
  		                }
  		            }
  		        }
  		        else {
  		            recursiveScanScope(path, bindings, scopeTypes);
  		        }
  		    }
  		    function addPattern(patternPath, bindings) {
  		        var pattern = patternPath.value;
  		        namedTypes.Pattern.assert(pattern);
  		        if (namedTypes.Identifier.check(pattern)) {
  		            if (hasOwn.call(bindings, pattern.name)) {
  		                bindings[pattern.name].push(patternPath);
  		            }
  		            else {
  		                bindings[pattern.name] = [patternPath];
  		            }
  		        }
  		        else if (namedTypes.AssignmentPattern &&
  		            namedTypes.AssignmentPattern.check(pattern)) {
  		            addPattern(patternPath.get('left'), bindings);
  		        }
  		        else if (namedTypes.ObjectPattern &&
  		            namedTypes.ObjectPattern.check(pattern)) {
  		            patternPath.get('properties').each(function (propertyPath) {
  		                var property = propertyPath.value;
  		                if (namedTypes.Pattern.check(property)) {
  		                    addPattern(propertyPath, bindings);
  		                }
  		                else if (namedTypes.Property.check(property) ||
  		                    (namedTypes.ObjectProperty &&
  		                        namedTypes.ObjectProperty.check(property))) {
  		                    addPattern(propertyPath.get('value'), bindings);
  		                }
  		                else if (namedTypes.SpreadProperty &&
  		                    namedTypes.SpreadProperty.check(property)) {
  		                    addPattern(propertyPath.get('argument'), bindings);
  		                }
  		            });
  		        }
  		        else if (namedTypes.ArrayPattern &&
  		            namedTypes.ArrayPattern.check(pattern)) {
  		            patternPath.get('elements').each(function (elementPath) {
  		                var element = elementPath.value;
  		                if (namedTypes.Pattern.check(element)) {
  		                    addPattern(elementPath, bindings);
  		                }
  		                else if (namedTypes.SpreadElement &&
  		                    namedTypes.SpreadElement.check(element)) {
  		                    addPattern(elementPath.get("argument"), bindings);
  		                }
  		            });
  		        }
  		        else if (namedTypes.PropertyPattern &&
  		            namedTypes.PropertyPattern.check(pattern)) {
  		            addPattern(patternPath.get('pattern'), bindings);
  		        }
  		        else if ((namedTypes.SpreadElementPattern &&
  		            namedTypes.SpreadElementPattern.check(pattern)) ||
  		            (namedTypes.RestElement &&
  		                namedTypes.RestElement.check(pattern)) ||
  		            (namedTypes.SpreadPropertyPattern &&
  		                namedTypes.SpreadPropertyPattern.check(pattern))) {
  		            addPattern(patternPath.get('argument'), bindings);
  		        }
  		    }
  		    function addTypePattern(patternPath, types) {
  		        var pattern = patternPath.value;
  		        namedTypes.Pattern.assert(pattern);
  		        if (namedTypes.Identifier.check(pattern)) {
  		            if (hasOwn.call(types, pattern.name)) {
  		                types[pattern.name].push(patternPath);
  		            }
  		            else {
  		                types[pattern.name] = [patternPath];
  		            }
  		        }
  		    }
  		    function addTypeParameter(parameterPath, types) {
  		        var parameter = parameterPath.value;
  		        FlowOrTSTypeParameterType.assert(parameter);
  		        if (hasOwn.call(types, parameter.name)) {
  		            types[parameter.name].push(parameterPath);
  		        }
  		        else {
  		            types[parameter.name] = [parameterPath];
  		        }
  		    }
  		    Sp.lookup = function (name) {
  		        for (var scope = this; scope; scope = scope.parent)
  		            if (scope.declares(name))
  		                break;
  		        return scope;
  		    };
  		    Sp.lookupType = function (name) {
  		        for (var scope = this; scope; scope = scope.parent)
  		            if (scope.declaresType(name))
  		                break;
  		        return scope;
  		    };
  		    Sp.getGlobalScope = function () {
  		        var scope = this;
  		        while (!scope.isGlobal)
  		            scope = scope.parent;
  		        return scope;
  		    };
  		    return Scope;
  		}
  		exports.default = scopePlugin;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (scope$1, scope$1.exports));
  	return scope$1.exports;
  }

  nodePath.exports;

  var hasRequiredNodePath;

  function requireNodePath () {
  	if (hasRequiredNodePath) return nodePath.exports;
  	hasRequiredNodePath = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var path_1 = tslib_1.__importDefault(requirePath());
  		var scope_1 = tslib_1.__importDefault(requireScope());
  		var shared_1 = requireShared();
  		function nodePathPlugin(fork) {
  		    var types = fork.use(types_1.default);
  		    var n = types.namedTypes;
  		    var b = types.builders;
  		    var isNumber = types.builtInTypes.number;
  		    var isArray = types.builtInTypes.array;
  		    var Path = fork.use(path_1.default);
  		    var Scope = fork.use(scope_1.default);
  		    var NodePath = function NodePath(value, parentPath, name) {
  		        if (!(this instanceof NodePath)) {
  		            throw new Error("NodePath constructor cannot be invoked without 'new'");
  		        }
  		        Path.call(this, value, parentPath, name);
  		    };
  		    var NPp = NodePath.prototype = Object.create(Path.prototype, {
  		        constructor: {
  		            value: NodePath,
  		            enumerable: false,
  		            writable: true,
  		            configurable: true
  		        }
  		    });
  		    Object.defineProperties(NPp, {
  		        node: {
  		            get: function () {
  		                Object.defineProperty(this, "node", {
  		                    configurable: true,
  		                    value: this._computeNode()
  		                });
  		                return this.node;
  		            }
  		        },
  		        parent: {
  		            get: function () {
  		                Object.defineProperty(this, "parent", {
  		                    configurable: true,
  		                    value: this._computeParent()
  		                });
  		                return this.parent;
  		            }
  		        },
  		        scope: {
  		            get: function () {
  		                Object.defineProperty(this, "scope", {
  		                    configurable: true,
  		                    value: this._computeScope()
  		                });
  		                return this.scope;
  		            }
  		        }
  		    });
  		    NPp.replace = function () {
  		        delete this.node;
  		        delete this.parent;
  		        delete this.scope;
  		        return Path.prototype.replace.apply(this, arguments);
  		    };
  		    NPp.prune = function () {
  		        var remainingNodePath = this.parent;
  		        this.replace();
  		        return cleanUpNodesAfterPrune(remainingNodePath);
  		    };
  		    // The value of the first ancestor Path whose value is a Node.
  		    NPp._computeNode = function () {
  		        var value = this.value;
  		        if (n.Node.check(value)) {
  		            return value;
  		        }
  		        var pp = this.parentPath;
  		        return pp && pp.node || null;
  		    };
  		    // The first ancestor Path whose value is a Node distinct from this.node.
  		    NPp._computeParent = function () {
  		        var value = this.value;
  		        var pp = this.parentPath;
  		        if (!n.Node.check(value)) {
  		            while (pp && !n.Node.check(pp.value)) {
  		                pp = pp.parentPath;
  		            }
  		            if (pp) {
  		                pp = pp.parentPath;
  		            }
  		        }
  		        while (pp && !n.Node.check(pp.value)) {
  		            pp = pp.parentPath;
  		        }
  		        return pp || null;
  		    };
  		    // The closest enclosing scope that governs this node.
  		    NPp._computeScope = function () {
  		        var value = this.value;
  		        var pp = this.parentPath;
  		        var scope = pp && pp.scope;
  		        if (n.Node.check(value) &&
  		            Scope.isEstablishedBy(value)) {
  		            scope = new Scope(this, scope);
  		        }
  		        return scope || null;
  		    };
  		    NPp.getValueProperty = function (name) {
  		        return types.getFieldValue(this.value, name);
  		    };
  		    /**
  		     * Determine whether this.node needs to be wrapped in parentheses in order
  		     * for a parser to reproduce the same local AST structure.
  		     *
  		     * For instance, in the expression `(1 + 2) * 3`, the BinaryExpression
  		     * whose operator is "+" needs parentheses, because `1 + 2 * 3` would
  		     * parse differently.
  		     *
  		     * If assumeExpressionContext === true, we don't worry about edge cases
  		     * like an anonymous FunctionExpression appearing lexically first in its
  		     * enclosing statement and thus needing parentheses to avoid being parsed
  		     * as a FunctionDeclaration with a missing name.
  		     */
  		    NPp.needsParens = function (assumeExpressionContext) {
  		        var pp = this.parentPath;
  		        if (!pp) {
  		            return false;
  		        }
  		        var node = this.value;
  		        // Only expressions need parentheses.
  		        if (!n.Expression.check(node)) {
  		            return false;
  		        }
  		        // Identifiers never need parentheses.
  		        if (node.type === "Identifier") {
  		            return false;
  		        }
  		        while (!n.Node.check(pp.value)) {
  		            pp = pp.parentPath;
  		            if (!pp) {
  		                return false;
  		            }
  		        }
  		        var parent = pp.value;
  		        switch (node.type) {
  		            case "UnaryExpression":
  		            case "SpreadElement":
  		            case "SpreadProperty":
  		                return parent.type === "MemberExpression"
  		                    && this.name === "object"
  		                    && parent.object === node;
  		            case "BinaryExpression":
  		            case "LogicalExpression":
  		                switch (parent.type) {
  		                    case "CallExpression":
  		                        return this.name === "callee"
  		                            && parent.callee === node;
  		                    case "UnaryExpression":
  		                    case "SpreadElement":
  		                    case "SpreadProperty":
  		                        return true;
  		                    case "MemberExpression":
  		                        return this.name === "object"
  		                            && parent.object === node;
  		                    case "BinaryExpression":
  		                    case "LogicalExpression": {
  		                        var n_1 = node;
  		                        var po = parent.operator;
  		                        var pp_1 = PRECEDENCE[po];
  		                        var no = n_1.operator;
  		                        var np = PRECEDENCE[no];
  		                        if (pp_1 > np) {
  		                            return true;
  		                        }
  		                        if (pp_1 === np && this.name === "right") {
  		                            if (parent.right !== n_1) {
  		                                throw new Error("Nodes must be equal");
  		                            }
  		                            return true;
  		                        }
  		                    }
  		                    default:
  		                        return false;
  		                }
  		            case "SequenceExpression":
  		                switch (parent.type) {
  		                    case "ForStatement":
  		                        // Although parentheses wouldn't hurt around sequence
  		                        // expressions in the head of for loops, traditional style
  		                        // dictates that e.g. i++, j++ should not be wrapped with
  		                        // parentheses.
  		                        return false;
  		                    case "ExpressionStatement":
  		                        return this.name !== "expression";
  		                    default:
  		                        // Otherwise err on the side of overparenthesization, adding
  		                        // explicit exceptions above if this proves overzealous.
  		                        return true;
  		                }
  		            case "YieldExpression":
  		                switch (parent.type) {
  		                    case "BinaryExpression":
  		                    case "LogicalExpression":
  		                    case "UnaryExpression":
  		                    case "SpreadElement":
  		                    case "SpreadProperty":
  		                    case "CallExpression":
  		                    case "MemberExpression":
  		                    case "NewExpression":
  		                    case "ConditionalExpression":
  		                    case "YieldExpression":
  		                        return true;
  		                    default:
  		                        return false;
  		                }
  		            case "Literal":
  		                return parent.type === "MemberExpression"
  		                    && isNumber.check(node.value)
  		                    && this.name === "object"
  		                    && parent.object === node;
  		            case "AssignmentExpression":
  		            case "ConditionalExpression":
  		                switch (parent.type) {
  		                    case "UnaryExpression":
  		                    case "SpreadElement":
  		                    case "SpreadProperty":
  		                    case "BinaryExpression":
  		                    case "LogicalExpression":
  		                        return true;
  		                    case "CallExpression":
  		                        return this.name === "callee"
  		                            && parent.callee === node;
  		                    case "ConditionalExpression":
  		                        return this.name === "test"
  		                            && parent.test === node;
  		                    case "MemberExpression":
  		                        return this.name === "object"
  		                            && parent.object === node;
  		                    default:
  		                        return false;
  		                }
  		            default:
  		                if (parent.type === "NewExpression" &&
  		                    this.name === "callee" &&
  		                    parent.callee === node) {
  		                    return containsCallExpression(node);
  		                }
  		        }
  		        if (assumeExpressionContext !== true &&
  		            !this.canBeFirstInStatement() &&
  		            this.firstInStatement())
  		            return true;
  		        return false;
  		    };
  		    function isBinary(node) {
  		        return n.BinaryExpression.check(node)
  		            || n.LogicalExpression.check(node);
  		    }
  		    var PRECEDENCE = {};
  		    [["||"],
  		        ["&&"],
  		        ["|"],
  		        ["^"],
  		        ["&"],
  		        ["==", "===", "!=", "!=="],
  		        ["<", ">", "<=", ">=", "in", "instanceof"],
  		        [">>", "<<", ">>>"],
  		        ["+", "-"],
  		        ["*", "/", "%"]
  		    ].forEach(function (tier, i) {
  		        tier.forEach(function (op) {
  		            PRECEDENCE[op] = i;
  		        });
  		    });
  		    function containsCallExpression(node) {
  		        if (n.CallExpression.check(node)) {
  		            return true;
  		        }
  		        if (isArray.check(node)) {
  		            return node.some(containsCallExpression);
  		        }
  		        if (n.Node.check(node)) {
  		            return types.someField(node, function (_name, child) {
  		                return containsCallExpression(child);
  		            });
  		        }
  		        return false;
  		    }
  		    NPp.canBeFirstInStatement = function () {
  		        var node = this.node;
  		        return !n.FunctionExpression.check(node)
  		            && !n.ObjectExpression.check(node);
  		    };
  		    NPp.firstInStatement = function () {
  		        return firstInStatement(this);
  		    };
  		    function firstInStatement(path) {
  		        for (var node, parent; path.parent; path = path.parent) {
  		            node = path.node;
  		            parent = path.parent.node;
  		            if (n.BlockStatement.check(parent) &&
  		                path.parent.name === "body" &&
  		                path.name === 0) {
  		                if (parent.body[0] !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                return true;
  		            }
  		            if (n.ExpressionStatement.check(parent) &&
  		                path.name === "expression") {
  		                if (parent.expression !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                return true;
  		            }
  		            if (n.SequenceExpression.check(parent) &&
  		                path.parent.name === "expressions" &&
  		                path.name === 0) {
  		                if (parent.expressions[0] !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                continue;
  		            }
  		            if (n.CallExpression.check(parent) &&
  		                path.name === "callee") {
  		                if (parent.callee !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                continue;
  		            }
  		            if (n.MemberExpression.check(parent) &&
  		                path.name === "object") {
  		                if (parent.object !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                continue;
  		            }
  		            if (n.ConditionalExpression.check(parent) &&
  		                path.name === "test") {
  		                if (parent.test !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                continue;
  		            }
  		            if (isBinary(parent) &&
  		                path.name === "left") {
  		                if (parent.left !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                continue;
  		            }
  		            if (n.UnaryExpression.check(parent) &&
  		                !parent.prefix &&
  		                path.name === "argument") {
  		                if (parent.argument !== node) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		                continue;
  		            }
  		            return false;
  		        }
  		        return true;
  		    }
  		    /**
  		     * Pruning certain nodes will result in empty or incomplete nodes, here we clean those nodes up.
  		     */
  		    function cleanUpNodesAfterPrune(remainingNodePath) {
  		        if (n.VariableDeclaration.check(remainingNodePath.node)) {
  		            var declarations = remainingNodePath.get('declarations').value;
  		            if (!declarations || declarations.length === 0) {
  		                return remainingNodePath.prune();
  		            }
  		        }
  		        else if (n.ExpressionStatement.check(remainingNodePath.node)) {
  		            if (!remainingNodePath.get('expression').value) {
  		                return remainingNodePath.prune();
  		            }
  		        }
  		        else if (n.IfStatement.check(remainingNodePath.node)) {
  		            cleanUpIfStatementAfterPrune(remainingNodePath);
  		        }
  		        return remainingNodePath;
  		    }
  		    function cleanUpIfStatementAfterPrune(ifStatement) {
  		        var testExpression = ifStatement.get('test').value;
  		        var alternate = ifStatement.get('alternate').value;
  		        var consequent = ifStatement.get('consequent').value;
  		        if (!consequent && !alternate) {
  		            var testExpressionStatement = b.expressionStatement(testExpression);
  		            ifStatement.replace(testExpressionStatement);
  		        }
  		        else if (!consequent && alternate) {
  		            var negatedTestExpression = b.unaryExpression('!', testExpression, true);
  		            if (n.UnaryExpression.check(testExpression) && testExpression.operator === '!') {
  		                negatedTestExpression = testExpression.argument;
  		            }
  		            ifStatement.get("test").replace(negatedTestExpression);
  		            ifStatement.get("consequent").replace(alternate);
  		            ifStatement.get("alternate").replace();
  		        }
  		    }
  		    return NodePath;
  		}
  		exports.default = nodePathPlugin;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (nodePath, nodePath.exports));
  	return nodePath.exports;
  }

  pathVisitor.exports;

  var hasRequiredPathVisitor;

  function requirePathVisitor () {
  	if (hasRequiredPathVisitor) return pathVisitor.exports;
  	hasRequiredPathVisitor = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var node_path_1 = tslib_1.__importDefault(requireNodePath());
  		var shared_1 = requireShared();
  		var hasOwn = Object.prototype.hasOwnProperty;
  		function pathVisitorPlugin(fork) {
  		    var types = fork.use(types_1.default);
  		    var NodePath = fork.use(node_path_1.default);
  		    var isArray = types.builtInTypes.array;
  		    var isObject = types.builtInTypes.object;
  		    var isFunction = types.builtInTypes.function;
  		    var undefined$1;
  		    var PathVisitor = function PathVisitor() {
  		        if (!(this instanceof PathVisitor)) {
  		            throw new Error("PathVisitor constructor cannot be invoked without 'new'");
  		        }
  		        // Permanent state.
  		        this._reusableContextStack = [];
  		        this._methodNameTable = computeMethodNameTable(this);
  		        this._shouldVisitComments =
  		            hasOwn.call(this._methodNameTable, "Block") ||
  		                hasOwn.call(this._methodNameTable, "Line");
  		        this.Context = makeContextConstructor(this);
  		        // State reset every time PathVisitor.prototype.visit is called.
  		        this._visiting = false;
  		        this._changeReported = false;
  		    };
  		    function computeMethodNameTable(visitor) {
  		        var typeNames = Object.create(null);
  		        for (var methodName in visitor) {
  		            if (/^visit[A-Z]/.test(methodName)) {
  		                typeNames[methodName.slice("visit".length)] = true;
  		            }
  		        }
  		        var supertypeTable = types.computeSupertypeLookupTable(typeNames);
  		        var methodNameTable = Object.create(null);
  		        var typeNameKeys = Object.keys(supertypeTable);
  		        var typeNameCount = typeNameKeys.length;
  		        for (var i = 0; i < typeNameCount; ++i) {
  		            var typeName = typeNameKeys[i];
  		            methodName = "visit" + supertypeTable[typeName];
  		            if (isFunction.check(visitor[methodName])) {
  		                methodNameTable[typeName] = methodName;
  		            }
  		        }
  		        return methodNameTable;
  		    }
  		    PathVisitor.fromMethodsObject = function fromMethodsObject(methods) {
  		        if (methods instanceof PathVisitor) {
  		            return methods;
  		        }
  		        if (!isObject.check(methods)) {
  		            // An empty visitor?
  		            return new PathVisitor;
  		        }
  		        var Visitor = function Visitor() {
  		            if (!(this instanceof Visitor)) {
  		                throw new Error("Visitor constructor cannot be invoked without 'new'");
  		            }
  		            PathVisitor.call(this);
  		        };
  		        var Vp = Visitor.prototype = Object.create(PVp);
  		        Vp.constructor = Visitor;
  		        extend(Vp, methods);
  		        extend(Visitor, PathVisitor);
  		        isFunction.assert(Visitor.fromMethodsObject);
  		        isFunction.assert(Visitor.visit);
  		        return new Visitor;
  		    };
  		    function extend(target, source) {
  		        for (var property in source) {
  		            if (hasOwn.call(source, property)) {
  		                target[property] = source[property];
  		            }
  		        }
  		        return target;
  		    }
  		    PathVisitor.visit = function visit(node, methods) {
  		        return PathVisitor.fromMethodsObject(methods).visit(node);
  		    };
  		    var PVp = PathVisitor.prototype;
  		    PVp.visit = function () {
  		        if (this._visiting) {
  		            throw new Error("Recursively calling visitor.visit(path) resets visitor state. " +
  		                "Try this.visit(path) or this.traverse(path) instead.");
  		        }
  		        // Private state that needs to be reset before every traversal.
  		        this._visiting = true;
  		        this._changeReported = false;
  		        this._abortRequested = false;
  		        var argc = arguments.length;
  		        var args = new Array(argc);
  		        for (var i = 0; i < argc; ++i) {
  		            args[i] = arguments[i];
  		        }
  		        if (!(args[0] instanceof NodePath)) {
  		            args[0] = new NodePath({ root: args[0] }).get("root");
  		        }
  		        // Called with the same arguments as .visit.
  		        this.reset.apply(this, args);
  		        var didNotThrow;
  		        try {
  		            var root = this.visitWithoutReset(args[0]);
  		            didNotThrow = true;
  		        }
  		        finally {
  		            this._visiting = false;
  		            if (!didNotThrow && this._abortRequested) {
  		                // If this.visitWithoutReset threw an exception and
  		                // this._abortRequested was set to true, return the root of
  		                // the AST instead of letting the exception propagate, so that
  		                // client code does not have to provide a try-catch block to
  		                // intercept the AbortRequest exception.  Other kinds of
  		                // exceptions will propagate without being intercepted and
  		                // rethrown by a catch block, so their stacks will accurately
  		                // reflect the original throwing context.
  		                return args[0].value;
  		            }
  		        }
  		        return root;
  		    };
  		    PVp.AbortRequest = function AbortRequest() { };
  		    PVp.abort = function () {
  		        var visitor = this;
  		        visitor._abortRequested = true;
  		        var request = new visitor.AbortRequest();
  		        // If you decide to catch this exception and stop it from propagating,
  		        // make sure to call its cancel method to avoid silencing other
  		        // exceptions that might be thrown later in the traversal.
  		        request.cancel = function () {
  		            visitor._abortRequested = false;
  		        };
  		        throw request;
  		    };
  		    PVp.reset = function (_path /*, additional arguments */) {
  		        // Empty stub; may be reassigned or overridden by subclasses.
  		    };
  		    PVp.visitWithoutReset = function (path) {
  		        if (this instanceof this.Context) {
  		            // Since this.Context.prototype === this, there's a chance we
  		            // might accidentally call context.visitWithoutReset. If that
  		            // happens, re-invoke the method against context.visitor.
  		            return this.visitor.visitWithoutReset(path);
  		        }
  		        if (!(path instanceof NodePath)) {
  		            throw new Error("");
  		        }
  		        var value = path.value;
  		        var methodName = value &&
  		            typeof value === "object" &&
  		            typeof value.type === "string" &&
  		            this._methodNameTable[value.type];
  		        if (methodName) {
  		            var context = this.acquireContext(path);
  		            try {
  		                return context.invokeVisitorMethod(methodName);
  		            }
  		            finally {
  		                this.releaseContext(context);
  		            }
  		        }
  		        else {
  		            // If there was no visitor method to call, visit the children of
  		            // this node generically.
  		            return visitChildren(path, this);
  		        }
  		    };
  		    function visitChildren(path, visitor) {
  		        if (!(path instanceof NodePath)) {
  		            throw new Error("");
  		        }
  		        if (!(visitor instanceof PathVisitor)) {
  		            throw new Error("");
  		        }
  		        var value = path.value;
  		        if (isArray.check(value)) {
  		            path.each(visitor.visitWithoutReset, visitor);
  		        }
  		        else if (!isObject.check(value)) ;
  		        else {
  		            var childNames = types.getFieldNames(value);
  		            // The .comments field of the Node type is hidden, so we only
  		            // visit it if the visitor defines visitBlock or visitLine, and
  		            // value.comments is defined.
  		            if (visitor._shouldVisitComments &&
  		                value.comments &&
  		                childNames.indexOf("comments") < 0) {
  		                childNames.push("comments");
  		            }
  		            var childCount = childNames.length;
  		            var childPaths = [];
  		            for (var i = 0; i < childCount; ++i) {
  		                var childName = childNames[i];
  		                if (!hasOwn.call(value, childName)) {
  		                    value[childName] = types.getFieldValue(value, childName);
  		                }
  		                childPaths.push(path.get(childName));
  		            }
  		            for (var i = 0; i < childCount; ++i) {
  		                visitor.visitWithoutReset(childPaths[i]);
  		            }
  		        }
  		        return path.value;
  		    }
  		    PVp.acquireContext = function (path) {
  		        if (this._reusableContextStack.length === 0) {
  		            return new this.Context(path);
  		        }
  		        return this._reusableContextStack.pop().reset(path);
  		    };
  		    PVp.releaseContext = function (context) {
  		        if (!(context instanceof this.Context)) {
  		            throw new Error("");
  		        }
  		        this._reusableContextStack.push(context);
  		        context.currentPath = null;
  		    };
  		    PVp.reportChanged = function () {
  		        this._changeReported = true;
  		    };
  		    PVp.wasChangeReported = function () {
  		        return this._changeReported;
  		    };
  		    function makeContextConstructor(visitor) {
  		        function Context(path) {
  		            if (!(this instanceof Context)) {
  		                throw new Error("");
  		            }
  		            if (!(this instanceof PathVisitor)) {
  		                throw new Error("");
  		            }
  		            if (!(path instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            Object.defineProperty(this, "visitor", {
  		                value: visitor,
  		                writable: false,
  		                enumerable: true,
  		                configurable: false
  		            });
  		            this.currentPath = path;
  		            this.needToCallTraverse = true;
  		            Object.seal(this);
  		        }
  		        if (!(visitor instanceof PathVisitor)) {
  		            throw new Error("");
  		        }
  		        // Note that the visitor object is the prototype of Context.prototype,
  		        // so all visitor methods are inherited by context objects.
  		        var Cp = Context.prototype = Object.create(visitor);
  		        Cp.constructor = Context;
  		        extend(Cp, sharedContextProtoMethods);
  		        return Context;
  		    }
  		    // Every PathVisitor has a different this.Context constructor and
  		    // this.Context.prototype object, but those prototypes can all use the
  		    // same reset, invokeVisitorMethod, and traverse function objects.
  		    var sharedContextProtoMethods = Object.create(null);
  		    sharedContextProtoMethods.reset =
  		        function reset(path) {
  		            if (!(this instanceof this.Context)) {
  		                throw new Error("");
  		            }
  		            if (!(path instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            this.currentPath = path;
  		            this.needToCallTraverse = true;
  		            return this;
  		        };
  		    sharedContextProtoMethods.invokeVisitorMethod =
  		        function invokeVisitorMethod(methodName) {
  		            if (!(this instanceof this.Context)) {
  		                throw new Error("");
  		            }
  		            if (!(this.currentPath instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            var result = this.visitor[methodName].call(this, this.currentPath);
  		            if (result === false) {
  		                // Visitor methods return false to indicate that they have handled
  		                // their own traversal needs, and we should not complain if
  		                // this.needToCallTraverse is still true.
  		                this.needToCallTraverse = false;
  		            }
  		            else if (result !== undefined$1) {
  		                // Any other non-undefined value returned from the visitor method
  		                // is interpreted as a replacement value.
  		                this.currentPath = this.currentPath.replace(result)[0];
  		                if (this.needToCallTraverse) {
  		                    // If this.traverse still hasn't been called, visit the
  		                    // children of the replacement node.
  		                    this.traverse(this.currentPath);
  		                }
  		            }
  		            if (this.needToCallTraverse !== false) {
  		                throw new Error("Must either call this.traverse or return false in " + methodName);
  		            }
  		            var path = this.currentPath;
  		            return path && path.value;
  		        };
  		    sharedContextProtoMethods.traverse =
  		        function traverse(path, newVisitor) {
  		            if (!(this instanceof this.Context)) {
  		                throw new Error("");
  		            }
  		            if (!(path instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            if (!(this.currentPath instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            this.needToCallTraverse = false;
  		            return visitChildren(path, PathVisitor.fromMethodsObject(newVisitor || this.visitor));
  		        };
  		    sharedContextProtoMethods.visit =
  		        function visit(path, newVisitor) {
  		            if (!(this instanceof this.Context)) {
  		                throw new Error("");
  		            }
  		            if (!(path instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            if (!(this.currentPath instanceof NodePath)) {
  		                throw new Error("");
  		            }
  		            this.needToCallTraverse = false;
  		            return PathVisitor.fromMethodsObject(newVisitor || this.visitor).visitWithoutReset(path);
  		        };
  		    sharedContextProtoMethods.reportChanged = function reportChanged() {
  		        this.visitor.reportChanged();
  		    };
  		    sharedContextProtoMethods.abort = function abort() {
  		        this.needToCallTraverse = false;
  		        this.visitor.abort();
  		    };
  		    return PathVisitor;
  		}
  		exports.default = pathVisitorPlugin;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (pathVisitor, pathVisitor.exports));
  	return pathVisitor.exports;
  }

  var equiv$1 = {exports: {}};

  equiv$1.exports;

  var hasRequiredEquiv;

  function requireEquiv () {
  	if (hasRequiredEquiv) return equiv$1.exports;
  	hasRequiredEquiv = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		function default_1(fork) {
  		    var types = fork.use(types_1.default);
  		    var getFieldNames = types.getFieldNames;
  		    var getFieldValue = types.getFieldValue;
  		    var isArray = types.builtInTypes.array;
  		    var isObject = types.builtInTypes.object;
  		    var isDate = types.builtInTypes.Date;
  		    var isRegExp = types.builtInTypes.RegExp;
  		    var hasOwn = Object.prototype.hasOwnProperty;
  		    function astNodesAreEquivalent(a, b, problemPath) {
  		        if (isArray.check(problemPath)) {
  		            problemPath.length = 0;
  		        }
  		        else {
  		            problemPath = null;
  		        }
  		        return areEquivalent(a, b, problemPath);
  		    }
  		    astNodesAreEquivalent.assert = function (a, b) {
  		        var problemPath = [];
  		        if (!astNodesAreEquivalent(a, b, problemPath)) {
  		            if (problemPath.length === 0) {
  		                if (a !== b) {
  		                    throw new Error("Nodes must be equal");
  		                }
  		            }
  		            else {
  		                throw new Error("Nodes differ in the following path: " +
  		                    problemPath.map(subscriptForProperty).join(""));
  		            }
  		        }
  		    };
  		    function subscriptForProperty(property) {
  		        if (/[_$a-z][_$a-z0-9]*/i.test(property)) {
  		            return "." + property;
  		        }
  		        return "[" + JSON.stringify(property) + "]";
  		    }
  		    function areEquivalent(a, b, problemPath) {
  		        if (a === b) {
  		            return true;
  		        }
  		        if (isArray.check(a)) {
  		            return arraysAreEquivalent(a, b, problemPath);
  		        }
  		        if (isObject.check(a)) {
  		            return objectsAreEquivalent(a, b, problemPath);
  		        }
  		        if (isDate.check(a)) {
  		            return isDate.check(b) && (+a === +b);
  		        }
  		        if (isRegExp.check(a)) {
  		            return isRegExp.check(b) && (a.source === b.source &&
  		                a.global === b.global &&
  		                a.multiline === b.multiline &&
  		                a.ignoreCase === b.ignoreCase);
  		        }
  		        return a == b;
  		    }
  		    function arraysAreEquivalent(a, b, problemPath) {
  		        isArray.assert(a);
  		        var aLength = a.length;
  		        if (!isArray.check(b) || b.length !== aLength) {
  		            if (problemPath) {
  		                problemPath.push("length");
  		            }
  		            return false;
  		        }
  		        for (var i = 0; i < aLength; ++i) {
  		            if (problemPath) {
  		                problemPath.push(i);
  		            }
  		            if (i in a !== i in b) {
  		                return false;
  		            }
  		            if (!areEquivalent(a[i], b[i], problemPath)) {
  		                return false;
  		            }
  		            if (problemPath) {
  		                var problemPathTail = problemPath.pop();
  		                if (problemPathTail !== i) {
  		                    throw new Error("" + problemPathTail);
  		                }
  		            }
  		        }
  		        return true;
  		    }
  		    function objectsAreEquivalent(a, b, problemPath) {
  		        isObject.assert(a);
  		        if (!isObject.check(b)) {
  		            return false;
  		        }
  		        // Fast path for a common property of AST nodes.
  		        if (a.type !== b.type) {
  		            if (problemPath) {
  		                problemPath.push("type");
  		            }
  		            return false;
  		        }
  		        var aNames = getFieldNames(a);
  		        var aNameCount = aNames.length;
  		        var bNames = getFieldNames(b);
  		        var bNameCount = bNames.length;
  		        if (aNameCount === bNameCount) {
  		            for (var i = 0; i < aNameCount; ++i) {
  		                var name = aNames[i];
  		                var aChild = getFieldValue(a, name);
  		                var bChild = getFieldValue(b, name);
  		                if (problemPath) {
  		                    problemPath.push(name);
  		                }
  		                if (!areEquivalent(aChild, bChild, problemPath)) {
  		                    return false;
  		                }
  		                if (problemPath) {
  		                    var problemPathTail = problemPath.pop();
  		                    if (problemPathTail !== name) {
  		                        throw new Error("" + problemPathTail);
  		                    }
  		                }
  		            }
  		            return true;
  		        }
  		        if (!problemPath) {
  		            return false;
  		        }
  		        // Since aNameCount !== bNameCount, we need to find some name that's
  		        // missing in aNames but present in bNames, or vice-versa.
  		        var seenNames = Object.create(null);
  		        for (i = 0; i < aNameCount; ++i) {
  		            seenNames[aNames[i]] = true;
  		        }
  		        for (i = 0; i < bNameCount; ++i) {
  		            name = bNames[i];
  		            if (!hasOwn.call(seenNames, name)) {
  		                problemPath.push(name);
  		                return false;
  		            }
  		            delete seenNames[name];
  		        }
  		        for (name in seenNames) {
  		            problemPath.push(name);
  		            break;
  		        }
  		        return false;
  		    }
  		    return astNodesAreEquivalent;
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (equiv$1, equiv$1.exports));
  	return equiv$1.exports;
  }

  fork.exports;

  var hasRequiredFork;

  function requireFork () {
  	if (hasRequiredFork) return fork.exports;
  	hasRequiredFork = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var path_visitor_1 = tslib_1.__importDefault(requirePathVisitor());
  		var equiv_1 = tslib_1.__importDefault(requireEquiv());
  		var path_1 = tslib_1.__importDefault(requirePath());
  		var node_path_1 = tslib_1.__importDefault(requireNodePath());
  		var shared_1 = requireShared();
  		function default_1(plugins) {
  		    var fork = createFork();
  		    var types = fork.use(types_1.default);
  		    plugins.forEach(fork.use);
  		    types.finalize();
  		    var PathVisitor = fork.use(path_visitor_1.default);
  		    return {
  		        Type: types.Type,
  		        builtInTypes: types.builtInTypes,
  		        namedTypes: types.namedTypes,
  		        builders: types.builders,
  		        defineMethod: types.defineMethod,
  		        getFieldNames: types.getFieldNames,
  		        getFieldValue: types.getFieldValue,
  		        eachField: types.eachField,
  		        someField: types.someField,
  		        getSupertypeNames: types.getSupertypeNames,
  		        getBuilderName: types.getBuilderName,
  		        astNodesAreEquivalent: fork.use(equiv_1.default),
  		        finalize: types.finalize,
  		        Path: fork.use(path_1.default),
  		        NodePath: fork.use(node_path_1.default),
  		        PathVisitor: PathVisitor,
  		        use: fork.use,
  		        visit: PathVisitor.visit,
  		    };
  		}
  		exports.default = default_1;
  		function createFork() {
  		    var used = [];
  		    var usedResult = [];
  		    function use(plugin) {
  		        var idx = used.indexOf(plugin);
  		        if (idx === -1) {
  		            idx = used.length;
  		            used.push(plugin);
  		            usedResult[idx] = plugin(fork);
  		        }
  		        return usedResult[idx];
  		    }
  		    var fork = { use: use };
  		    return fork;
  		}
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (fork, fork.exports));
  	return fork.exports;
  }

  var esProposals = {exports: {}};

  var es2022 = {exports: {}};

  var es2021$1 = {exports: {}};

  var es2021 = {exports: {}};

  var es2020$1 = {exports: {}};

  var es2016$1 = {exports: {}};

  var core$1 = {exports: {}};

  core$1.exports;

  var hasRequiredCore$1;

  function requireCore$1 () {
  	if (hasRequiredCore$1) return core$1.exports;
  	hasRequiredCore$1 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var shared_1 = requireShared();
  		function default_1() {
  		    return {
  		        BinaryOperators: [
  		            "==", "!=", "===", "!==",
  		            "<", "<=", ">", ">=",
  		            "<<", ">>", ">>>",
  		            "+", "-", "*", "/", "%",
  		            "&",
  		            "|", "^", "in",
  		            "instanceof",
  		        ],
  		        AssignmentOperators: [
  		            "=", "+=", "-=", "*=", "/=", "%=",
  		            "<<=", ">>=", ">>>=",
  		            "|=", "^=", "&=",
  		        ],
  		        LogicalOperators: [
  		            "||", "&&",
  		        ],
  		    };
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (core$1, core$1.exports));
  	return core$1.exports;
  }

  es2016$1.exports;

  var hasRequiredEs2016$1;

  function requireEs2016$1 () {
  	if (hasRequiredEs2016$1) return es2016$1.exports;
  	hasRequiredEs2016$1 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var core_1 = tslib_1.__importDefault(requireCore$1());
  		function default_1(fork) {
  		    var result = fork.use(core_1.default);
  		    // Exponentiation operators. Must run before BinaryOperators or
  		    // AssignmentOperators are used (hence before fork.use(es6Def)).
  		    // https://github.com/tc39/proposal-exponentiation-operator
  		    if (result.BinaryOperators.indexOf("**") < 0) {
  		        result.BinaryOperators.push("**");
  		    }
  		    if (result.AssignmentOperators.indexOf("**=") < 0) {
  		        result.AssignmentOperators.push("**=");
  		    }
  		    return result;
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2016$1, es2016$1.exports));
  	return es2016$1.exports;
  }

  es2020$1.exports;

  var hasRequiredEs2020$1;

  function requireEs2020$1 () {
  	if (hasRequiredEs2020$1) return es2020$1.exports;
  	hasRequiredEs2020$1 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var es2016_1 = tslib_1.__importDefault(requireEs2016$1());
  		function default_1(fork) {
  		    var result = fork.use(es2016_1.default);
  		    // Nullish coalescing. Must run before LogicalOperators is used.
  		    // https://github.com/tc39/proposal-nullish-coalescing
  		    if (result.LogicalOperators.indexOf("??") < 0) {
  		        result.LogicalOperators.push("??");
  		    }
  		    return result;
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2020$1, es2020$1.exports));
  	return es2020$1.exports;
  }

  es2021.exports;

  var hasRequiredEs2021$1;

  function requireEs2021$1 () {
  	if (hasRequiredEs2021$1) return es2021.exports;
  	hasRequiredEs2021$1 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var shared_1 = requireShared();
  		var es2020_1 = tslib_1.__importDefault(requireEs2020$1());
  		function default_1(fork) {
  		    var result = fork.use(es2020_1.default);
  		    // Logical assignment operators. Must run before AssignmentOperators is used.
  		    // https://github.com/tc39/proposal-logical-assignment
  		    result.LogicalOperators.forEach(function (op) {
  		        var assignOp = op + "=";
  		        if (result.AssignmentOperators.indexOf(assignOp) < 0) {
  		            result.AssignmentOperators.push(assignOp);
  		        }
  		    });
  		    return result;
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2021, es2021.exports));
  	return es2021.exports;
  }

  var es2020 = {exports: {}};

  var es2019 = {exports: {}};

  var es2018 = {exports: {}};

  var es2017 = {exports: {}};

  var es2016 = {exports: {}};

  var es6 = {exports: {}};

  var core = {exports: {}};

  core.exports;

  var hasRequiredCore;

  function requireCore () {
  	if (hasRequiredCore) return core.exports;
  	hasRequiredCore = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var core_1 = tslib_1.__importDefault(requireCore$1());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    var types = fork.use(types_1.default);
  		    var Type = types.Type;
  		    var def = Type.def;
  		    var or = Type.or;
  		    var shared = fork.use(shared_1.default);
  		    var defaults = shared.defaults;
  		    var geq = shared.geq;
  		    var _a = fork.use(core_1.default), BinaryOperators = _a.BinaryOperators, AssignmentOperators = _a.AssignmentOperators, LogicalOperators = _a.LogicalOperators;
  		    // Abstract supertype of all syntactic entities that are allowed to have a
  		    // .loc field.
  		    def("Printable")
  		        .field("loc", or(def("SourceLocation"), null), defaults["null"], true);
  		    def("Node")
  		        .bases("Printable")
  		        .field("type", String)
  		        .field("comments", or([def("Comment")], null), defaults["null"], true);
  		    def("SourceLocation")
  		        .field("start", def("Position"))
  		        .field("end", def("Position"))
  		        .field("source", or(String, null), defaults["null"]);
  		    def("Position")
  		        .field("line", geq(1))
  		        .field("column", geq(0));
  		    def("File")
  		        .bases("Node")
  		        .build("program", "name")
  		        .field("program", def("Program"))
  		        .field("name", or(String, null), defaults["null"]);
  		    def("Program")
  		        .bases("Node")
  		        .build("body")
  		        .field("body", [def("Statement")]);
  		    def("Function")
  		        .bases("Node")
  		        .field("id", or(def("Identifier"), null), defaults["null"])
  		        .field("params", [def("Pattern")])
  		        .field("body", def("BlockStatement"))
  		        .field("generator", Boolean, defaults["false"])
  		        .field("async", Boolean, defaults["false"]);
  		    def("Statement").bases("Node");
  		    // The empty .build() here means that an EmptyStatement can be constructed
  		    // (i.e. it's not abstract) but that it needs no arguments.
  		    def("EmptyStatement").bases("Statement").build();
  		    def("BlockStatement")
  		        .bases("Statement")
  		        .build("body")
  		        .field("body", [def("Statement")]);
  		    // TODO Figure out how to silently coerce Expressions to
  		    // ExpressionStatements where a Statement was expected.
  		    def("ExpressionStatement")
  		        .bases("Statement")
  		        .build("expression")
  		        .field("expression", def("Expression"));
  		    def("IfStatement")
  		        .bases("Statement")
  		        .build("test", "consequent", "alternate")
  		        .field("test", def("Expression"))
  		        .field("consequent", def("Statement"))
  		        .field("alternate", or(def("Statement"), null), defaults["null"]);
  		    def("LabeledStatement")
  		        .bases("Statement")
  		        .build("label", "body")
  		        .field("label", def("Identifier"))
  		        .field("body", def("Statement"));
  		    def("BreakStatement")
  		        .bases("Statement")
  		        .build("label")
  		        .field("label", or(def("Identifier"), null), defaults["null"]);
  		    def("ContinueStatement")
  		        .bases("Statement")
  		        .build("label")
  		        .field("label", or(def("Identifier"), null), defaults["null"]);
  		    def("WithStatement")
  		        .bases("Statement")
  		        .build("object", "body")
  		        .field("object", def("Expression"))
  		        .field("body", def("Statement"));
  		    def("SwitchStatement")
  		        .bases("Statement")
  		        .build("discriminant", "cases", "lexical")
  		        .field("discriminant", def("Expression"))
  		        .field("cases", [def("SwitchCase")])
  		        .field("lexical", Boolean, defaults["false"]);
  		    def("ReturnStatement")
  		        .bases("Statement")
  		        .build("argument")
  		        .field("argument", or(def("Expression"), null));
  		    def("ThrowStatement")
  		        .bases("Statement")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		    def("TryStatement")
  		        .bases("Statement")
  		        .build("block", "handler", "finalizer")
  		        .field("block", def("BlockStatement"))
  		        .field("handler", or(def("CatchClause"), null), function () {
  		        return this.handlers && this.handlers[0] || null;
  		    })
  		        .field("handlers", [def("CatchClause")], function () {
  		        return this.handler ? [this.handler] : [];
  		    }, true) // Indicates this field is hidden from eachField iteration.
  		        .field("guardedHandlers", [def("CatchClause")], defaults.emptyArray)
  		        .field("finalizer", or(def("BlockStatement"), null), defaults["null"]);
  		    def("CatchClause")
  		        .bases("Node")
  		        .build("param", "guard", "body")
  		        .field("param", def("Pattern"))
  		        .field("guard", or(def("Expression"), null), defaults["null"])
  		        .field("body", def("BlockStatement"));
  		    def("WhileStatement")
  		        .bases("Statement")
  		        .build("test", "body")
  		        .field("test", def("Expression"))
  		        .field("body", def("Statement"));
  		    def("DoWhileStatement")
  		        .bases("Statement")
  		        .build("body", "test")
  		        .field("body", def("Statement"))
  		        .field("test", def("Expression"));
  		    def("ForStatement")
  		        .bases("Statement")
  		        .build("init", "test", "update", "body")
  		        .field("init", or(def("VariableDeclaration"), def("Expression"), null))
  		        .field("test", or(def("Expression"), null))
  		        .field("update", or(def("Expression"), null))
  		        .field("body", def("Statement"));
  		    def("ForInStatement")
  		        .bases("Statement")
  		        .build("left", "right", "body")
  		        .field("left", or(def("VariableDeclaration"), def("Expression")))
  		        .field("right", def("Expression"))
  		        .field("body", def("Statement"));
  		    def("DebuggerStatement").bases("Statement").build();
  		    def("Declaration").bases("Statement");
  		    def("FunctionDeclaration")
  		        .bases("Function", "Declaration")
  		        .build("id", "params", "body")
  		        .field("id", def("Identifier"));
  		    def("FunctionExpression")
  		        .bases("Function", "Expression")
  		        .build("id", "params", "body");
  		    def("VariableDeclaration")
  		        .bases("Declaration")
  		        .build("kind", "declarations")
  		        .field("kind", or("var", "let", "const"))
  		        .field("declarations", [def("VariableDeclarator")]);
  		    def("VariableDeclarator")
  		        .bases("Node")
  		        .build("id", "init")
  		        .field("id", def("Pattern"))
  		        .field("init", or(def("Expression"), null), defaults["null"]);
  		    def("Expression").bases("Node");
  		    def("ThisExpression").bases("Expression").build();
  		    def("ArrayExpression")
  		        .bases("Expression")
  		        .build("elements")
  		        .field("elements", [or(def("Expression"), null)]);
  		    def("ObjectExpression")
  		        .bases("Expression")
  		        .build("properties")
  		        .field("properties", [def("Property")]);
  		    // TODO Not in the Mozilla Parser API, but used by Esprima.
  		    def("Property")
  		        .bases("Node") // Want to be able to visit Property Nodes.
  		        .build("kind", "key", "value")
  		        .field("kind", or("init", "get", "set"))
  		        .field("key", or(def("Literal"), def("Identifier")))
  		        .field("value", def("Expression"));
  		    def("SequenceExpression")
  		        .bases("Expression")
  		        .build("expressions")
  		        .field("expressions", [def("Expression")]);
  		    var UnaryOperator = or("-", "+", "!", "~", "typeof", "void", "delete");
  		    def("UnaryExpression")
  		        .bases("Expression")
  		        .build("operator", "argument", "prefix")
  		        .field("operator", UnaryOperator)
  		        .field("argument", def("Expression"))
  		        // Esprima doesn't bother with this field, presumably because it's
  		        // always true for unary operators.
  		        .field("prefix", Boolean, defaults["true"]);
  		    var BinaryOperator = or.apply(void 0, BinaryOperators);
  		    def("BinaryExpression")
  		        .bases("Expression")
  		        .build("operator", "left", "right")
  		        .field("operator", BinaryOperator)
  		        .field("left", def("Expression"))
  		        .field("right", def("Expression"));
  		    var AssignmentOperator = or.apply(void 0, AssignmentOperators);
  		    def("AssignmentExpression")
  		        .bases("Expression")
  		        .build("operator", "left", "right")
  		        .field("operator", AssignmentOperator)
  		        .field("left", or(def("Pattern"), def("MemberExpression")))
  		        .field("right", def("Expression"));
  		    var UpdateOperator = or("++", "--");
  		    def("UpdateExpression")
  		        .bases("Expression")
  		        .build("operator", "argument", "prefix")
  		        .field("operator", UpdateOperator)
  		        .field("argument", def("Expression"))
  		        .field("prefix", Boolean);
  		    var LogicalOperator = or.apply(void 0, LogicalOperators);
  		    def("LogicalExpression")
  		        .bases("Expression")
  		        .build("operator", "left", "right")
  		        .field("operator", LogicalOperator)
  		        .field("left", def("Expression"))
  		        .field("right", def("Expression"));
  		    def("ConditionalExpression")
  		        .bases("Expression")
  		        .build("test", "consequent", "alternate")
  		        .field("test", def("Expression"))
  		        .field("consequent", def("Expression"))
  		        .field("alternate", def("Expression"));
  		    def("NewExpression")
  		        .bases("Expression")
  		        .build("callee", "arguments")
  		        .field("callee", def("Expression"))
  		        // The Mozilla Parser API gives this type as [or(def("Expression"),
  		        // null)], but null values don't really make sense at the call site.
  		        // TODO Report this nonsense.
  		        .field("arguments", [def("Expression")]);
  		    def("CallExpression")
  		        .bases("Expression")
  		        .build("callee", "arguments")
  		        .field("callee", def("Expression"))
  		        // See comment for NewExpression above.
  		        .field("arguments", [def("Expression")]);
  		    def("MemberExpression")
  		        .bases("Expression")
  		        .build("object", "property", "computed")
  		        .field("object", def("Expression"))
  		        .field("property", or(def("Identifier"), def("Expression")))
  		        .field("computed", Boolean, function () {
  		        var type = this.property.type;
  		        if (type === 'Literal' ||
  		            type === 'MemberExpression' ||
  		            type === 'BinaryExpression') {
  		            return true;
  		        }
  		        return false;
  		    });
  		    def("Pattern").bases("Node");
  		    def("SwitchCase")
  		        .bases("Node")
  		        .build("test", "consequent")
  		        .field("test", or(def("Expression"), null))
  		        .field("consequent", [def("Statement")]);
  		    def("Identifier")
  		        .bases("Expression", "Pattern")
  		        .build("name")
  		        .field("name", String)
  		        .field("optional", Boolean, defaults["false"]);
  		    def("Literal")
  		        .bases("Expression")
  		        .build("value")
  		        .field("value", or(String, Boolean, null, Number, RegExp, BigInt));
  		    // Abstract (non-buildable) comment supertype. Not a Node.
  		    def("Comment")
  		        .bases("Printable")
  		        .field("value", String)
  		        // A .leading comment comes before the node, whereas a .trailing
  		        // comment comes after it. These two fields should not both be true,
  		        // but they might both be false when the comment falls inside a node
  		        // and the node has no children for the comment to lead or trail,
  		        // e.g. { /*dangling*/ }.
  		        .field("leading", Boolean, defaults["true"])
  		        .field("trailing", Boolean, defaults["false"]);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (core, core.exports));
  	return core.exports;
  }

  es6.exports;

  var hasRequiredEs6;

  function requireEs6 () {
  	if (hasRequiredEs6) return es6.exports;
  	hasRequiredEs6 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var core_1 = tslib_1.__importDefault(requireCore());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(core_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    def("Function")
  		        .field("generator", Boolean, defaults["false"])
  		        .field("expression", Boolean, defaults["false"])
  		        .field("defaults", [or(def("Expression"), null)], defaults.emptyArray)
  		        // Legacy
  		        .field("rest", or(def("Identifier"), null), defaults["null"]);
  		    // The ESTree way of representing a ...rest parameter.
  		    def("RestElement")
  		        .bases("Pattern")
  		        .build("argument")
  		        .field("argument", def("Pattern"))
  		        .field("typeAnnotation", // for Babylon. Flow parser puts it on the identifier
  		    or(def("TypeAnnotation"), def("TSTypeAnnotation"), null), defaults["null"]);
  		    def("SpreadElementPattern")
  		        .bases("Pattern")
  		        .build("argument")
  		        .field("argument", def("Pattern"));
  		    def("FunctionDeclaration")
  		        .build("id", "params", "body", "generator", "expression")
  		        // May be `null` in the context of `export default function () {}`
  		        .field("id", or(def("Identifier"), null));
  		    def("FunctionExpression")
  		        .build("id", "params", "body", "generator", "expression");
  		    def("ArrowFunctionExpression")
  		        .bases("Function", "Expression")
  		        .build("params", "body", "expression")
  		        // The forced null value here is compatible with the overridden
  		        // definition of the "id" field in the Function interface.
  		        .field("id", null, defaults["null"])
  		        // Arrow function bodies are allowed to be expressions.
  		        .field("body", or(def("BlockStatement"), def("Expression")))
  		        // The current spec forbids arrow generators, so I have taken the
  		        // liberty of enforcing that. TODO Report this.
  		        .field("generator", false, defaults["false"]);
  		    def("ForOfStatement")
  		        .bases("Statement")
  		        .build("left", "right", "body")
  		        .field("left", or(def("VariableDeclaration"), def("Pattern")))
  		        .field("right", def("Expression"))
  		        .field("body", def("Statement"));
  		    def("YieldExpression")
  		        .bases("Expression")
  		        .build("argument", "delegate")
  		        .field("argument", or(def("Expression"), null))
  		        .field("delegate", Boolean, defaults["false"]);
  		    def("GeneratorExpression")
  		        .bases("Expression")
  		        .build("body", "blocks", "filter")
  		        .field("body", def("Expression"))
  		        .field("blocks", [def("ComprehensionBlock")])
  		        .field("filter", or(def("Expression"), null));
  		    def("ComprehensionExpression")
  		        .bases("Expression")
  		        .build("body", "blocks", "filter")
  		        .field("body", def("Expression"))
  		        .field("blocks", [def("ComprehensionBlock")])
  		        .field("filter", or(def("Expression"), null));
  		    def("ComprehensionBlock")
  		        .bases("Node")
  		        .build("left", "right", "each")
  		        .field("left", def("Pattern"))
  		        .field("right", def("Expression"))
  		        .field("each", Boolean);
  		    def("Property")
  		        .field("key", or(def("Literal"), def("Identifier"), def("Expression")))
  		        .field("value", or(def("Expression"), def("Pattern")))
  		        .field("method", Boolean, defaults["false"])
  		        .field("shorthand", Boolean, defaults["false"])
  		        .field("computed", Boolean, defaults["false"]);
  		    def("ObjectProperty")
  		        .field("shorthand", Boolean, defaults["false"]);
  		    def("PropertyPattern")
  		        .bases("Pattern")
  		        .build("key", "pattern")
  		        .field("key", or(def("Literal"), def("Identifier"), def("Expression")))
  		        .field("pattern", def("Pattern"))
  		        .field("computed", Boolean, defaults["false"]);
  		    def("ObjectPattern")
  		        .bases("Pattern")
  		        .build("properties")
  		        .field("properties", [or(def("PropertyPattern"), def("Property"))]);
  		    def("ArrayPattern")
  		        .bases("Pattern")
  		        .build("elements")
  		        .field("elements", [or(def("Pattern"), null)]);
  		    def("SpreadElement")
  		        .bases("Node")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		    def("ArrayExpression")
  		        .field("elements", [or(def("Expression"), def("SpreadElement"), def("RestElement"), null)]);
  		    def("NewExpression")
  		        .field("arguments", [or(def("Expression"), def("SpreadElement"))]);
  		    def("CallExpression")
  		        .field("arguments", [or(def("Expression"), def("SpreadElement"))]);
  		    // Note: this node type is *not* an AssignmentExpression with a Pattern on
  		    // the left-hand side! The existing AssignmentExpression type already
  		    // supports destructuring assignments. AssignmentPattern nodes may appear
  		    // wherever a Pattern is allowed, and the right-hand side represents a
  		    // default value to be destructured against the left-hand side, if no
  		    // value is otherwise provided. For example: default parameter values.
  		    def("AssignmentPattern")
  		        .bases("Pattern")
  		        .build("left", "right")
  		        .field("left", def("Pattern"))
  		        .field("right", def("Expression"));
  		    def("MethodDefinition")
  		        .bases("Declaration")
  		        .build("kind", "key", "value", "static")
  		        .field("kind", or("constructor", "method", "get", "set"))
  		        .field("key", def("Expression"))
  		        .field("value", def("Function"))
  		        .field("computed", Boolean, defaults["false"])
  		        .field("static", Boolean, defaults["false"]);
  		    var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("StaticBlock"));
  		    def("ClassProperty")
  		        .bases("Declaration")
  		        .build("key")
  		        .field("key", or(def("Literal"), def("Identifier"), def("Expression")))
  		        .field("computed", Boolean, defaults["false"]);
  		    def("ClassPropertyDefinition") // static property
  		        .bases("Declaration")
  		        .build("definition")
  		        // Yes, Virginia, circular definitions are permitted.
  		        .field("definition", ClassBodyElement);
  		    def("ClassBody")
  		        .bases("Declaration")
  		        .build("body")
  		        .field("body", [ClassBodyElement]);
  		    def("ClassDeclaration")
  		        .bases("Declaration")
  		        .build("id", "body", "superClass")
  		        .field("id", or(def("Identifier"), null))
  		        .field("body", def("ClassBody"))
  		        .field("superClass", or(def("Expression"), null), defaults["null"]);
  		    def("ClassExpression")
  		        .bases("Expression")
  		        .build("id", "body", "superClass")
  		        .field("id", or(def("Identifier"), null), defaults["null"])
  		        .field("body", def("ClassBody"))
  		        .field("superClass", or(def("Expression"), null), defaults["null"]);
  		    def("Super")
  		        .bases("Expression")
  		        .build();
  		    // Specifier and ModuleSpecifier are abstract non-standard types
  		    // introduced for definitional convenience.
  		    def("Specifier").bases("Node");
  		    // This supertype is shared/abused by both def/babel.js and
  		    // def/esprima.js. In the future, it will be possible to load only one set
  		    // of definitions appropriate for a given parser, but until then we must
  		    // rely on default functions to reconcile the conflicting AST formats.
  		    def("ModuleSpecifier")
  		        .bases("Specifier")
  		        // This local field is used by Babel/Acorn. It should not technically
  		        // be optional in the Babel/Acorn AST format, but it must be optional
  		        // in the Esprima AST format.
  		        .field("local", or(def("Identifier"), null), defaults["null"])
  		        // The id and name fields are used by Esprima. The id field should not
  		        // technically be optional in the Esprima AST format, but it must be
  		        // optional in the Babel/Acorn AST format.
  		        .field("id", or(def("Identifier"), null), defaults["null"])
  		        .field("name", or(def("Identifier"), null), defaults["null"]);
  		    // import {<id [as name]>} from ...;
  		    def("ImportSpecifier")
  		        .bases("ModuleSpecifier")
  		        .build("imported", "local")
  		        .field("imported", def("Identifier"));
  		    // import <id> from ...;
  		    def("ImportDefaultSpecifier")
  		        .bases("ModuleSpecifier")
  		        .build("local");
  		    // import <* as id> from ...;
  		    def("ImportNamespaceSpecifier")
  		        .bases("ModuleSpecifier")
  		        .build("local");
  		    def("ImportDeclaration")
  		        .bases("Declaration")
  		        .build("specifiers", "source", "importKind")
  		        .field("specifiers", [or(def("ImportSpecifier"), def("ImportNamespaceSpecifier"), def("ImportDefaultSpecifier"))], defaults.emptyArray)
  		        .field("source", def("Literal"))
  		        .field("importKind", or("value", "type"), function () {
  		        return "value";
  		    });
  		    def("ExportNamedDeclaration")
  		        .bases("Declaration")
  		        .build("declaration", "specifiers", "source")
  		        .field("declaration", or(def("Declaration"), null))
  		        .field("specifiers", [def("ExportSpecifier")], defaults.emptyArray)
  		        .field("source", or(def("Literal"), null), defaults["null"]);
  		    def("ExportSpecifier")
  		        .bases("ModuleSpecifier")
  		        .build("local", "exported")
  		        .field("exported", def("Identifier"));
  		    def("ExportDefaultDeclaration")
  		        .bases("Declaration")
  		        .build("declaration")
  		        .field("declaration", or(def("Declaration"), def("Expression")));
  		    def("ExportAllDeclaration")
  		        .bases("Declaration")
  		        .build("source")
  		        .field("source", def("Literal"));
  		    def("TaggedTemplateExpression")
  		        .bases("Expression")
  		        .build("tag", "quasi")
  		        .field("tag", def("Expression"))
  		        .field("quasi", def("TemplateLiteral"));
  		    def("TemplateLiteral")
  		        .bases("Expression")
  		        .build("quasis", "expressions")
  		        .field("quasis", [def("TemplateElement")])
  		        .field("expressions", [def("Expression")]);
  		    def("TemplateElement")
  		        .bases("Node")
  		        .build("value", "tail")
  		        .field("value", { "cooked": String, "raw": String })
  		        .field("tail", Boolean);
  		    def("MetaProperty")
  		        .bases("Expression")
  		        .build("meta", "property")
  		        .field("meta", def("Identifier"))
  		        .field("property", def("Identifier"));
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es6, es6.exports));
  	return es6.exports;
  }

  es2016.exports;

  var hasRequiredEs2016;

  function requireEs2016 () {
  	if (hasRequiredEs2016) return es2016.exports;
  	hasRequiredEs2016 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2016_1 = tslib_1.__importDefault(requireEs2016$1());
  		var es6_1 = tslib_1.__importDefault(requireEs6());
  		var shared_1 = requireShared();
  		function default_1(fork) {
  		    // The es2016OpsDef plugin comes before es6Def so BinaryOperators and
  		    // AssignmentOperators will be appropriately augmented before they are first
  		    // used in the core definitions for this fork.
  		    fork.use(es2016_1.default);
  		    fork.use(es6_1.default);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2016, es2016.exports));
  	return es2016.exports;
  }

  es2017.exports;

  var hasRequiredEs2017;

  function requireEs2017 () {
  	if (hasRequiredEs2017) return es2017.exports;
  	hasRequiredEs2017 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2016_1 = tslib_1.__importDefault(requireEs2016());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(es2016_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    def("Function")
  		        .field("async", Boolean, defaults["false"]);
  		    def("AwaitExpression")
  		        .bases("Expression")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2017, es2017.exports));
  	return es2017.exports;
  }

  es2018.exports;

  var hasRequiredEs2018;

  function requireEs2018 () {
  	if (hasRequiredEs2018) return es2018.exports;
  	hasRequiredEs2018 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2017_1 = tslib_1.__importDefault(requireEs2017());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(es2017_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    def("ForOfStatement")
  		        .field("await", Boolean, defaults["false"]);
  		    // Legacy
  		    def("SpreadProperty")
  		        .bases("Node")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		    def("ObjectExpression")
  		        .field("properties", [or(def("Property"), def("SpreadProperty"), // Legacy
  		        def("SpreadElement"))]);
  		    def("TemplateElement")
  		        .field("value", { "cooked": or(String, null), "raw": String });
  		    // Legacy
  		    def("SpreadPropertyPattern")
  		        .bases("Pattern")
  		        .build("argument")
  		        .field("argument", def("Pattern"));
  		    def("ObjectPattern")
  		        .field("properties", [or(def("PropertyPattern"), def("Property"), def("RestElement"), def("SpreadPropertyPattern"))]);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2018, es2018.exports));
  	return es2018.exports;
  }

  es2019.exports;

  var hasRequiredEs2019;

  function requireEs2019 () {
  	if (hasRequiredEs2019) return es2019.exports;
  	hasRequiredEs2019 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2018_1 = tslib_1.__importDefault(requireEs2018());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(es2018_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    def("CatchClause")
  		        .field("param", or(def("Pattern"), null), defaults["null"]);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2019, es2019.exports));
  	return es2019.exports;
  }

  es2020.exports;

  var hasRequiredEs2020;

  function requireEs2020 () {
  	if (hasRequiredEs2020) return es2020.exports;
  	hasRequiredEs2020 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2020_1 = tslib_1.__importDefault(requireEs2020$1());
  		var es2019_1 = tslib_1.__importDefault(requireEs2019());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    // The es2020OpsDef plugin comes before es2019Def so LogicalOperators will be
  		    // appropriately augmented before first used.
  		    fork.use(es2020_1.default);
  		    fork.use(es2019_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var shared = fork.use(shared_1.default);
  		    var defaults = shared.defaults;
  		    def("ImportExpression")
  		        .bases("Expression")
  		        .build("source")
  		        .field("source", def("Expression"));
  		    def("ExportAllDeclaration")
  		        .bases("Declaration")
  		        .build("source", "exported")
  		        .field("source", def("Literal"))
  		        .field("exported", or(def("Identifier"), null, void 0), defaults["null"]);
  		    // Optional chaining
  		    def("ChainElement")
  		        .bases("Node")
  		        .field("optional", Boolean, defaults["false"]);
  		    def("CallExpression")
  		        .bases("Expression", "ChainElement");
  		    def("MemberExpression")
  		        .bases("Expression", "ChainElement");
  		    def("ChainExpression")
  		        .bases("Expression")
  		        .build("expression")
  		        .field("expression", def("ChainElement"));
  		    def("OptionalCallExpression")
  		        .bases("CallExpression")
  		        .build("callee", "arguments", "optional")
  		        .field("optional", Boolean, defaults["true"]);
  		    // Deprecated optional chaining type, doesn't work with babelParser@7.11.0 or newer
  		    def("OptionalMemberExpression")
  		        .bases("MemberExpression")
  		        .build("object", "property", "computed", "optional")
  		        .field("optional", Boolean, defaults["true"]);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2020, es2020.exports));
  	return es2020.exports;
  }

  es2021$1.exports;

  var hasRequiredEs2021;

  function requireEs2021 () {
  	if (hasRequiredEs2021) return es2021$1.exports;
  	hasRequiredEs2021 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2021_1 = tslib_1.__importDefault(requireEs2021$1());
  		var es2020_1 = tslib_1.__importDefault(requireEs2020());
  		var shared_1 = requireShared();
  		function default_1(fork) {
  		    // The es2021OpsDef plugin comes before es2020Def so AssignmentOperators will
  		    // be appropriately augmented before first used.
  		    fork.use(es2021_1.default);
  		    fork.use(es2020_1.default);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2021$1, es2021$1.exports));
  	return es2021$1.exports;
  }

  es2022.exports;

  var hasRequiredEs2022;

  function requireEs2022 () {
  	if (hasRequiredEs2022) return es2022.exports;
  	hasRequiredEs2022 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es2021_1 = tslib_1.__importDefault(requireEs2021());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = requireShared();
  		function default_1(fork) {
  		    fork.use(es2021_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    def("StaticBlock")
  		        .bases("Declaration")
  		        .build("body")
  		        .field("body", [def("Statement")]);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (es2022, es2022.exports));
  	return es2022.exports;
  }

  esProposals.exports;

  var hasRequiredEsProposals;

  function requireEsProposals () {
  	if (hasRequiredEsProposals) return esProposals.exports;
  	hasRequiredEsProposals = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		var es2022_1 = tslib_1.__importDefault(requireEs2022());
  		function default_1(fork) {
  		    fork.use(es2022_1.default);
  		    var types = fork.use(types_1.default);
  		    var Type = types.Type;
  		    var def = types.Type.def;
  		    var or = Type.or;
  		    var shared = fork.use(shared_1.default);
  		    var defaults = shared.defaults;
  		    def("AwaitExpression")
  		        .build("argument", "all")
  		        .field("argument", or(def("Expression"), null))
  		        .field("all", Boolean, defaults["false"]);
  		    // Decorators
  		    def("Decorator")
  		        .bases("Node")
  		        .build("expression")
  		        .field("expression", def("Expression"));
  		    def("Property")
  		        .field("decorators", or([def("Decorator")], null), defaults["null"]);
  		    def("MethodDefinition")
  		        .field("decorators", or([def("Decorator")], null), defaults["null"]);
  		    // Private names
  		    def("PrivateName")
  		        .bases("Expression", "Pattern")
  		        .build("id")
  		        .field("id", def("Identifier"));
  		    def("ClassPrivateProperty")
  		        .bases("ClassProperty")
  		        .build("key", "value")
  		        .field("key", def("PrivateName"))
  		        .field("value", or(def("Expression"), null), defaults["null"]);
  		    // https://github.com/tc39/proposal-import-assertions
  		    def("ImportAttribute")
  		        .bases("Node")
  		        .build("key", "value")
  		        .field("key", or(def("Identifier"), def("Literal")))
  		        .field("value", def("Expression"));
  		    ["ImportDeclaration",
  		        "ExportAllDeclaration",
  		        "ExportNamedDeclaration",
  		    ].forEach(function (decl) {
  		        def(decl).field("assertions", [def("ImportAttribute")], defaults.emptyArray);
  		    });
  		    // https://github.com/tc39/proposal-record-tuple
  		    // https://github.com/babel/babel/pull/10865
  		    def("RecordExpression")
  		        .bases("Expression")
  		        .build("properties")
  		        .field("properties", [or(def("ObjectProperty"), def("ObjectMethod"), def("SpreadElement"))]);
  		    def("TupleExpression")
  		        .bases("Expression")
  		        .build("elements")
  		        .field("elements", [or(def("Expression"), def("SpreadElement"), null)]);
  		    // https://github.com/tc39/proposal-js-module-blocks
  		    // https://github.com/babel/babel/pull/12469
  		    def("ModuleExpression")
  		        .bases("Node")
  		        .build("body")
  		        .field("body", def("Program"));
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (esProposals, esProposals.exports));
  	return esProposals.exports;
  }

  var jsx = {exports: {}};

  jsx.exports;

  var hasRequiredJsx;

  function requireJsx () {
  	if (hasRequiredJsx) return jsx.exports;
  	hasRequiredJsx = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es_proposals_1 = tslib_1.__importDefault(requireEsProposals());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(es_proposals_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    def("JSXAttribute")
  		        .bases("Node")
  		        .build("name", "value")
  		        .field("name", or(def("JSXIdentifier"), def("JSXNamespacedName")))
  		        .field("value", or(def("Literal"), // attr="value"
  		    def("JSXExpressionContainer"), // attr={value}
  		    def("JSXElement"), // attr=<div />
  		    def("JSXFragment"), // attr=<></>
  		    null // attr= or just attr
  		    ), defaults["null"]);
  		    def("JSXIdentifier")
  		        .bases("Identifier")
  		        .build("name")
  		        .field("name", String);
  		    def("JSXNamespacedName")
  		        .bases("Node")
  		        .build("namespace", "name")
  		        .field("namespace", def("JSXIdentifier"))
  		        .field("name", def("JSXIdentifier"));
  		    def("JSXMemberExpression")
  		        .bases("MemberExpression")
  		        .build("object", "property")
  		        .field("object", or(def("JSXIdentifier"), def("JSXMemberExpression")))
  		        .field("property", def("JSXIdentifier"))
  		        .field("computed", Boolean, defaults.false);
  		    var JSXElementName = or(def("JSXIdentifier"), def("JSXNamespacedName"), def("JSXMemberExpression"));
  		    def("JSXSpreadAttribute")
  		        .bases("Node")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		    var JSXAttributes = [or(def("JSXAttribute"), def("JSXSpreadAttribute"))];
  		    def("JSXExpressionContainer")
  		        .bases("Expression")
  		        .build("expression")
  		        .field("expression", or(def("Expression"), def("JSXEmptyExpression")));
  		    var JSXChildren = [or(def("JSXText"), def("JSXExpressionContainer"), def("JSXSpreadChild"), def("JSXElement"), def("JSXFragment"), def("Literal") // Legacy: Esprima should return JSXText instead.
  		        )];
  		    def("JSXElement")
  		        .bases("Expression")
  		        .build("openingElement", "closingElement", "children")
  		        .field("openingElement", def("JSXOpeningElement"))
  		        .field("closingElement", or(def("JSXClosingElement"), null), defaults["null"])
  		        .field("children", JSXChildren, defaults.emptyArray)
  		        .field("name", JSXElementName, function () {
  		        // Little-known fact: the `this` object inside a default function
  		        // is none other than the partially-built object itself, and any
  		        // fields initialized directly from builder function arguments
  		        // (like openingElement, closingElement, and children) are
  		        // guaranteed to be available.
  		        return this.openingElement.name;
  		    }, true) // hidden from traversal
  		        .field("selfClosing", Boolean, function () {
  		        return this.openingElement.selfClosing;
  		    }, true) // hidden from traversal
  		        .field("attributes", JSXAttributes, function () {
  		        return this.openingElement.attributes;
  		    }, true); // hidden from traversal
  		    def("JSXOpeningElement")
  		        .bases("Node")
  		        .build("name", "attributes", "selfClosing")
  		        .field("name", JSXElementName)
  		        .field("attributes", JSXAttributes, defaults.emptyArray)
  		        .field("selfClosing", Boolean, defaults["false"]);
  		    def("JSXClosingElement")
  		        .bases("Node")
  		        .build("name")
  		        .field("name", JSXElementName);
  		    def("JSXFragment")
  		        .bases("Expression")
  		        .build("openingFragment", "closingFragment", "children")
  		        .field("openingFragment", def("JSXOpeningFragment"))
  		        .field("closingFragment", def("JSXClosingFragment"))
  		        .field("children", JSXChildren, defaults.emptyArray);
  		    def("JSXOpeningFragment")
  		        .bases("Node")
  		        .build();
  		    def("JSXClosingFragment")
  		        .bases("Node")
  		        .build();
  		    def("JSXText")
  		        .bases("Literal")
  		        .build("value", "raw")
  		        .field("value", String)
  		        .field("raw", String, function () {
  		        return this.value;
  		    });
  		    def("JSXEmptyExpression")
  		        .bases("Node")
  		        .build();
  		    def("JSXSpreadChild")
  		        .bases("Node")
  		        .build("expression")
  		        .field("expression", def("Expression"));
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (jsx, jsx.exports));
  	return jsx.exports;
  }

  var flow = {exports: {}};

  var typeAnnotations = {exports: {}};

  typeAnnotations.exports;

  var hasRequiredTypeAnnotations;

  function requireTypeAnnotations () {
  	if (hasRequiredTypeAnnotations) return typeAnnotations.exports;
  	hasRequiredTypeAnnotations = 1;
  	(function (module, exports) {
  		/**
  		 * Type annotation defs shared between Flow and TypeScript.
  		 * These defs could not be defined in ./flow.ts or ./typescript.ts directly
  		 * because they use the same name.
  		 */
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    var TypeAnnotation = or(def("TypeAnnotation"), def("TSTypeAnnotation"), null);
  		    var TypeParamDecl = or(def("TypeParameterDeclaration"), def("TSTypeParameterDeclaration"), null);
  		    def("Identifier")
  		        .field("typeAnnotation", TypeAnnotation, defaults["null"]);
  		    def("ObjectPattern")
  		        .field("typeAnnotation", TypeAnnotation, defaults["null"]);
  		    def("Function")
  		        .field("returnType", TypeAnnotation, defaults["null"])
  		        .field("typeParameters", TypeParamDecl, defaults["null"]);
  		    def("ClassProperty")
  		        .build("key", "value", "typeAnnotation", "static")
  		        .field("value", or(def("Expression"), null))
  		        .field("static", Boolean, defaults["false"])
  		        .field("typeAnnotation", TypeAnnotation, defaults["null"]);
  		    ["ClassDeclaration",
  		        "ClassExpression",
  		    ].forEach(function (typeName) {
  		        def(typeName)
  		            .field("typeParameters", TypeParamDecl, defaults["null"])
  		            .field("superTypeParameters", or(def("TypeParameterInstantiation"), def("TSTypeParameterInstantiation"), null), defaults["null"])
  		            .field("implements", or([def("ClassImplements")], [def("TSExpressionWithTypeArguments")]), defaults.emptyArray);
  		    });
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (typeAnnotations, typeAnnotations.exports));
  	return typeAnnotations.exports;
  }

  flow.exports;

  var hasRequiredFlow;

  function requireFlow () {
  	if (hasRequiredFlow) return flow.exports;
  	hasRequiredFlow = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es_proposals_1 = tslib_1.__importDefault(requireEsProposals());
  		var type_annotations_1 = tslib_1.__importDefault(requireTypeAnnotations());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(es_proposals_1.default);
  		    fork.use(type_annotations_1.default);
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    // Base types
  		    def("Flow").bases("Node");
  		    def("FlowType").bases("Flow");
  		    // Type annotations
  		    def("AnyTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("EmptyTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("MixedTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("VoidTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("SymbolTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("NumberTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("BigIntTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("NumberLiteralTypeAnnotation")
  		        .bases("FlowType")
  		        .build("value", "raw")
  		        .field("value", Number)
  		        .field("raw", String);
  		    // Babylon 6 differs in AST from Flow
  		    // same as NumberLiteralTypeAnnotation
  		    def("NumericLiteralTypeAnnotation")
  		        .bases("FlowType")
  		        .build("value", "raw")
  		        .field("value", Number)
  		        .field("raw", String);
  		    def("BigIntLiteralTypeAnnotation")
  		        .bases("FlowType")
  		        .build("value", "raw")
  		        .field("value", null)
  		        .field("raw", String);
  		    def("StringTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("StringLiteralTypeAnnotation")
  		        .bases("FlowType")
  		        .build("value", "raw")
  		        .field("value", String)
  		        .field("raw", String);
  		    def("BooleanTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("BooleanLiteralTypeAnnotation")
  		        .bases("FlowType")
  		        .build("value", "raw")
  		        .field("value", Boolean)
  		        .field("raw", String);
  		    def("TypeAnnotation")
  		        .bases("Node")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", def("FlowType"));
  		    def("NullableTypeAnnotation")
  		        .bases("FlowType")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", def("FlowType"));
  		    def("NullLiteralTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("NullTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("ThisTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("ExistsTypeAnnotation")
  		        .bases("FlowType")
  		        .build();
  		    def("ExistentialTypeParam")
  		        .bases("FlowType")
  		        .build();
  		    def("FunctionTypeAnnotation")
  		        .bases("FlowType")
  		        .build("params", "returnType", "rest", "typeParameters")
  		        .field("params", [def("FunctionTypeParam")])
  		        .field("returnType", def("FlowType"))
  		        .field("rest", or(def("FunctionTypeParam"), null))
  		        .field("typeParameters", or(def("TypeParameterDeclaration"), null));
  		    def("FunctionTypeParam")
  		        .bases("Node")
  		        .build("name", "typeAnnotation", "optional")
  		        .field("name", or(def("Identifier"), null))
  		        .field("typeAnnotation", def("FlowType"))
  		        .field("optional", Boolean);
  		    def("ArrayTypeAnnotation")
  		        .bases("FlowType")
  		        .build("elementType")
  		        .field("elementType", def("FlowType"));
  		    def("ObjectTypeAnnotation")
  		        .bases("FlowType")
  		        .build("properties", "indexers", "callProperties")
  		        .field("properties", [
  		        or(def("ObjectTypeProperty"), def("ObjectTypeSpreadProperty"))
  		    ])
  		        .field("indexers", [def("ObjectTypeIndexer")], defaults.emptyArray)
  		        .field("callProperties", [def("ObjectTypeCallProperty")], defaults.emptyArray)
  		        .field("inexact", or(Boolean, void 0), defaults["undefined"])
  		        .field("exact", Boolean, defaults["false"])
  		        .field("internalSlots", [def("ObjectTypeInternalSlot")], defaults.emptyArray);
  		    def("Variance")
  		        .bases("Node")
  		        .build("kind")
  		        .field("kind", or("plus", "minus"));
  		    var LegacyVariance = or(def("Variance"), "plus", "minus", null);
  		    def("ObjectTypeProperty")
  		        .bases("Node")
  		        .build("key", "value", "optional")
  		        .field("key", or(def("Literal"), def("Identifier")))
  		        .field("value", def("FlowType"))
  		        .field("optional", Boolean)
  		        .field("variance", LegacyVariance, defaults["null"]);
  		    def("ObjectTypeIndexer")
  		        .bases("Node")
  		        .build("id", "key", "value")
  		        .field("id", def("Identifier"))
  		        .field("key", def("FlowType"))
  		        .field("value", def("FlowType"))
  		        .field("variance", LegacyVariance, defaults["null"])
  		        .field("static", Boolean, defaults["false"]);
  		    def("ObjectTypeCallProperty")
  		        .bases("Node")
  		        .build("value")
  		        .field("value", def("FunctionTypeAnnotation"))
  		        .field("static", Boolean, defaults["false"]);
  		    def("QualifiedTypeIdentifier")
  		        .bases("Node")
  		        .build("qualification", "id")
  		        .field("qualification", or(def("Identifier"), def("QualifiedTypeIdentifier")))
  		        .field("id", def("Identifier"));
  		    def("GenericTypeAnnotation")
  		        .bases("FlowType")
  		        .build("id", "typeParameters")
  		        .field("id", or(def("Identifier"), def("QualifiedTypeIdentifier")))
  		        .field("typeParameters", or(def("TypeParameterInstantiation"), null));
  		    def("MemberTypeAnnotation")
  		        .bases("FlowType")
  		        .build("object", "property")
  		        .field("object", def("Identifier"))
  		        .field("property", or(def("MemberTypeAnnotation"), def("GenericTypeAnnotation")));
  		    def("IndexedAccessType")
  		        .bases("FlowType")
  		        .build("objectType", "indexType")
  		        .field("objectType", def("FlowType"))
  		        .field("indexType", def("FlowType"));
  		    def("OptionalIndexedAccessType")
  		        .bases("FlowType")
  		        .build("objectType", "indexType", "optional")
  		        .field("objectType", def("FlowType"))
  		        .field("indexType", def("FlowType"))
  		        .field('optional', Boolean);
  		    def("UnionTypeAnnotation")
  		        .bases("FlowType")
  		        .build("types")
  		        .field("types", [def("FlowType")]);
  		    def("IntersectionTypeAnnotation")
  		        .bases("FlowType")
  		        .build("types")
  		        .field("types", [def("FlowType")]);
  		    def("TypeofTypeAnnotation")
  		        .bases("FlowType")
  		        .build("argument")
  		        .field("argument", def("FlowType"));
  		    def("ObjectTypeSpreadProperty")
  		        .bases("Node")
  		        .build("argument")
  		        .field("argument", def("FlowType"));
  		    def("ObjectTypeInternalSlot")
  		        .bases("Node")
  		        .build("id", "value", "optional", "static", "method")
  		        .field("id", def("Identifier"))
  		        .field("value", def("FlowType"))
  		        .field("optional", Boolean)
  		        .field("static", Boolean)
  		        .field("method", Boolean);
  		    def("TypeParameterDeclaration")
  		        .bases("Node")
  		        .build("params")
  		        .field("params", [def("TypeParameter")]);
  		    def("TypeParameterInstantiation")
  		        .bases("Node")
  		        .build("params")
  		        .field("params", [def("FlowType")]);
  		    def("TypeParameter")
  		        .bases("FlowType")
  		        .build("name", "variance", "bound", "default")
  		        .field("name", String)
  		        .field("variance", LegacyVariance, defaults["null"])
  		        .field("bound", or(def("TypeAnnotation"), null), defaults["null"])
  		        .field("default", or(def("FlowType"), null), defaults["null"]);
  		    def("ClassProperty")
  		        .field("variance", LegacyVariance, defaults["null"]);
  		    def("ClassImplements")
  		        .bases("Node")
  		        .build("id")
  		        .field("id", def("Identifier"))
  		        .field("superClass", or(def("Expression"), null), defaults["null"])
  		        .field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults["null"]);
  		    def("InterfaceTypeAnnotation")
  		        .bases("FlowType")
  		        .build("body", "extends")
  		        .field("body", def("ObjectTypeAnnotation"))
  		        .field("extends", or([def("InterfaceExtends")], null), defaults["null"]);
  		    def("InterfaceDeclaration")
  		        .bases("Declaration")
  		        .build("id", "body", "extends")
  		        .field("id", def("Identifier"))
  		        .field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults["null"])
  		        .field("body", def("ObjectTypeAnnotation"))
  		        .field("extends", [def("InterfaceExtends")]);
  		    def("DeclareInterface")
  		        .bases("InterfaceDeclaration")
  		        .build("id", "body", "extends");
  		    def("InterfaceExtends")
  		        .bases("Node")
  		        .build("id")
  		        .field("id", def("Identifier"))
  		        .field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults["null"]);
  		    def("TypeAlias")
  		        .bases("Declaration")
  		        .build("id", "typeParameters", "right")
  		        .field("id", def("Identifier"))
  		        .field("typeParameters", or(def("TypeParameterDeclaration"), null))
  		        .field("right", def("FlowType"));
  		    def("DeclareTypeAlias")
  		        .bases("TypeAlias")
  		        .build("id", "typeParameters", "right");
  		    def("OpaqueType")
  		        .bases("Declaration")
  		        .build("id", "typeParameters", "impltype", "supertype")
  		        .field("id", def("Identifier"))
  		        .field("typeParameters", or(def("TypeParameterDeclaration"), null))
  		        .field("impltype", def("FlowType"))
  		        .field("supertype", or(def("FlowType"), null));
  		    def("DeclareOpaqueType")
  		        .bases("OpaqueType")
  		        .build("id", "typeParameters", "supertype")
  		        .field("impltype", or(def("FlowType"), null));
  		    def("TypeCastExpression")
  		        .bases("Expression")
  		        .build("expression", "typeAnnotation")
  		        .field("expression", def("Expression"))
  		        .field("typeAnnotation", def("TypeAnnotation"));
  		    def("TupleTypeAnnotation")
  		        .bases("FlowType")
  		        .build("types")
  		        .field("types", [def("FlowType")]);
  		    def("DeclareVariable")
  		        .bases("Statement")
  		        .build("id")
  		        .field("id", def("Identifier"));
  		    def("DeclareFunction")
  		        .bases("Statement")
  		        .build("id")
  		        .field("id", def("Identifier"))
  		        .field("predicate", or(def("FlowPredicate"), null), defaults["null"]);
  		    def("DeclareClass")
  		        .bases("InterfaceDeclaration")
  		        .build("id");
  		    def("DeclareModule")
  		        .bases("Statement")
  		        .build("id", "body")
  		        .field("id", or(def("Identifier"), def("Literal")))
  		        .field("body", def("BlockStatement"));
  		    def("DeclareModuleExports")
  		        .bases("Statement")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", def("TypeAnnotation"));
  		    def("DeclareExportDeclaration")
  		        .bases("Declaration")
  		        .build("default", "declaration", "specifiers", "source")
  		        .field("default", Boolean)
  		        .field("declaration", or(def("DeclareVariable"), def("DeclareFunction"), def("DeclareClass"), def("FlowType"), // Implies default.
  		    def("TypeAlias"), // Implies named type
  		    def("DeclareOpaqueType"), // Implies named opaque type
  		    def("InterfaceDeclaration"), null))
  		        .field("specifiers", [or(def("ExportSpecifier"), def("ExportBatchSpecifier"))], defaults.emptyArray)
  		        .field("source", or(def("Literal"), null), defaults["null"]);
  		    def("DeclareExportAllDeclaration")
  		        .bases("Declaration")
  		        .build("source")
  		        .field("source", or(def("Literal"), null), defaults["null"]);
  		    def("ImportDeclaration")
  		        .field("importKind", or("value", "type", "typeof"), function () { return "value"; });
  		    def("FlowPredicate").bases("Flow");
  		    def("InferredPredicate")
  		        .bases("FlowPredicate")
  		        .build();
  		    def("DeclaredPredicate")
  		        .bases("FlowPredicate")
  		        .build("value")
  		        .field("value", def("Expression"));
  		    def("Function")
  		        .field("predicate", or(def("FlowPredicate"), null), defaults["null"]);
  		    def("CallExpression")
  		        .field("typeArguments", or(null, def("TypeParameterInstantiation")), defaults["null"]);
  		    def("NewExpression")
  		        .field("typeArguments", or(null, def("TypeParameterInstantiation")), defaults["null"]);
  		    // Enums
  		    def("EnumDeclaration")
  		        .bases("Declaration")
  		        .build("id", "body")
  		        .field("id", def("Identifier"))
  		        .field("body", or(def("EnumBooleanBody"), def("EnumNumberBody"), def("EnumStringBody"), def("EnumSymbolBody")));
  		    def("EnumBooleanBody")
  		        .build("members", "explicitType")
  		        .field("members", [def("EnumBooleanMember")])
  		        .field("explicitType", Boolean);
  		    def("EnumNumberBody")
  		        .build("members", "explicitType")
  		        .field("members", [def("EnumNumberMember")])
  		        .field("explicitType", Boolean);
  		    def("EnumStringBody")
  		        .build("members", "explicitType")
  		        .field("members", or([def("EnumStringMember")], [def("EnumDefaultedMember")]))
  		        .field("explicitType", Boolean);
  		    def("EnumSymbolBody")
  		        .build("members")
  		        .field("members", [def("EnumDefaultedMember")]);
  		    def("EnumBooleanMember")
  		        .build("id", "init")
  		        .field("id", def("Identifier"))
  		        .field("init", or(def("Literal"), Boolean));
  		    def("EnumNumberMember")
  		        .build("id", "init")
  		        .field("id", def("Identifier"))
  		        .field("init", def("Literal"));
  		    def("EnumStringMember")
  		        .build("id", "init")
  		        .field("id", def("Identifier"))
  		        .field("init", def("Literal"));
  		    def("EnumDefaultedMember")
  		        .build("id")
  		        .field("id", def("Identifier"));
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (flow, flow.exports));
  	return flow.exports;
  }

  var esprima$1 = {exports: {}};

  esprima$1.exports;

  var hasRequiredEsprima$1;

  function requireEsprima$1 () {
  	if (hasRequiredEsprima$1) return esprima$1.exports;
  	hasRequiredEsprima$1 = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es_proposals_1 = tslib_1.__importDefault(requireEsProposals());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    fork.use(es_proposals_1.default);
  		    var types = fork.use(types_1.default);
  		    var defaults = fork.use(shared_1.default).defaults;
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    def("VariableDeclaration")
  		        .field("declarations", [or(def("VariableDeclarator"), def("Identifier") // Esprima deviation.
  		        )]);
  		    def("Property")
  		        .field("value", or(def("Expression"), def("Pattern") // Esprima deviation.
  		    ));
  		    def("ArrayPattern")
  		        .field("elements", [or(def("Pattern"), def("SpreadElement"), null)]);
  		    def("ObjectPattern")
  		        .field("properties", [or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty") // Used by Esprima.
  		        )]);
  		    // Like ModuleSpecifier, except type:"ExportSpecifier" and buildable.
  		    // export {<id [as name]>} [from ...];
  		    def("ExportSpecifier")
  		        .bases("ModuleSpecifier")
  		        .build("id", "name");
  		    // export <*> from ...;
  		    def("ExportBatchSpecifier")
  		        .bases("Specifier")
  		        .build();
  		    def("ExportDeclaration")
  		        .bases("Declaration")
  		        .build("default", "declaration", "specifiers", "source")
  		        .field("default", Boolean)
  		        .field("declaration", or(def("Declaration"), def("Expression"), // Implies default.
  		    null))
  		        .field("specifiers", [or(def("ExportSpecifier"), def("ExportBatchSpecifier"))], defaults.emptyArray)
  		        .field("source", or(def("Literal"), null), defaults["null"]);
  		    def("Block")
  		        .bases("Comment")
  		        .build("value", /*optional:*/ "leading", "trailing");
  		    def("Line")
  		        .bases("Comment")
  		        .build("value", /*optional:*/ "leading", "trailing");
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (esprima$1, esprima$1.exports));
  	return esprima$1.exports;
  }

  var babel = {exports: {}};

  var babelCore = {exports: {}};

  babelCore.exports;

  var hasRequiredBabelCore;

  function requireBabelCore () {
  	if (hasRequiredBabelCore) return babelCore.exports;
  	hasRequiredBabelCore = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var es_proposals_1 = tslib_1.__importDefault(requireEsProposals());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    var _a, _b, _c, _d, _e;
  		    fork.use(es_proposals_1.default);
  		    var types = fork.use(types_1.default);
  		    var defaults = fork.use(shared_1.default).defaults;
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var isUndefined = types.builtInTypes.undefined;
  		    def("Noop")
  		        .bases("Statement")
  		        .build();
  		    def("DoExpression")
  		        .bases("Expression")
  		        .build("body")
  		        .field("body", [def("Statement")]);
  		    def("BindExpression")
  		        .bases("Expression")
  		        .build("object", "callee")
  		        .field("object", or(def("Expression"), null))
  		        .field("callee", def("Expression"));
  		    def("ParenthesizedExpression")
  		        .bases("Expression")
  		        .build("expression")
  		        .field("expression", def("Expression"));
  		    def("ExportNamespaceSpecifier")
  		        .bases("Specifier")
  		        .build("exported")
  		        .field("exported", def("Identifier"));
  		    def("ExportDefaultSpecifier")
  		        .bases("Specifier")
  		        .build("exported")
  		        .field("exported", def("Identifier"));
  		    def("CommentBlock")
  		        .bases("Comment")
  		        .build("value", /*optional:*/ "leading", "trailing");
  		    def("CommentLine")
  		        .bases("Comment")
  		        .build("value", /*optional:*/ "leading", "trailing");
  		    def("Directive")
  		        .bases("Node")
  		        .build("value")
  		        .field("value", def("DirectiveLiteral"));
  		    def("DirectiveLiteral")
  		        .bases("Node", "Expression")
  		        .build("value")
  		        .field("value", String, defaults["use strict"]);
  		    def("InterpreterDirective")
  		        .bases("Node")
  		        .build("value")
  		        .field("value", String);
  		    def("BlockStatement")
  		        .bases("Statement")
  		        .build("body")
  		        .field("body", [def("Statement")])
  		        .field("directives", [def("Directive")], defaults.emptyArray);
  		    def("Program")
  		        .bases("Node")
  		        .build("body")
  		        .field("body", [def("Statement")])
  		        .field("directives", [def("Directive")], defaults.emptyArray)
  		        .field("interpreter", or(def("InterpreterDirective"), null), defaults["null"]);
  		    function makeLiteralExtra(rawValueType, toRaw) {
  		        if (rawValueType === void 0) { rawValueType = String; }
  		        return [
  		            "extra",
  		            {
  		                rawValue: rawValueType,
  		                raw: String,
  		            },
  		            function getDefault() {
  		                var value = types.getFieldValue(this, "value");
  		                return {
  		                    rawValue: value,
  		                    raw: toRaw ? toRaw(value) : String(value),
  		                };
  		            },
  		        ];
  		    }
  		    // Split Literal
  		    (_a = def("StringLiteral")
  		        .bases("Literal")
  		        .build("value")
  		        .field("value", String))
  		        .field.apply(_a, makeLiteralExtra(String, function (val) { return JSON.stringify(val); }));
  		    (_b = def("NumericLiteral")
  		        .bases("Literal")
  		        .build("value")
  		        .field("value", Number)
  		        .field("raw", or(String, null), defaults["null"]))
  		        .field.apply(_b, makeLiteralExtra(Number));
  		    (_c = def("BigIntLiteral")
  		        .bases("Literal")
  		        .build("value")
  		        // Only String really seems appropriate here, since BigInt values
  		        // often exceed the limits of JS numbers.
  		        .field("value", or(String, Number)))
  		        .field.apply(_c, makeLiteralExtra(String, function (val) { return val + "n"; }));
  		    // https://github.com/tc39/proposal-decimal
  		    // https://github.com/babel/babel/pull/11640
  		    (_d = def("DecimalLiteral")
  		        .bases("Literal")
  		        .build("value")
  		        .field("value", String))
  		        .field.apply(_d, makeLiteralExtra(String, function (val) { return val + "m"; }));
  		    def("NullLiteral")
  		        .bases("Literal")
  		        .build()
  		        .field("value", null, defaults["null"]);
  		    def("BooleanLiteral")
  		        .bases("Literal")
  		        .build("value")
  		        .field("value", Boolean);
  		    (_e = def("RegExpLiteral")
  		        .bases("Literal")
  		        .build("pattern", "flags")
  		        .field("pattern", String)
  		        .field("flags", String)
  		        .field("value", RegExp, function () {
  		        return new RegExp(this.pattern, this.flags);
  		    }))
  		        .field.apply(_e, makeLiteralExtra(or(RegExp, isUndefined), function (exp) { return "/".concat(exp.pattern, "/").concat(exp.flags || ""); })).field("regex", {
  		        pattern: String,
  		        flags: String
  		    }, function () {
  		        return {
  		            pattern: this.pattern,
  		            flags: this.flags,
  		        };
  		    });
  		    var ObjectExpressionProperty = or(def("Property"), def("ObjectMethod"), def("ObjectProperty"), def("SpreadProperty"), def("SpreadElement"));
  		    // Split Property -> ObjectProperty and ObjectMethod
  		    def("ObjectExpression")
  		        .bases("Expression")
  		        .build("properties")
  		        .field("properties", [ObjectExpressionProperty]);
  		    // ObjectMethod hoist .value properties to own properties
  		    def("ObjectMethod")
  		        .bases("Node", "Function")
  		        .build("kind", "key", "params", "body", "computed")
  		        .field("kind", or("method", "get", "set"))
  		        .field("key", or(def("Literal"), def("Identifier"), def("Expression")))
  		        .field("params", [def("Pattern")])
  		        .field("body", def("BlockStatement"))
  		        .field("computed", Boolean, defaults["false"])
  		        .field("generator", Boolean, defaults["false"])
  		        .field("async", Boolean, defaults["false"])
  		        .field("accessibility", // TypeScript
  		    or(def("Literal"), null), defaults["null"])
  		        .field("decorators", or([def("Decorator")], null), defaults["null"]);
  		    def("ObjectProperty")
  		        .bases("Node")
  		        .build("key", "value")
  		        .field("key", or(def("Literal"), def("Identifier"), def("Expression")))
  		        .field("value", or(def("Expression"), def("Pattern")))
  		        .field("accessibility", // TypeScript
  		    or(def("Literal"), null), defaults["null"])
  		        .field("computed", Boolean, defaults["false"]);
  		    var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassPrivateProperty"), def("ClassMethod"), def("ClassPrivateMethod"), def("ClassAccessorProperty"), def("StaticBlock"));
  		    // MethodDefinition -> ClassMethod
  		    def("ClassBody")
  		        .bases("Declaration")
  		        .build("body")
  		        .field("body", [ClassBodyElement]);
  		    def("ClassMethod")
  		        .bases("Declaration", "Function")
  		        .build("kind", "key", "params", "body", "computed", "static")
  		        .field("key", or(def("Literal"), def("Identifier"), def("Expression")));
  		    def("ClassPrivateMethod")
  		        .bases("Declaration", "Function")
  		        .build("key", "params", "body", "kind", "computed", "static")
  		        .field("key", def("PrivateName"));
  		    def("ClassAccessorProperty")
  		        .bases("Declaration")
  		        .build("key", "value", "decorators", "computed", "static")
  		        .field("key", or(def("Literal"), def("Identifier"), def("PrivateName"), 
  		    // Only when .computed is true (TODO enforce this)
  		    def("Expression")))
  		        .field("value", or(def("Expression"), null), defaults["null"]);
  		    ["ClassMethod",
  		        "ClassPrivateMethod",
  		    ].forEach(function (typeName) {
  		        def(typeName)
  		            .field("kind", or("get", "set", "method", "constructor"), function () { return "method"; })
  		            .field("body", def("BlockStatement"))
  		            // For backwards compatibility only. Expect accessibility instead (see below).
  		            .field("access", or("public", "private", "protected", null), defaults["null"]);
  		    });
  		    ["ClassMethod",
  		        "ClassPrivateMethod",
  		        "ClassAccessorProperty",
  		    ].forEach(function (typeName) {
  		        def(typeName)
  		            .field("computed", Boolean, defaults["false"])
  		            .field("static", Boolean, defaults["false"])
  		            .field("abstract", Boolean, defaults["false"])
  		            .field("accessibility", or("public", "private", "protected", null), defaults["null"])
  		            .field("decorators", or([def("Decorator")], null), defaults["null"])
  		            .field("definite", Boolean, defaults["false"])
  		            .field("optional", Boolean, defaults["false"])
  		            .field("override", Boolean, defaults["false"])
  		            .field("readonly", Boolean, defaults["false"]);
  		    });
  		    var ObjectPatternProperty = or(def("Property"), def("PropertyPattern"), def("SpreadPropertyPattern"), def("SpreadProperty"), // Used by Esprima
  		    def("ObjectProperty"), // Babel 6
  		    def("RestProperty"), // Babel 6
  		    def("RestElement"));
  		    // Split into RestProperty and SpreadProperty
  		    def("ObjectPattern")
  		        .bases("Pattern")
  		        .build("properties")
  		        .field("properties", [ObjectPatternProperty])
  		        .field("decorators", or([def("Decorator")], null), defaults["null"]);
  		    def("SpreadProperty")
  		        .bases("Node")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		    def("RestProperty")
  		        .bases("Node")
  		        .build("argument")
  		        .field("argument", def("Expression"));
  		    def("ForAwaitStatement")
  		        .bases("Statement")
  		        .build("left", "right", "body")
  		        .field("left", or(def("VariableDeclaration"), def("Expression")))
  		        .field("right", def("Expression"))
  		        .field("body", def("Statement"));
  		    // The callee node of a dynamic import(...) expression.
  		    def("Import")
  		        .bases("Expression")
  		        .build();
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (babelCore, babelCore.exports));
  	return babelCore.exports;
  }

  babel.exports;

  var hasRequiredBabel;

  function requireBabel () {
  	if (hasRequiredBabel) return babel.exports;
  	hasRequiredBabel = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var babel_core_1 = tslib_1.__importDefault(requireBabelCore());
  		var flow_1 = tslib_1.__importDefault(requireFlow());
  		var shared_1 = requireShared();
  		function default_1(fork) {
  		    var types = fork.use(types_1.default);
  		    var def = types.Type.def;
  		    fork.use(babel_core_1.default);
  		    fork.use(flow_1.default);
  		    // https://github.com/babel/babel/pull/10148
  		    def("V8IntrinsicIdentifier")
  		        .bases("Expression")
  		        .build("name")
  		        .field("name", String);
  		    // https://github.com/babel/babel/pull/13191
  		    // https://github.com/babel/website/pull/2541
  		    def("TopicReference")
  		        .bases("Expression")
  		        .build();
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (babel, babel.exports));
  	return babel.exports;
  }

  var typescript = {exports: {}};

  typescript.exports;

  var hasRequiredTypescript;

  function requireTypescript () {
  	if (hasRequiredTypescript) return typescript.exports;
  	hasRequiredTypescript = 1;
  	(function (module, exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		var tslib_1 = require$$0;
  		var babel_core_1 = tslib_1.__importDefault(requireBabelCore());
  		var type_annotations_1 = tslib_1.__importDefault(requireTypeAnnotations());
  		var types_1 = tslib_1.__importDefault(requireTypes());
  		var shared_1 = tslib_1.__importStar(requireShared());
  		function default_1(fork) {
  		    // Since TypeScript is parsed by Babylon, include the core Babylon types
  		    // but omit the Flow-related types.
  		    fork.use(babel_core_1.default);
  		    fork.use(type_annotations_1.default);
  		    var types = fork.use(types_1.default);
  		    var n = types.namedTypes;
  		    var def = types.Type.def;
  		    var or = types.Type.or;
  		    var defaults = fork.use(shared_1.default).defaults;
  		    var StringLiteral = types.Type.from(function (value, deep) {
  		        if (n.StringLiteral &&
  		            n.StringLiteral.check(value, deep)) {
  		            return true;
  		        }
  		        if (n.Literal &&
  		            n.Literal.check(value, deep) &&
  		            typeof value.value === "string") {
  		            return true;
  		        }
  		        return false;
  		    }, "StringLiteral");
  		    def("TSType")
  		        .bases("Node");
  		    var TSEntityName = or(def("Identifier"), def("TSQualifiedName"));
  		    def("TSTypeReference")
  		        .bases("TSType", "TSHasOptionalTypeParameterInstantiation")
  		        .build("typeName", "typeParameters")
  		        .field("typeName", TSEntityName);
  		    // An abstract (non-buildable) base type that provide a commonly-needed
  		    // optional .typeParameters field.
  		    def("TSHasOptionalTypeParameterInstantiation")
  		        .field("typeParameters", or(def("TSTypeParameterInstantiation"), null), defaults["null"]);
  		    // An abstract (non-buildable) base type that provide a commonly-needed
  		    // optional .typeParameters field.
  		    def("TSHasOptionalTypeParameters")
  		        .field("typeParameters", or(def("TSTypeParameterDeclaration"), null, void 0), defaults["null"]);
  		    // An abstract (non-buildable) base type that provide a commonly-needed
  		    // optional .typeAnnotation field.
  		    def("TSHasOptionalTypeAnnotation")
  		        .field("typeAnnotation", or(def("TSTypeAnnotation"), null), defaults["null"]);
  		    def("TSQualifiedName")
  		        .bases("Node")
  		        .build("left", "right")
  		        .field("left", TSEntityName)
  		        .field("right", TSEntityName);
  		    def("TSAsExpression")
  		        .bases("Expression", "Pattern")
  		        .build("expression", "typeAnnotation")
  		        .field("expression", def("Expression"))
  		        .field("typeAnnotation", def("TSType"))
  		        .field("extra", or({ parenthesized: Boolean }, null), defaults["null"]);
  		    def("TSTypeCastExpression")
  		        .bases("Expression")
  		        .build("expression", "typeAnnotation")
  		        .field("expression", def("Expression"))
  		        .field("typeAnnotation", def("TSType"));
  		    def("TSSatisfiesExpression")
  		        .bases("Expression", "Pattern")
  		        .build("expression", "typeAnnotation")
  		        .field("expression", def("Expression"))
  		        .field("typeAnnotation", def("TSType"));
  		    def("TSNonNullExpression")
  		        .bases("Expression", "Pattern")
  		        .build("expression")
  		        .field("expression", def("Expression"));
  		    [
  		        "TSAnyKeyword",
  		        "TSBigIntKeyword",
  		        "TSBooleanKeyword",
  		        "TSNeverKeyword",
  		        "TSNullKeyword",
  		        "TSNumberKeyword",
  		        "TSObjectKeyword",
  		        "TSStringKeyword",
  		        "TSSymbolKeyword",
  		        "TSUndefinedKeyword",
  		        "TSUnknownKeyword",
  		        "TSVoidKeyword",
  		        "TSIntrinsicKeyword",
  		        "TSThisType",
  		    ].forEach(function (keywordType) {
  		        def(keywordType)
  		            .bases("TSType")
  		            .build();
  		    });
  		    def("TSArrayType")
  		        .bases("TSType")
  		        .build("elementType")
  		        .field("elementType", def("TSType"));
  		    def("TSLiteralType")
  		        .bases("TSType")
  		        .build("literal")
  		        .field("literal", or(def("NumericLiteral"), def("StringLiteral"), def("BooleanLiteral"), def("TemplateLiteral"), def("UnaryExpression"), def("BigIntLiteral")));
  		    def("TemplateLiteral")
  		        // The TemplateLiteral type appears to be reused for TypeScript template
  		        // literal types (instead of introducing a new TSTemplateLiteralType type),
  		        // so we allow the templateLiteral.expressions array to be either all
  		        // expressions or all TypeScript types.
  		        .field("expressions", or([def("Expression")], [def("TSType")]));
  		    ["TSUnionType",
  		        "TSIntersectionType",
  		    ].forEach(function (typeName) {
  		        def(typeName)
  		            .bases("TSType")
  		            .build("types")
  		            .field("types", [def("TSType")]);
  		    });
  		    def("TSConditionalType")
  		        .bases("TSType")
  		        .build("checkType", "extendsType", "trueType", "falseType")
  		        .field("checkType", def("TSType"))
  		        .field("extendsType", def("TSType"))
  		        .field("trueType", def("TSType"))
  		        .field("falseType", def("TSType"));
  		    def("TSInferType")
  		        .bases("TSType")
  		        .build("typeParameter")
  		        .field("typeParameter", def("TSTypeParameter"));
  		    def("TSParenthesizedType")
  		        .bases("TSType")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", def("TSType"));
  		    var ParametersType = [or(def("Identifier"), def("RestElement"), def("ArrayPattern"), def("ObjectPattern"))];
  		    ["TSFunctionType",
  		        "TSConstructorType",
  		    ].forEach(function (typeName) {
  		        def(typeName)
  		            .bases("TSType", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation")
  		            .build("parameters")
  		            .field("parameters", ParametersType);
  		    });
  		    def("TSDeclareFunction")
  		        .bases("Declaration", "TSHasOptionalTypeParameters")
  		        .build("id", "params", "returnType")
  		        .field("declare", Boolean, defaults["false"])
  		        .field("async", Boolean, defaults["false"])
  		        .field("generator", Boolean, defaults["false"])
  		        .field("id", or(def("Identifier"), null), defaults["null"])
  		        .field("params", [def("Pattern")])
  		        // tSFunctionTypeAnnotationCommon
  		        .field("returnType", or(def("TSTypeAnnotation"), def("Noop"), // Still used?
  		    null), defaults["null"]);
  		    def("TSDeclareMethod")
  		        .bases("Declaration", "TSHasOptionalTypeParameters")
  		        .build("key", "params", "returnType")
  		        .field("async", Boolean, defaults["false"])
  		        .field("generator", Boolean, defaults["false"])
  		        .field("params", [def("Pattern")])
  		        // classMethodOrPropertyCommon
  		        .field("abstract", Boolean, defaults["false"])
  		        .field("accessibility", or("public", "private", "protected", void 0), defaults["undefined"])
  		        .field("static", Boolean, defaults["false"])
  		        .field("computed", Boolean, defaults["false"])
  		        .field("optional", Boolean, defaults["false"])
  		        .field("key", or(def("Identifier"), def("StringLiteral"), def("NumericLiteral"), 
  		    // Only allowed if .computed is true.
  		    def("Expression")))
  		        // classMethodOrDeclareMethodCommon
  		        .field("kind", or("get", "set", "method", "constructor"), function getDefault() { return "method"; })
  		        .field("access", // Not "accessibility"?
  		    or("public", "private", "protected", void 0), defaults["undefined"])
  		        .field("decorators", or([def("Decorator")], null), defaults["null"])
  		        // tSFunctionTypeAnnotationCommon
  		        .field("returnType", or(def("TSTypeAnnotation"), def("Noop"), // Still used?
  		    null), defaults["null"]);
  		    def("TSMappedType")
  		        .bases("TSType")
  		        .build("typeParameter", "typeAnnotation")
  		        .field("readonly", or(Boolean, "+", "-"), defaults["false"])
  		        .field("typeParameter", def("TSTypeParameter"))
  		        .field("optional", or(Boolean, "+", "-"), defaults["false"])
  		        .field("typeAnnotation", or(def("TSType"), null), defaults["null"]);
  		    def("TSTupleType")
  		        .bases("TSType")
  		        .build("elementTypes")
  		        .field("elementTypes", [or(def("TSType"), def("TSNamedTupleMember"))]);
  		    def("TSNamedTupleMember")
  		        .bases("TSType")
  		        .build("label", "elementType", "optional")
  		        .field("label", def("Identifier"))
  		        .field("optional", Boolean, defaults["false"])
  		        .field("elementType", def("TSType"));
  		    def("TSRestType")
  		        .bases("TSType")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", def("TSType"));
  		    def("TSOptionalType")
  		        .bases("TSType")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", def("TSType"));
  		    def("TSIndexedAccessType")
  		        .bases("TSType")
  		        .build("objectType", "indexType")
  		        .field("objectType", def("TSType"))
  		        .field("indexType", def("TSType"));
  		    def("TSTypeOperator")
  		        .bases("TSType")
  		        .build("operator")
  		        .field("operator", String)
  		        .field("typeAnnotation", def("TSType"));
  		    def("TSTypeAnnotation")
  		        .bases("Node")
  		        .build("typeAnnotation")
  		        .field("typeAnnotation", or(def("TSType"), def("TSTypeAnnotation")));
  		    def("TSIndexSignature")
  		        .bases("Declaration", "TSHasOptionalTypeAnnotation")
  		        .build("parameters", "typeAnnotation")
  		        .field("parameters", [def("Identifier")]) // Length === 1
  		        .field("readonly", Boolean, defaults["false"]);
  		    def("TSPropertySignature")
  		        .bases("Declaration", "TSHasOptionalTypeAnnotation")
  		        .build("key", "typeAnnotation", "optional")
  		        .field("key", def("Expression"))
  		        .field("computed", Boolean, defaults["false"])
  		        .field("readonly", Boolean, defaults["false"])
  		        .field("optional", Boolean, defaults["false"])
  		        .field("initializer", or(def("Expression"), null), defaults["null"]);
  		    def("TSMethodSignature")
  		        .bases("Declaration", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation")
  		        .build("key", "parameters", "typeAnnotation")
  		        .field("key", def("Expression"))
  		        .field("computed", Boolean, defaults["false"])
  		        .field("optional", Boolean, defaults["false"])
  		        .field("parameters", ParametersType);
  		    def("TSTypePredicate")
  		        .bases("TSTypeAnnotation", "TSType")
  		        .build("parameterName", "typeAnnotation", "asserts")
  		        .field("parameterName", or(def("Identifier"), def("TSThisType")))
  		        .field("typeAnnotation", or(def("TSTypeAnnotation"), null), defaults["null"])
  		        .field("asserts", Boolean, defaults["false"]);
  		    ["TSCallSignatureDeclaration",
  		        "TSConstructSignatureDeclaration",
  		    ].forEach(function (typeName) {
  		        def(typeName)
  		            .bases("Declaration", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation")
  		            .build("parameters", "typeAnnotation")
  		            .field("parameters", ParametersType);
  		    });
  		    def("TSEnumMember")
  		        .bases("Node")
  		        .build("id", "initializer")
  		        .field("id", or(def("Identifier"), StringLiteral))
  		        .field("initializer", or(def("Expression"), null), defaults["null"]);
  		    def("TSTypeQuery")
  		        .bases("TSType")
  		        .build("exprName")
  		        .field("exprName", or(TSEntityName, def("TSImportType")));
  		    // Inferred from Babylon's tsParseTypeMember method.
  		    var TSTypeMember = or(def("TSCallSignatureDeclaration"), def("TSConstructSignatureDeclaration"), def("TSIndexSignature"), def("TSMethodSignature"), def("TSPropertySignature"));
  		    def("TSTypeLiteral")
  		        .bases("TSType")
  		        .build("members")
  		        .field("members", [TSTypeMember]);
  		    def("TSTypeParameter")
  		        .bases("Identifier")
  		        .build("name", "constraint", "default")
  		        .field("name", or(def("Identifier"), String))
  		        .field("constraint", or(def("TSType"), void 0), defaults["undefined"])
  		        .field("default", or(def("TSType"), void 0), defaults["undefined"]);
  		    def("TSTypeAssertion")
  		        .bases("Expression", "Pattern")
  		        .build("typeAnnotation", "expression")
  		        .field("typeAnnotation", def("TSType"))
  		        .field("expression", def("Expression"))
  		        .field("extra", or({ parenthesized: Boolean }, null), defaults["null"]);
  		    def("TSTypeParameterDeclaration")
  		        .bases("Declaration")
  		        .build("params")
  		        .field("params", [def("TSTypeParameter")]);
  		    def("TSInstantiationExpression")
  		        .bases("Expression", "TSHasOptionalTypeParameterInstantiation")
  		        .build("expression", "typeParameters")
  		        .field("expression", def("Expression"));
  		    def("TSTypeParameterInstantiation")
  		        .bases("Node")
  		        .build("params")
  		        .field("params", [def("TSType")]);
  		    def("TSEnumDeclaration")
  		        .bases("Declaration")
  		        .build("id", "members")
  		        .field("id", def("Identifier"))
  		        .field("const", Boolean, defaults["false"])
  		        .field("declare", Boolean, defaults["false"])
  		        .field("members", [def("TSEnumMember")])
  		        .field("initializer", or(def("Expression"), null), defaults["null"]);
  		    def("TSTypeAliasDeclaration")
  		        .bases("Declaration", "TSHasOptionalTypeParameters")
  		        .build("id", "typeAnnotation")
  		        .field("id", def("Identifier"))
  		        .field("declare", Boolean, defaults["false"])
  		        .field("typeAnnotation", def("TSType"));
  		    def("TSModuleBlock")
  		        .bases("Node")
  		        .build("body")
  		        .field("body", [def("Statement")]);
  		    def("TSModuleDeclaration")
  		        .bases("Declaration")
  		        .build("id", "body")
  		        .field("id", or(StringLiteral, TSEntityName))
  		        .field("declare", Boolean, defaults["false"])
  		        .field("global", Boolean, defaults["false"])
  		        .field("body", or(def("TSModuleBlock"), def("TSModuleDeclaration"), null), defaults["null"]);
  		    def("TSImportType")
  		        .bases("TSType", "TSHasOptionalTypeParameterInstantiation")
  		        .build("argument", "qualifier", "typeParameters")
  		        .field("argument", StringLiteral)
  		        .field("qualifier", or(TSEntityName, void 0), defaults["undefined"]);
  		    def("TSImportEqualsDeclaration")
  		        .bases("Declaration")
  		        .build("id", "moduleReference")
  		        .field("id", def("Identifier"))
  		        .field("isExport", Boolean, defaults["false"])
  		        .field("moduleReference", or(TSEntityName, def("TSExternalModuleReference")));
  		    def("TSExternalModuleReference")
  		        .bases("Declaration")
  		        .build("expression")
  		        .field("expression", StringLiteral);
  		    def("TSExportAssignment")
  		        .bases("Statement")
  		        .build("expression")
  		        .field("expression", def("Expression"));
  		    def("TSNamespaceExportDeclaration")
  		        .bases("Declaration")
  		        .build("id")
  		        .field("id", def("Identifier"));
  		    def("TSInterfaceBody")
  		        .bases("Node")
  		        .build("body")
  		        .field("body", [TSTypeMember]);
  		    def("TSExpressionWithTypeArguments")
  		        .bases("TSType", "TSHasOptionalTypeParameterInstantiation")
  		        .build("expression", "typeParameters")
  		        .field("expression", TSEntityName);
  		    def("TSInterfaceDeclaration")
  		        .bases("Declaration", "TSHasOptionalTypeParameters")
  		        .build("id", "body")
  		        .field("id", TSEntityName)
  		        .field("declare", Boolean, defaults["false"])
  		        .field("extends", or([def("TSExpressionWithTypeArguments")], null), defaults["null"])
  		        .field("body", def("TSInterfaceBody"));
  		    def("TSParameterProperty")
  		        .bases("Pattern")
  		        .build("parameter")
  		        .field("accessibility", or("public", "private", "protected", void 0), defaults["undefined"])
  		        .field("readonly", Boolean, defaults["false"])
  		        .field("parameter", or(def("Identifier"), def("AssignmentPattern")));
  		    def("ClassProperty")
  		        .field("access", // Not "accessibility"?
  		    or("public", "private", "protected", void 0), defaults["undefined"]);
  		    def("ClassAccessorProperty")
  		        .bases("Declaration", "TSHasOptionalTypeAnnotation");
  		    // Defined already in es6 and babel-core.
  		    def("ClassBody")
  		        .field("body", [or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassPrivateProperty"), def("ClassAccessorProperty"), def("ClassMethod"), def("ClassPrivateMethod"), def("StaticBlock"), 
  		        // Just need to add these types:
  		        def("TSDeclareMethod"), TSTypeMember)]);
  		}
  		exports.default = default_1;
  		(0, shared_1.maybeSetModuleExports)(function () { return module; });
  		
  	} (typescript, typescript.exports));
  	return typescript.exports;
  }

  var namedTypes$1 = {};

  var hasRequiredNamedTypes;

  function requireNamedTypes () {
  	if (hasRequiredNamedTypes) return namedTypes$1;
  	hasRequiredNamedTypes = 1;
  	(function (exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		exports.namedTypes = void 0;
  		(function (namedTypes) {
  		})(exports.namedTypes || (exports.namedTypes = {}));
  		
  	} (namedTypes$1));
  	return namedTypes$1;
  }

  var hasRequiredMain$1;

  function requireMain$1 () {
  	if (hasRequiredMain$1) return main;
  	hasRequiredMain$1 = 1;
  	(function (exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		exports.visit = exports.use = exports.Type = exports.someField = exports.PathVisitor = exports.Path = exports.NodePath = exports.namedTypes = exports.getSupertypeNames = exports.getFieldValue = exports.getFieldNames = exports.getBuilderName = exports.finalize = exports.eachField = exports.defineMethod = exports.builtInTypes = exports.builders = exports.astNodesAreEquivalent = void 0;
  		var tslib_1 = require$$0;
  		var fork_1 = tslib_1.__importDefault(requireFork());
  		var es_proposals_1 = tslib_1.__importDefault(requireEsProposals());
  		var jsx_1 = tslib_1.__importDefault(requireJsx());
  		var flow_1 = tslib_1.__importDefault(requireFlow());
  		var esprima_1 = tslib_1.__importDefault(requireEsprima$1());
  		var babel_1 = tslib_1.__importDefault(requireBabel());
  		var typescript_1 = tslib_1.__importDefault(requireTypescript());
  		var namedTypes_1 = requireNamedTypes();
  		Object.defineProperty(exports, "namedTypes", { enumerable: true, get: function () { return namedTypes_1.namedTypes; } });
  		var _a = (0, fork_1.default)([
  		    // Feel free to add to or remove from this list of extension modules to
  		    // configure the precise type hierarchy that you need.
  		    es_proposals_1.default,
  		    jsx_1.default,
  		    flow_1.default,
  		    esprima_1.default,
  		    babel_1.default,
  		    typescript_1.default,
  		]), astNodesAreEquivalent = _a.astNodesAreEquivalent, builders = _a.builders, builtInTypes = _a.builtInTypes, defineMethod = _a.defineMethod, eachField = _a.eachField, finalize = _a.finalize, getBuilderName = _a.getBuilderName, getFieldNames = _a.getFieldNames, getFieldValue = _a.getFieldValue, getSupertypeNames = _a.getSupertypeNames, n = _a.namedTypes, NodePath = _a.NodePath, Path = _a.Path, PathVisitor = _a.PathVisitor, someField = _a.someField, Type = _a.Type, use = _a.use, visit = _a.visit;
  		exports.astNodesAreEquivalent = astNodesAreEquivalent;
  		exports.builders = builders;
  		exports.builtInTypes = builtInTypes;
  		exports.defineMethod = defineMethod;
  		exports.eachField = eachField;
  		exports.finalize = finalize;
  		exports.getBuilderName = getBuilderName;
  		exports.getFieldNames = getFieldNames;
  		exports.getFieldValue = getFieldValue;
  		exports.getSupertypeNames = getSupertypeNames;
  		exports.NodePath = NodePath;
  		exports.Path = Path;
  		exports.PathVisitor = PathVisitor;
  		exports.someField = someField;
  		exports.Type = Type;
  		exports.use = use;
  		exports.visit = visit;
  		// Populate the exported fields of the namedTypes namespace, while still
  		// retaining its member types.
  		Object.assign(namedTypes_1.namedTypes, n);
  		
  	} (main));
  	return main;
  }

  var parser = {};

  var tinyInvariant_cjs;
  var hasRequiredTinyInvariant_cjs;

  function requireTinyInvariant_cjs () {
  	if (hasRequiredTinyInvariant_cjs) return tinyInvariant_cjs;
  	hasRequiredTinyInvariant_cjs = 1;
  	var prefix = 'Invariant failed';
  	function invariant(condition, message) {
  	    if (condition) {
  	        return;
  	    }
  	    {
  	        throw new Error(prefix);
  	    }
  	}

  	tinyInvariant_cjs = invariant;
  	return tinyInvariant_cjs;
  }

  var options = {};

  var util = {};

  // mock the sourcemaps api for the browser bundle
  // we do not need sourcemaps with the in browser compilation
  const noop = function () {};

  const SourceMapGenerator = function () {
    return {
      addMapping: noop,
      setSourceContent: noop,
      toJSON: () => ({}),
    }
  };
  const SourceMapConsumer = function () {};
  const SourceNode = function () {};

  var sourcemapMockApi = {
    SourceNode,
    SourceMapConsumer,
    SourceMapGenerator,
  };

  var sourcemapMockApi$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SourceMapConsumer: SourceMapConsumer,
    SourceMapGenerator: SourceMapGenerator,
    SourceNode: SourceNode,
    default: sourcemapMockApi
  });

  var require$$2 = /*@__PURE__*/getAugmentedNamespace(sourcemapMockApi$1);

  const EOL = '\n';

  var osMockApi = /*#__PURE__*/Object.freeze({
    __proto__: null,
    EOL: EOL
  });

  var require$$4 = /*@__PURE__*/getAugmentedNamespace(osMockApi);

  var hasRequiredUtil;

  function requireUtil () {
  	if (hasRequiredUtil) return util;
  	hasRequiredUtil = 1;
  	Object.defineProperty(util, "__esModule", { value: true });
  	util.isTrailingCommaEnabled = util.getParentExportDeclaration = util.isExportDeclaration = util.fixFaultyLocations = util.getTrueLoc = util.composeSourceMaps = util.copyPos = util.comparePos = util.getUnionOfKeys = util.getOption = util.isBrowser = util.getLineTerminator = void 0;
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var types = tslib_1.__importStar(requireMain$1());
  	var n = types.namedTypes;
  	var source_map_1 = tslib_1.__importDefault(require$$2);
  	var SourceMapConsumer = source_map_1.default.SourceMapConsumer;
  	var SourceMapGenerator = source_map_1.default.SourceMapGenerator;
  	var hasOwn = Object.prototype.hasOwnProperty;
  	function getLineTerminator() {
  	    return isBrowser() ? "\n" : require$$4.EOL || "\n";
  	}
  	util.getLineTerminator = getLineTerminator;
  	function isBrowser() {
  	    return (typeof window !== "undefined" && typeof window.document !== "undefined");
  	}
  	util.isBrowser = isBrowser;
  	function getOption(options, key, defaultValue) {
  	    if (options && hasOwn.call(options, key)) {
  	        return options[key];
  	    }
  	    return defaultValue;
  	}
  	util.getOption = getOption;
  	function getUnionOfKeys() {
  	    var args = [];
  	    for (var _i = 0; _i < arguments.length; _i++) {
  	        args[_i] = arguments[_i];
  	    }
  	    var result = {};
  	    var argc = args.length;
  	    for (var i = 0; i < argc; ++i) {
  	        var keys = Object.keys(args[i]);
  	        var keyCount = keys.length;
  	        for (var j = 0; j < keyCount; ++j) {
  	            result[keys[j]] = true;
  	        }
  	    }
  	    return result;
  	}
  	util.getUnionOfKeys = getUnionOfKeys;
  	function comparePos(pos1, pos2) {
  	    return pos1.line - pos2.line || pos1.column - pos2.column;
  	}
  	util.comparePos = comparePos;
  	function copyPos(pos) {
  	    return {
  	        line: pos.line,
  	        column: pos.column,
  	    };
  	}
  	util.copyPos = copyPos;
  	function composeSourceMaps(formerMap, latterMap) {
  	    if (formerMap) {
  	        if (!latterMap) {
  	            return formerMap;
  	        }
  	    }
  	    else {
  	        return latterMap || null;
  	    }
  	    var smcFormer = new SourceMapConsumer(formerMap);
  	    var smcLatter = new SourceMapConsumer(latterMap);
  	    var smg = new SourceMapGenerator({
  	        file: latterMap.file,
  	        sourceRoot: latterMap.sourceRoot,
  	    });
  	    var sourcesToContents = {};
  	    smcLatter.eachMapping(function (mapping) {
  	        var origPos = smcFormer.originalPositionFor({
  	            line: mapping.originalLine,
  	            column: mapping.originalColumn,
  	        });
  	        var sourceName = origPos.source;
  	        if (sourceName === null) {
  	            return;
  	        }
  	        smg.addMapping({
  	            source: sourceName,
  	            original: copyPos(origPos),
  	            generated: {
  	                line: mapping.generatedLine,
  	                column: mapping.generatedColumn,
  	            },
  	            name: mapping.name,
  	        });
  	        var sourceContent = smcFormer.sourceContentFor(sourceName);
  	        if (sourceContent && !hasOwn.call(sourcesToContents, sourceName)) {
  	            sourcesToContents[sourceName] = sourceContent;
  	            smg.setSourceContent(sourceName, sourceContent);
  	        }
  	    });
  	    return smg.toJSON();
  	}
  	util.composeSourceMaps = composeSourceMaps;
  	function getTrueLoc(node, lines) {
  	    // It's possible that node is newly-created (not parsed by Esprima),
  	    // in which case it probably won't have a .loc property (or an
  	    // .original property for that matter). That's fine; we'll just
  	    // pretty-print it as usual.
  	    if (!node.loc) {
  	        return null;
  	    }
  	    var result = {
  	        start: node.loc.start,
  	        end: node.loc.end,
  	    };
  	    function include(node) {
  	        expandLoc(result, node.loc);
  	    }
  	    // If the node is an export declaration and its .declaration has any
  	    // decorators, their locations might contribute to the true start/end
  	    // positions of the export declaration node.
  	    if (node.declaration &&
  	        node.declaration.decorators &&
  	        isExportDeclaration(node)) {
  	        node.declaration.decorators.forEach(include);
  	    }
  	    if (comparePos(result.start, result.end) < 0) {
  	        // Trim leading whitespace.
  	        result.start = copyPos(result.start);
  	        lines.skipSpaces(result.start, false, true);
  	        if (comparePos(result.start, result.end) < 0) {
  	            // Trim trailing whitespace, if the end location is not already the
  	            // same as the start location.
  	            result.end = copyPos(result.end);
  	            lines.skipSpaces(result.end, true, true);
  	        }
  	    }
  	    // If the node has any comments, their locations might contribute to
  	    // the true start/end positions of the node.
  	    if (node.comments) {
  	        node.comments.forEach(include);
  	    }
  	    return result;
  	}
  	util.getTrueLoc = getTrueLoc;
  	function expandLoc(parentLoc, childLoc) {
  	    if (parentLoc && childLoc) {
  	        if (comparePos(childLoc.start, parentLoc.start) < 0) {
  	            parentLoc.start = childLoc.start;
  	        }
  	        if (comparePos(parentLoc.end, childLoc.end) < 0) {
  	            parentLoc.end = childLoc.end;
  	        }
  	    }
  	}
  	function fixFaultyLocations(node, lines) {
  	    var loc = node.loc;
  	    if (loc) {
  	        if (loc.start.line < 1) {
  	            loc.start.line = 1;
  	        }
  	        if (loc.end.line < 1) {
  	            loc.end.line = 1;
  	        }
  	    }
  	    if (node.type === "File") {
  	        // Babylon returns File nodes whose .loc.{start,end} do not include
  	        // leading or trailing whitespace.
  	        loc.start = lines.firstPos();
  	        loc.end = lines.lastPos();
  	    }
  	    fixForLoopHead(node, lines);
  	    fixTemplateLiteral(node, lines);
  	    if (loc && node.decorators) {
  	        // Expand the .loc of the node responsible for printing the decorators
  	        // (here, the decorated node) so that it includes node.decorators.
  	        node.decorators.forEach(function (decorator) {
  	            expandLoc(loc, decorator.loc);
  	        });
  	    }
  	    else if (node.declaration && isExportDeclaration(node)) {
  	        // Nullify .loc information for the child declaration so that we never
  	        // try to reprint it without also reprinting the export declaration.
  	        node.declaration.loc = null;
  	        // Expand the .loc of the node responsible for printing the decorators
  	        // (here, the export declaration) so that it includes node.decorators.
  	        var decorators = node.declaration.decorators;
  	        if (decorators) {
  	            decorators.forEach(function (decorator) {
  	                expandLoc(loc, decorator.loc);
  	            });
  	        }
  	    }
  	    else if ((n.MethodDefinition && n.MethodDefinition.check(node)) ||
  	        (n.Property.check(node) && (node.method || node.shorthand))) {
  	        // If the node is a MethodDefinition or a .method or .shorthand
  	        // Property, then the location information stored in
  	        // node.value.loc is very likely untrustworthy (just the {body}
  	        // part of a method, or nothing in the case of shorthand
  	        // properties), so we null out that information to prevent
  	        // accidental reuse of bogus source code during reprinting.
  	        node.value.loc = null;
  	        if (n.FunctionExpression.check(node.value)) {
  	            // FunctionExpression method values should be anonymous,
  	            // because their .id fields are ignored anyway.
  	            node.value.id = null;
  	        }
  	    }
  	    else if (node.type === "ObjectTypeProperty") {
  	        var loc_1 = node.loc;
  	        var end = loc_1 && loc_1.end;
  	        if (end) {
  	            end = copyPos(end);
  	            if (lines.prevPos(end) && lines.charAt(end) === ",") {
  	                // Some parsers accidentally include trailing commas in the
  	                // .loc.end information for ObjectTypeProperty nodes.
  	                if ((end = lines.skipSpaces(end, true, true))) {
  	                    loc_1.end = end;
  	                }
  	            }
  	        }
  	    }
  	}
  	util.fixFaultyLocations = fixFaultyLocations;
  	function fixForLoopHead(node, lines) {
  	    if (node.type !== "ForStatement") {
  	        return;
  	    }
  	    function fix(child) {
  	        var loc = child && child.loc;
  	        var start = loc && loc.start;
  	        var end = loc && copyPos(loc.end);
  	        while (start && end && comparePos(start, end) < 0) {
  	            lines.prevPos(end);
  	            if (lines.charAt(end) === ";") {
  	                // Update child.loc.end to *exclude* the ';' character.
  	                loc.end.line = end.line;
  	                loc.end.column = end.column;
  	            }
  	            else {
  	                break;
  	            }
  	        }
  	    }
  	    fix(node.init);
  	    fix(node.test);
  	    fix(node.update);
  	}
  	function fixTemplateLiteral(node, lines) {
  	    if (node.type !== "TemplateLiteral") {
  	        return;
  	    }
  	    if (node.quasis.length === 0) {
  	        // If there are no quasi elements, then there is nothing to fix.
  	        return;
  	    }
  	    // node.loc is not present when using export default with a template literal
  	    if (node.loc) {
  	        // First we need to exclude the opening ` from the .loc of the first
  	        // quasi element, in case the parser accidentally decided to include it.
  	        var afterLeftBackTickPos = copyPos(node.loc.start);
  	        (0, tiny_invariant_1.default)(lines.charAt(afterLeftBackTickPos) === "`");
  	        (0, tiny_invariant_1.default)(lines.nextPos(afterLeftBackTickPos));
  	        var firstQuasi = node.quasis[0];
  	        if (comparePos(firstQuasi.loc.start, afterLeftBackTickPos) < 0) {
  	            firstQuasi.loc.start = afterLeftBackTickPos;
  	        }
  	        // Next we need to exclude the closing ` from the .loc of the last quasi
  	        // element, in case the parser accidentally decided to include it.
  	        var rightBackTickPos = copyPos(node.loc.end);
  	        (0, tiny_invariant_1.default)(lines.prevPos(rightBackTickPos));
  	        (0, tiny_invariant_1.default)(lines.charAt(rightBackTickPos) === "`");
  	        var lastQuasi = node.quasis[node.quasis.length - 1];
  	        if (comparePos(rightBackTickPos, lastQuasi.loc.end) < 0) {
  	            lastQuasi.loc.end = rightBackTickPos;
  	        }
  	    }
  	    // Now we need to exclude ${ and } characters from the .loc's of all
  	    // quasi elements, since some parsers accidentally include them.
  	    node.expressions.forEach(function (expr, i) {
  	        // Rewind from expr.loc.start over any whitespace and the ${ that
  	        // precedes the expression. The position of the $ should be the same
  	        // as the .loc.end of the preceding quasi element, but some parsers
  	        // accidentally include the ${ in the .loc of the quasi element.
  	        var dollarCurlyPos = lines.skipSpaces(expr.loc.start, true, false);
  	        if (lines.prevPos(dollarCurlyPos) &&
  	            lines.charAt(dollarCurlyPos) === "{" &&
  	            lines.prevPos(dollarCurlyPos) &&
  	            lines.charAt(dollarCurlyPos) === "$") {
  	            var quasiBefore = node.quasis[i];
  	            if (comparePos(dollarCurlyPos, quasiBefore.loc.end) < 0) {
  	                quasiBefore.loc.end = dollarCurlyPos;
  	            }
  	        }
  	        // Likewise, some parsers accidentally include the } that follows
  	        // the expression in the .loc of the following quasi element.
  	        var rightCurlyPos = lines.skipSpaces(expr.loc.end, false, false);
  	        if (lines.charAt(rightCurlyPos) === "}") {
  	            (0, tiny_invariant_1.default)(lines.nextPos(rightCurlyPos));
  	            // Now rightCurlyPos is technically the position just after the }.
  	            var quasiAfter = node.quasis[i + 1];
  	            if (comparePos(quasiAfter.loc.start, rightCurlyPos) < 0) {
  	                quasiAfter.loc.start = rightCurlyPos;
  	            }
  	        }
  	    });
  	}
  	function isExportDeclaration(node) {
  	    if (node)
  	        switch (node.type) {
  	            case "ExportDeclaration":
  	            case "ExportDefaultDeclaration":
  	            case "ExportDefaultSpecifier":
  	            case "DeclareExportDeclaration":
  	            case "ExportNamedDeclaration":
  	            case "ExportAllDeclaration":
  	                return true;
  	        }
  	    return false;
  	}
  	util.isExportDeclaration = isExportDeclaration;
  	function getParentExportDeclaration(path) {
  	    var parentNode = path.getParentNode();
  	    if (path.getName() === "declaration" && isExportDeclaration(parentNode)) {
  	        return parentNode;
  	    }
  	    return null;
  	}
  	util.getParentExportDeclaration = getParentExportDeclaration;
  	function isTrailingCommaEnabled(options, context) {
  	    var trailingComma = options.trailingComma;
  	    if (typeof trailingComma === "object") {
  	        return !!trailingComma[context];
  	    }
  	    return !!trailingComma;
  	}
  	util.isTrailingCommaEnabled = isTrailingCommaEnabled;
  	return util;
  }

  var esprima = {};

  var require$$7 = undefined;

  var hasRequiredEsprima;

  function requireEsprima () {
  	if (hasRequiredEsprima) return esprima;
  	hasRequiredEsprima = 1;
  	Object.defineProperty(esprima, "__esModule", { value: true });
  	esprima.parse = void 0;
  	// This module is suitable for passing as options.parser when calling
  	// recast.parse to process ECMAScript code with Esprima:
  	//
  	//   const ast = recast.parse(source, {
  	//     parser: require("recast/parsers/esprima")
  	//   });
  	//
  	var util_1 = requireUtil();
  	function parse(source, options) {
  	    var comments = [];
  	    var ast = require$$7.parse(source, {
  	        loc: true,
  	        locations: true,
  	        comment: true,
  	        onComment: comments,
  	        range: (0, util_1.getOption)(options, "range", false),
  	        tolerant: (0, util_1.getOption)(options, "tolerant", true),
  	        tokens: true,
  	        jsx: (0, util_1.getOption)(options, "jsx", false),
  	        sourceType: (0, util_1.getOption)(options, "sourceType", "module"),
  	    });
  	    if (!Array.isArray(ast.comments)) {
  	        ast.comments = comments;
  	    }
  	    return ast;
  	}
  	esprima.parse = parse;
  	return esprima;
  }

  var hasRequiredOptions;

  function requireOptions () {
  	if (hasRequiredOptions) return options;
  	hasRequiredOptions = 1;
  	Object.defineProperty(options, "__esModule", { value: true });
  	options.normalize = void 0;
  	var util_1 = requireUtil();
  	var defaults = {
  	    parser: requireEsprima(),
  	    tabWidth: 4,
  	    useTabs: false,
  	    reuseWhitespace: true,
  	    lineTerminator: (0, util_1.getLineTerminator)(),
  	    wrapColumn: 74,
  	    sourceFileName: null,
  	    sourceMapName: null,
  	    sourceRoot: null,
  	    inputSourceMap: null,
  	    range: false,
  	    tolerant: true,
  	    quote: null,
  	    trailingComma: false,
  	    arrayBracketSpacing: false,
  	    objectCurlySpacing: true,
  	    arrowParensAlways: false,
  	    flowObjectCommas: true,
  	    tokens: true,
  	};
  	var hasOwn = defaults.hasOwnProperty;
  	// Copy options and fill in default values.
  	function normalize(opts) {
  	    var options = opts || defaults;
  	    function get(key) {
  	        return hasOwn.call(options, key) ? options[key] : defaults[key];
  	    }
  	    return {
  	        tabWidth: +get("tabWidth"),
  	        useTabs: !!get("useTabs"),
  	        reuseWhitespace: !!get("reuseWhitespace"),
  	        lineTerminator: get("lineTerminator"),
  	        wrapColumn: Math.max(get("wrapColumn"), 0),
  	        sourceFileName: get("sourceFileName"),
  	        sourceMapName: get("sourceMapName"),
  	        sourceRoot: get("sourceRoot"),
  	        inputSourceMap: get("inputSourceMap"),
  	        parser: get("esprima") || get("parser"),
  	        range: get("range"),
  	        tolerant: get("tolerant"),
  	        quote: get("quote"),
  	        trailingComma: get("trailingComma"),
  	        arrayBracketSpacing: get("arrayBracketSpacing"),
  	        objectCurlySpacing: get("objectCurlySpacing"),
  	        arrowParensAlways: get("arrowParensAlways"),
  	        flowObjectCommas: get("flowObjectCommas"),
  	        tokens: !!get("tokens"),
  	    };
  	}
  	options.normalize = normalize;
  	return options;
  }

  var lines = {};

  var mapping = {};

  var hasRequiredMapping;

  function requireMapping () {
  	if (hasRequiredMapping) return mapping;
  	hasRequiredMapping = 1;
  	Object.defineProperty(mapping, "__esModule", { value: true });
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var util_1 = requireUtil();
  	var Mapping = /** @class */ (function () {
  	    function Mapping(sourceLines, sourceLoc, targetLoc) {
  	        if (targetLoc === void 0) { targetLoc = sourceLoc; }
  	        this.sourceLines = sourceLines;
  	        this.sourceLoc = sourceLoc;
  	        this.targetLoc = targetLoc;
  	    }
  	    Mapping.prototype.slice = function (lines, start, end) {
  	        if (end === void 0) { end = lines.lastPos(); }
  	        var sourceLines = this.sourceLines;
  	        var sourceLoc = this.sourceLoc;
  	        var targetLoc = this.targetLoc;
  	        function skip(name) {
  	            var sourceFromPos = sourceLoc[name];
  	            var targetFromPos = targetLoc[name];
  	            var targetToPos = start;
  	            if (name === "end") {
  	                targetToPos = end;
  	            }
  	            else {
  	                (0, tiny_invariant_1.default)(name === "start");
  	            }
  	            return skipChars(sourceLines, sourceFromPos, lines, targetFromPos, targetToPos);
  	        }
  	        if ((0, util_1.comparePos)(start, targetLoc.start) <= 0) {
  	            if ((0, util_1.comparePos)(targetLoc.end, end) <= 0) {
  	                targetLoc = {
  	                    start: subtractPos(targetLoc.start, start.line, start.column),
  	                    end: subtractPos(targetLoc.end, start.line, start.column),
  	                };
  	                // The sourceLoc can stay the same because the contents of the
  	                // targetLoc have not changed.
  	            }
  	            else if ((0, util_1.comparePos)(end, targetLoc.start) <= 0) {
  	                return null;
  	            }
  	            else {
  	                sourceLoc = {
  	                    start: sourceLoc.start,
  	                    end: skip("end"),
  	                };
  	                targetLoc = {
  	                    start: subtractPos(targetLoc.start, start.line, start.column),
  	                    end: subtractPos(end, start.line, start.column),
  	                };
  	            }
  	        }
  	        else {
  	            if ((0, util_1.comparePos)(targetLoc.end, start) <= 0) {
  	                return null;
  	            }
  	            if ((0, util_1.comparePos)(targetLoc.end, end) <= 0) {
  	                sourceLoc = {
  	                    start: skip("start"),
  	                    end: sourceLoc.end,
  	                };
  	                targetLoc = {
  	                    // Same as subtractPos(start, start.line, start.column):
  	                    start: { line: 1, column: 0 },
  	                    end: subtractPos(targetLoc.end, start.line, start.column),
  	                };
  	            }
  	            else {
  	                sourceLoc = {
  	                    start: skip("start"),
  	                    end: skip("end"),
  	                };
  	                targetLoc = {
  	                    // Same as subtractPos(start, start.line, start.column):
  	                    start: { line: 1, column: 0 },
  	                    end: subtractPos(end, start.line, start.column),
  	                };
  	            }
  	        }
  	        return new Mapping(this.sourceLines, sourceLoc, targetLoc);
  	    };
  	    Mapping.prototype.add = function (line, column) {
  	        return new Mapping(this.sourceLines, this.sourceLoc, {
  	            start: addPos(this.targetLoc.start, line, column),
  	            end: addPos(this.targetLoc.end, line, column),
  	        });
  	    };
  	    Mapping.prototype.subtract = function (line, column) {
  	        return new Mapping(this.sourceLines, this.sourceLoc, {
  	            start: subtractPos(this.targetLoc.start, line, column),
  	            end: subtractPos(this.targetLoc.end, line, column),
  	        });
  	    };
  	    Mapping.prototype.indent = function (by, skipFirstLine, noNegativeColumns) {
  	        if (skipFirstLine === void 0) { skipFirstLine = false; }
  	        if (noNegativeColumns === void 0) { noNegativeColumns = false; }
  	        if (by === 0) {
  	            return this;
  	        }
  	        var targetLoc = this.targetLoc;
  	        var startLine = targetLoc.start.line;
  	        var endLine = targetLoc.end.line;
  	        if (skipFirstLine && startLine === 1 && endLine === 1) {
  	            return this;
  	        }
  	        targetLoc = {
  	            start: targetLoc.start,
  	            end: targetLoc.end,
  	        };
  	        if (!skipFirstLine || startLine > 1) {
  	            var startColumn = targetLoc.start.column + by;
  	            targetLoc.start = {
  	                line: startLine,
  	                column: noNegativeColumns ? Math.max(0, startColumn) : startColumn,
  	            };
  	        }
  	        if (!skipFirstLine || endLine > 1) {
  	            var endColumn = targetLoc.end.column + by;
  	            targetLoc.end = {
  	                line: endLine,
  	                column: noNegativeColumns ? Math.max(0, endColumn) : endColumn,
  	            };
  	        }
  	        return new Mapping(this.sourceLines, this.sourceLoc, targetLoc);
  	    };
  	    return Mapping;
  	}());
  	mapping.default = Mapping;
  	function addPos(toPos, line, column) {
  	    return {
  	        line: toPos.line + line - 1,
  	        column: toPos.line === 1 ? toPos.column + column : toPos.column,
  	    };
  	}
  	function subtractPos(fromPos, line, column) {
  	    return {
  	        line: fromPos.line - line + 1,
  	        column: fromPos.line === line ? fromPos.column - column : fromPos.column,
  	    };
  	}
  	function skipChars(sourceLines, sourceFromPos, targetLines, targetFromPos, targetToPos) {
  	    var targetComparison = (0, util_1.comparePos)(targetFromPos, targetToPos);
  	    if (targetComparison === 0) {
  	        // Trivial case: no characters to skip.
  	        return sourceFromPos;
  	    }
  	    var sourceCursor, targetCursor;
  	    if (targetComparison < 0) {
  	        // Skipping forward.
  	        sourceCursor =
  	            sourceLines.skipSpaces(sourceFromPos) || sourceLines.lastPos();
  	        targetCursor =
  	            targetLines.skipSpaces(targetFromPos) || targetLines.lastPos();
  	        var lineDiff = targetToPos.line - targetCursor.line;
  	        sourceCursor.line += lineDiff;
  	        targetCursor.line += lineDiff;
  	        if (lineDiff > 0) {
  	            // If jumping to later lines, reset columns to the beginnings
  	            // of those lines.
  	            sourceCursor.column = 0;
  	            targetCursor.column = 0;
  	        }
  	        else {
  	            (0, tiny_invariant_1.default)(lineDiff === 0);
  	        }
  	        while ((0, util_1.comparePos)(targetCursor, targetToPos) < 0 &&
  	            targetLines.nextPos(targetCursor, true)) {
  	            (0, tiny_invariant_1.default)(sourceLines.nextPos(sourceCursor, true));
  	            (0, tiny_invariant_1.default)(sourceLines.charAt(sourceCursor) === targetLines.charAt(targetCursor));
  	        }
  	    }
  	    else {
  	        // Skipping backward.
  	        sourceCursor =
  	            sourceLines.skipSpaces(sourceFromPos, true) || sourceLines.firstPos();
  	        targetCursor =
  	            targetLines.skipSpaces(targetFromPos, true) || targetLines.firstPos();
  	        var lineDiff = targetToPos.line - targetCursor.line;
  	        sourceCursor.line += lineDiff;
  	        targetCursor.line += lineDiff;
  	        if (lineDiff < 0) {
  	            // If jumping to earlier lines, reset columns to the ends of
  	            // those lines.
  	            sourceCursor.column = sourceLines.getLineLength(sourceCursor.line);
  	            targetCursor.column = targetLines.getLineLength(targetCursor.line);
  	        }
  	        else {
  	            (0, tiny_invariant_1.default)(lineDiff === 0);
  	        }
  	        while ((0, util_1.comparePos)(targetToPos, targetCursor) < 0 &&
  	            targetLines.prevPos(targetCursor, true)) {
  	            (0, tiny_invariant_1.default)(sourceLines.prevPos(sourceCursor, true));
  	            (0, tiny_invariant_1.default)(sourceLines.charAt(sourceCursor) === targetLines.charAt(targetCursor));
  	        }
  	    }
  	    return sourceCursor;
  	}
  	return mapping;
  }

  var hasRequiredLines;

  function requireLines () {
  	if (hasRequiredLines) return lines;
  	hasRequiredLines = 1;
  	Object.defineProperty(lines, "__esModule", { value: true });
  	lines.concat = lines.fromString = lines.countSpaces = lines.Lines = void 0;
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var source_map_1 = tslib_1.__importDefault(require$$2);
  	var options_1 = requireOptions();
  	var util_1 = requireUtil();
  	var mapping_1 = tslib_1.__importDefault(requireMapping());
  	var Lines = /** @class */ (function () {
  	    function Lines(infos, sourceFileName) {
  	        if (sourceFileName === void 0) { sourceFileName = null; }
  	        this.infos = infos;
  	        this.mappings = [];
  	        this.cachedSourceMap = null;
  	        this.cachedTabWidth = void 0;
  	        (0, tiny_invariant_1.default)(infos.length > 0);
  	        this.length = infos.length;
  	        this.name = sourceFileName || null;
  	        if (this.name) {
  	            this.mappings.push(new mapping_1.default(this, {
  	                start: this.firstPos(),
  	                end: this.lastPos(),
  	            }));
  	        }
  	    }
  	    Lines.prototype.toString = function (options) {
  	        return this.sliceString(this.firstPos(), this.lastPos(), options);
  	    };
  	    Lines.prototype.getSourceMap = function (sourceMapName, sourceRoot) {
  	        if (!sourceMapName) {
  	            // Although we could make up a name or generate an anonymous
  	            // source map, instead we assume that any consumer who does not
  	            // provide a name does not actually want a source map.
  	            return null;
  	        }
  	        var targetLines = this;
  	        function updateJSON(json) {
  	            json = json || {};
  	            json.file = sourceMapName;
  	            if (sourceRoot) {
  	                json.sourceRoot = sourceRoot;
  	            }
  	            return json;
  	        }
  	        if (targetLines.cachedSourceMap) {
  	            // Since Lines objects are immutable, we can reuse any source map
  	            // that was previously generated. Nevertheless, we return a new
  	            // JSON object here to protect the cached source map from outside
  	            // modification.
  	            return updateJSON(targetLines.cachedSourceMap.toJSON());
  	        }
  	        var smg = new source_map_1.default.SourceMapGenerator(updateJSON());
  	        var sourcesToContents = {};
  	        targetLines.mappings.forEach(function (mapping) {
  	            var sourceCursor = mapping.sourceLines.skipSpaces(mapping.sourceLoc.start) ||
  	                mapping.sourceLines.lastPos();
  	            var targetCursor = targetLines.skipSpaces(mapping.targetLoc.start) ||
  	                targetLines.lastPos();
  	            while ((0, util_1.comparePos)(sourceCursor, mapping.sourceLoc.end) < 0 &&
  	                (0, util_1.comparePos)(targetCursor, mapping.targetLoc.end) < 0) {
  	                var sourceChar = mapping.sourceLines.charAt(sourceCursor);
  	                var targetChar = targetLines.charAt(targetCursor);
  	                (0, tiny_invariant_1.default)(sourceChar === targetChar);
  	                var sourceName = mapping.sourceLines.name;
  	                // Add mappings one character at a time for maximum resolution.
  	                smg.addMapping({
  	                    source: sourceName,
  	                    original: { line: sourceCursor.line, column: sourceCursor.column },
  	                    generated: { line: targetCursor.line, column: targetCursor.column },
  	                });
  	                if (!hasOwn.call(sourcesToContents, sourceName)) {
  	                    var sourceContent = mapping.sourceLines.toString();
  	                    smg.setSourceContent(sourceName, sourceContent);
  	                    sourcesToContents[sourceName] = sourceContent;
  	                }
  	                targetLines.nextPos(targetCursor, true);
  	                mapping.sourceLines.nextPos(sourceCursor, true);
  	            }
  	        });
  	        targetLines.cachedSourceMap = smg;
  	        return smg.toJSON();
  	    };
  	    Lines.prototype.bootstrapCharAt = function (pos) {
  	        (0, tiny_invariant_1.default)(typeof pos === "object");
  	        (0, tiny_invariant_1.default)(typeof pos.line === "number");
  	        (0, tiny_invariant_1.default)(typeof pos.column === "number");
  	        var line = pos.line, column = pos.column, strings = this.toString().split(lineTerminatorSeqExp), string = strings[line - 1];
  	        if (typeof string === "undefined")
  	            return "";
  	        if (column === string.length && line < strings.length)
  	            return "\n";
  	        if (column >= string.length)
  	            return "";
  	        return string.charAt(column);
  	    };
  	    Lines.prototype.charAt = function (pos) {
  	        (0, tiny_invariant_1.default)(typeof pos === "object");
  	        (0, tiny_invariant_1.default)(typeof pos.line === "number");
  	        (0, tiny_invariant_1.default)(typeof pos.column === "number");
  	        var line = pos.line, column = pos.column, secret = this, infos = secret.infos, info = infos[line - 1], c = column;
  	        if (typeof info === "undefined" || c < 0)
  	            return "";
  	        var indent = this.getIndentAt(line);
  	        if (c < indent)
  	            return " ";
  	        c += info.sliceStart - indent;
  	        if (c === info.sliceEnd && line < this.length)
  	            return "\n";
  	        if (c >= info.sliceEnd)
  	            return "";
  	        return info.line.charAt(c);
  	    };
  	    Lines.prototype.stripMargin = function (width, skipFirstLine) {
  	        if (width === 0)
  	            return this;
  	        (0, tiny_invariant_1.default)(width > 0, "negative margin: " + width);
  	        if (skipFirstLine && this.length === 1)
  	            return this;
  	        var lines = new Lines(this.infos.map(function (info, i) {
  	            if (info.line && (i > 0 || !skipFirstLine)) {
  	                info = tslib_1.__assign(tslib_1.__assign({}, info), { indent: Math.max(0, info.indent - width) });
  	            }
  	            return info;
  	        }));
  	        if (this.mappings.length > 0) {
  	            var newMappings_1 = lines.mappings;
  	            (0, tiny_invariant_1.default)(newMappings_1.length === 0);
  	            this.mappings.forEach(function (mapping) {
  	                newMappings_1.push(mapping.indent(width, skipFirstLine, true));
  	            });
  	        }
  	        return lines;
  	    };
  	    Lines.prototype.indent = function (by) {
  	        if (by === 0) {
  	            return this;
  	        }
  	        var lines = new Lines(this.infos.map(function (info) {
  	            if (info.line && !info.locked) {
  	                info = tslib_1.__assign(tslib_1.__assign({}, info), { indent: info.indent + by });
  	            }
  	            return info;
  	        }));
  	        if (this.mappings.length > 0) {
  	            var newMappings_2 = lines.mappings;
  	            (0, tiny_invariant_1.default)(newMappings_2.length === 0);
  	            this.mappings.forEach(function (mapping) {
  	                newMappings_2.push(mapping.indent(by));
  	            });
  	        }
  	        return lines;
  	    };
  	    Lines.prototype.indentTail = function (by) {
  	        if (by === 0) {
  	            return this;
  	        }
  	        if (this.length < 2) {
  	            return this;
  	        }
  	        var lines = new Lines(this.infos.map(function (info, i) {
  	            if (i > 0 && info.line && !info.locked) {
  	                info = tslib_1.__assign(tslib_1.__assign({}, info), { indent: info.indent + by });
  	            }
  	            return info;
  	        }));
  	        if (this.mappings.length > 0) {
  	            var newMappings_3 = lines.mappings;
  	            (0, tiny_invariant_1.default)(newMappings_3.length === 0);
  	            this.mappings.forEach(function (mapping) {
  	                newMappings_3.push(mapping.indent(by, true));
  	            });
  	        }
  	        return lines;
  	    };
  	    Lines.prototype.lockIndentTail = function () {
  	        if (this.length < 2) {
  	            return this;
  	        }
  	        return new Lines(this.infos.map(function (info, i) { return (tslib_1.__assign(tslib_1.__assign({}, info), { locked: i > 0 })); }));
  	    };
  	    Lines.prototype.getIndentAt = function (line) {
  	        (0, tiny_invariant_1.default)(line >= 1, "no line " + line + " (line numbers start from 1)");
  	        return Math.max(this.infos[line - 1].indent, 0);
  	    };
  	    Lines.prototype.guessTabWidth = function () {
  	        if (typeof this.cachedTabWidth === "number") {
  	            return this.cachedTabWidth;
  	        }
  	        var counts = []; // Sparse array.
  	        var lastIndent = 0;
  	        for (var line = 1, last = this.length; line <= last; ++line) {
  	            var info = this.infos[line - 1];
  	            var sliced = info.line.slice(info.sliceStart, info.sliceEnd);
  	            // Whitespace-only lines don't tell us much about the likely tab
  	            // width of this code.
  	            if (isOnlyWhitespace(sliced)) {
  	                continue;
  	            }
  	            var diff = Math.abs(info.indent - lastIndent);
  	            counts[diff] = ~~counts[diff] + 1;
  	            lastIndent = info.indent;
  	        }
  	        var maxCount = -1;
  	        var result = 2;
  	        for (var tabWidth = 1; tabWidth < counts.length; tabWidth += 1) {
  	            if (hasOwn.call(counts, tabWidth) && counts[tabWidth] > maxCount) {
  	                maxCount = counts[tabWidth];
  	                result = tabWidth;
  	            }
  	        }
  	        return (this.cachedTabWidth = result);
  	    };
  	    // Determine if the list of lines has a first line that starts with a //
  	    // or /* comment. If this is the case, the code may need to be wrapped in
  	    // parens to avoid ASI issues.
  	    Lines.prototype.startsWithComment = function () {
  	        if (this.infos.length === 0) {
  	            return false;
  	        }
  	        var firstLineInfo = this.infos[0], sliceStart = firstLineInfo.sliceStart, sliceEnd = firstLineInfo.sliceEnd, firstLine = firstLineInfo.line.slice(sliceStart, sliceEnd).trim();
  	        return (firstLine.length === 0 ||
  	            firstLine.slice(0, 2) === "//" ||
  	            firstLine.slice(0, 2) === "/*");
  	    };
  	    Lines.prototype.isOnlyWhitespace = function () {
  	        return isOnlyWhitespace(this.toString());
  	    };
  	    Lines.prototype.isPrecededOnlyByWhitespace = function (pos) {
  	        var info = this.infos[pos.line - 1];
  	        var indent = Math.max(info.indent, 0);
  	        var diff = pos.column - indent;
  	        if (diff <= 0) {
  	            // If pos.column does not exceed the indentation amount, then
  	            // there must be only whitespace before it.
  	            return true;
  	        }
  	        var start = info.sliceStart;
  	        var end = Math.min(start + diff, info.sliceEnd);
  	        var prefix = info.line.slice(start, end);
  	        return isOnlyWhitespace(prefix);
  	    };
  	    Lines.prototype.getLineLength = function (line) {
  	        var info = this.infos[line - 1];
  	        return this.getIndentAt(line) + info.sliceEnd - info.sliceStart;
  	    };
  	    Lines.prototype.nextPos = function (pos, skipSpaces) {
  	        if (skipSpaces === void 0) { skipSpaces = false; }
  	        var l = Math.max(pos.line, 0), c = Math.max(pos.column, 0);
  	        if (c < this.getLineLength(l)) {
  	            pos.column += 1;
  	            return skipSpaces ? !!this.skipSpaces(pos, false, true) : true;
  	        }
  	        if (l < this.length) {
  	            pos.line += 1;
  	            pos.column = 0;
  	            return skipSpaces ? !!this.skipSpaces(pos, false, true) : true;
  	        }
  	        return false;
  	    };
  	    Lines.prototype.prevPos = function (pos, skipSpaces) {
  	        if (skipSpaces === void 0) { skipSpaces = false; }
  	        var l = pos.line, c = pos.column;
  	        if (c < 1) {
  	            l -= 1;
  	            if (l < 1)
  	                return false;
  	            c = this.getLineLength(l);
  	        }
  	        else {
  	            c = Math.min(c - 1, this.getLineLength(l));
  	        }
  	        pos.line = l;
  	        pos.column = c;
  	        return skipSpaces ? !!this.skipSpaces(pos, true, true) : true;
  	    };
  	    Lines.prototype.firstPos = function () {
  	        // Trivial, but provided for completeness.
  	        return { line: 1, column: 0 };
  	    };
  	    Lines.prototype.lastPos = function () {
  	        return {
  	            line: this.length,
  	            column: this.getLineLength(this.length),
  	        };
  	    };
  	    Lines.prototype.skipSpaces = function (pos, backward, modifyInPlace) {
  	        if (backward === void 0) { backward = false; }
  	        if (modifyInPlace === void 0) { modifyInPlace = false; }
  	        if (pos) {
  	            pos = modifyInPlace
  	                ? pos
  	                : {
  	                    line: pos.line,
  	                    column: pos.column,
  	                };
  	        }
  	        else if (backward) {
  	            pos = this.lastPos();
  	        }
  	        else {
  	            pos = this.firstPos();
  	        }
  	        if (backward) {
  	            while (this.prevPos(pos)) {
  	                if (!isOnlyWhitespace(this.charAt(pos)) && this.nextPos(pos)) {
  	                    return pos;
  	                }
  	            }
  	            return null;
  	        }
  	        else {
  	            while (isOnlyWhitespace(this.charAt(pos))) {
  	                if (!this.nextPos(pos)) {
  	                    return null;
  	                }
  	            }
  	            return pos;
  	        }
  	    };
  	    Lines.prototype.trimLeft = function () {
  	        var pos = this.skipSpaces(this.firstPos(), false, true);
  	        return pos ? this.slice(pos) : emptyLines;
  	    };
  	    Lines.prototype.trimRight = function () {
  	        var pos = this.skipSpaces(this.lastPos(), true, true);
  	        return pos ? this.slice(this.firstPos(), pos) : emptyLines;
  	    };
  	    Lines.prototype.trim = function () {
  	        var start = this.skipSpaces(this.firstPos(), false, true);
  	        if (start === null) {
  	            return emptyLines;
  	        }
  	        var end = this.skipSpaces(this.lastPos(), true, true);
  	        if (end === null) {
  	            return emptyLines;
  	        }
  	        return this.slice(start, end);
  	    };
  	    Lines.prototype.eachPos = function (callback, startPos, skipSpaces) {
  	        if (startPos === void 0) { startPos = this.firstPos(); }
  	        if (skipSpaces === void 0) { skipSpaces = false; }
  	        var pos = this.firstPos();
  	        if (startPos) {
  	            (pos.line = startPos.line), (pos.column = startPos.column);
  	        }
  	        if (skipSpaces && !this.skipSpaces(pos, false, true)) {
  	            return; // Encountered nothing but spaces.
  	        }
  	        do
  	            callback.call(this, pos);
  	        while (this.nextPos(pos, skipSpaces));
  	    };
  	    Lines.prototype.bootstrapSlice = function (start, end) {
  	        var strings = this.toString()
  	            .split(lineTerminatorSeqExp)
  	            .slice(start.line - 1, end.line);
  	        if (strings.length > 0) {
  	            strings.push(strings.pop().slice(0, end.column));
  	            strings[0] = strings[0].slice(start.column);
  	        }
  	        return fromString(strings.join("\n"));
  	    };
  	    Lines.prototype.slice = function (start, end) {
  	        if (!end) {
  	            if (!start) {
  	                // The client seems to want a copy of this Lines object, but
  	                // Lines objects are immutable, so it's perfectly adequate to
  	                // return the same object.
  	                return this;
  	            }
  	            // Slice to the end if no end position was provided.
  	            end = this.lastPos();
  	        }
  	        if (!start) {
  	            throw new Error("cannot slice with end but not start");
  	        }
  	        var sliced = this.infos.slice(start.line - 1, end.line);
  	        if (start.line === end.line) {
  	            sliced[0] = sliceInfo(sliced[0], start.column, end.column);
  	        }
  	        else {
  	            (0, tiny_invariant_1.default)(start.line < end.line);
  	            sliced[0] = sliceInfo(sliced[0], start.column);
  	            sliced.push(sliceInfo(sliced.pop(), 0, end.column));
  	        }
  	        var lines = new Lines(sliced);
  	        if (this.mappings.length > 0) {
  	            var newMappings_4 = lines.mappings;
  	            (0, tiny_invariant_1.default)(newMappings_4.length === 0);
  	            this.mappings.forEach(function (mapping) {
  	                var sliced = mapping.slice(this, start, end);
  	                if (sliced) {
  	                    newMappings_4.push(sliced);
  	                }
  	            }, this);
  	        }
  	        return lines;
  	    };
  	    Lines.prototype.bootstrapSliceString = function (start, end, options) {
  	        return this.slice(start, end).toString(options);
  	    };
  	    Lines.prototype.sliceString = function (start, end, options) {
  	        if (start === void 0) { start = this.firstPos(); }
  	        if (end === void 0) { end = this.lastPos(); }
  	        var _a = (0, options_1.normalize)(options), tabWidth = _a.tabWidth, useTabs = _a.useTabs, reuseWhitespace = _a.reuseWhitespace, lineTerminator = _a.lineTerminator;
  	        var parts = [];
  	        for (var line = start.line; line <= end.line; ++line) {
  	            var info = this.infos[line - 1];
  	            if (line === start.line) {
  	                if (line === end.line) {
  	                    info = sliceInfo(info, start.column, end.column);
  	                }
  	                else {
  	                    info = sliceInfo(info, start.column);
  	                }
  	            }
  	            else if (line === end.line) {
  	                info = sliceInfo(info, 0, end.column);
  	            }
  	            var indent = Math.max(info.indent, 0);
  	            var before_1 = info.line.slice(0, info.sliceStart);
  	            if (reuseWhitespace &&
  	                isOnlyWhitespace(before_1) &&
  	                countSpaces(before_1, tabWidth) === indent) {
  	                // Reuse original spaces if the indentation is correct.
  	                parts.push(info.line.slice(0, info.sliceEnd));
  	                continue;
  	            }
  	            var tabs = 0;
  	            var spaces = indent;
  	            if (useTabs) {
  	                tabs = Math.floor(indent / tabWidth);
  	                spaces -= tabs * tabWidth;
  	            }
  	            var result = "";
  	            if (tabs > 0) {
  	                result += new Array(tabs + 1).join("\t");
  	            }
  	            if (spaces > 0) {
  	                result += new Array(spaces + 1).join(" ");
  	            }
  	            result += info.line.slice(info.sliceStart, info.sliceEnd);
  	            parts.push(result);
  	        }
  	        return parts.join(lineTerminator);
  	    };
  	    Lines.prototype.isEmpty = function () {
  	        return this.length < 2 && this.getLineLength(1) < 1;
  	    };
  	    Lines.prototype.join = function (elements) {
  	        var separator = this;
  	        var infos = [];
  	        var mappings = [];
  	        var prevInfo;
  	        function appendLines(linesOrNull) {
  	            if (linesOrNull === null) {
  	                return;
  	            }
  	            if (prevInfo) {
  	                var info = linesOrNull.infos[0];
  	                var indent = new Array(info.indent + 1).join(" ");
  	                var prevLine_1 = infos.length;
  	                var prevColumn_1 = Math.max(prevInfo.indent, 0) +
  	                    prevInfo.sliceEnd -
  	                    prevInfo.sliceStart;
  	                prevInfo.line =
  	                    prevInfo.line.slice(0, prevInfo.sliceEnd) +
  	                        indent +
  	                        info.line.slice(info.sliceStart, info.sliceEnd);
  	                // If any part of a line is indentation-locked, the whole line
  	                // will be indentation-locked.
  	                prevInfo.locked = prevInfo.locked || info.locked;
  	                prevInfo.sliceEnd = prevInfo.line.length;
  	                if (linesOrNull.mappings.length > 0) {
  	                    linesOrNull.mappings.forEach(function (mapping) {
  	                        mappings.push(mapping.add(prevLine_1, prevColumn_1));
  	                    });
  	                }
  	            }
  	            else if (linesOrNull.mappings.length > 0) {
  	                mappings.push.apply(mappings, linesOrNull.mappings);
  	            }
  	            linesOrNull.infos.forEach(function (info, i) {
  	                if (!prevInfo || i > 0) {
  	                    prevInfo = tslib_1.__assign({}, info);
  	                    infos.push(prevInfo);
  	                }
  	            });
  	        }
  	        function appendWithSeparator(linesOrNull, i) {
  	            if (i > 0)
  	                appendLines(separator);
  	            appendLines(linesOrNull);
  	        }
  	        elements
  	            .map(function (elem) {
  	            var lines = fromString(elem);
  	            if (lines.isEmpty())
  	                return null;
  	            return lines;
  	        })
  	            .forEach(function (linesOrNull, i) {
  	            if (separator.isEmpty()) {
  	                appendLines(linesOrNull);
  	            }
  	            else {
  	                appendWithSeparator(linesOrNull, i);
  	            }
  	        });
  	        if (infos.length < 1)
  	            return emptyLines;
  	        var lines = new Lines(infos);
  	        lines.mappings = mappings;
  	        return lines;
  	    };
  	    Lines.prototype.concat = function () {
  	        var args = [];
  	        for (var _i = 0; _i < arguments.length; _i++) {
  	            args[_i] = arguments[_i];
  	        }
  	        var list = [this];
  	        list.push.apply(list, args);
  	        (0, tiny_invariant_1.default)(list.length === args.length + 1);
  	        return emptyLines.join(list);
  	    };
  	    return Lines;
  	}());
  	lines.Lines = Lines;
  	var fromStringCache = {};
  	var hasOwn = fromStringCache.hasOwnProperty;
  	var maxCacheKeyLen = 10;
  	function countSpaces(spaces, tabWidth) {
  	    var count = 0;
  	    var len = spaces.length;
  	    for (var i = 0; i < len; ++i) {
  	        switch (spaces.charCodeAt(i)) {
  	            case 9: {
  	                // '\t'
  	                (0, tiny_invariant_1.default)(typeof tabWidth === "number");
  	                (0, tiny_invariant_1.default)(tabWidth > 0);
  	                var next = Math.ceil(count / tabWidth) * tabWidth;
  	                if (next === count) {
  	                    count += tabWidth;
  	                }
  	                else {
  	                    count = next;
  	                }
  	                break;
  	            }
  	            case 11: // '\v'
  	            case 12: // '\f'
  	            case 13: // '\r'
  	            case 0xfeff: // zero-width non-breaking space
  	                // These characters contribute nothing to indentation.
  	                break;
  	            case 32: // ' '
  	            default:
  	                // Treat all other whitespace like ' '.
  	                count += 1;
  	                break;
  	        }
  	    }
  	    return count;
  	}
  	lines.countSpaces = countSpaces;
  	var leadingSpaceExp = /^\s*/;
  	// As specified here: http://www.ecma-international.org/ecma-262/6.0/#sec-line-terminators
  	var lineTerminatorSeqExp = /\u000D\u000A|\u000D(?!\u000A)|\u000A|\u2028|\u2029/;
  	/**
  	 * @param {Object} options - Options object that configures printing.
  	 */
  	function fromString(string, options) {
  	    if (string instanceof Lines)
  	        return string;
  	    string += "";
  	    var tabWidth = options && options.tabWidth;
  	    var tabless = string.indexOf("\t") < 0;
  	    var cacheable = !options && tabless && string.length <= maxCacheKeyLen;
  	    (0, tiny_invariant_1.default)(tabWidth || tabless, "No tab width specified but encountered tabs in string\n" + string);
  	    if (cacheable && hasOwn.call(fromStringCache, string))
  	        return fromStringCache[string];
  	    var lines = new Lines(string.split(lineTerminatorSeqExp).map(function (line) {
  	        // TODO: handle null exec result
  	        var spaces = leadingSpaceExp.exec(line)[0];
  	        return {
  	            line: line,
  	            indent: countSpaces(spaces, tabWidth),
  	            // Boolean indicating whether this line can be reindented.
  	            locked: false,
  	            sliceStart: spaces.length,
  	            sliceEnd: line.length,
  	        };
  	    }), (0, options_1.normalize)(options).sourceFileName);
  	    if (cacheable)
  	        fromStringCache[string] = lines;
  	    return lines;
  	}
  	lines.fromString = fromString;
  	function isOnlyWhitespace(string) {
  	    return !/\S/.test(string);
  	}
  	function sliceInfo(info, startCol, endCol) {
  	    var sliceStart = info.sliceStart;
  	    var sliceEnd = info.sliceEnd;
  	    var indent = Math.max(info.indent, 0);
  	    var lineLength = indent + sliceEnd - sliceStart;
  	    if (typeof endCol === "undefined") {
  	        endCol = lineLength;
  	    }
  	    startCol = Math.max(startCol, 0);
  	    endCol = Math.min(endCol, lineLength);
  	    endCol = Math.max(endCol, startCol);
  	    if (endCol < indent) {
  	        indent = endCol;
  	        sliceEnd = sliceStart;
  	    }
  	    else {
  	        sliceEnd -= lineLength - endCol;
  	    }
  	    lineLength = endCol;
  	    lineLength -= startCol;
  	    if (startCol < indent) {
  	        indent -= startCol;
  	    }
  	    else {
  	        startCol -= indent;
  	        indent = 0;
  	        sliceStart += startCol;
  	    }
  	    (0, tiny_invariant_1.default)(indent >= 0);
  	    (0, tiny_invariant_1.default)(sliceStart <= sliceEnd);
  	    (0, tiny_invariant_1.default)(lineLength === indent + sliceEnd - sliceStart);
  	    if (info.indent === indent &&
  	        info.sliceStart === sliceStart &&
  	        info.sliceEnd === sliceEnd) {
  	        return info;
  	    }
  	    return {
  	        line: info.line,
  	        indent: indent,
  	        // A destructive slice always unlocks indentation.
  	        locked: false,
  	        sliceStart: sliceStart,
  	        sliceEnd: sliceEnd,
  	    };
  	}
  	function concat(elements) {
  	    return emptyLines.join(elements);
  	}
  	lines.concat = concat;
  	// The emptyLines object needs to be created all the way down here so that
  	// Lines.prototype will be fully populated.
  	var emptyLines = fromString("");
  	return lines;
  }

  var comments = {};

  var hasRequiredComments;

  function requireComments () {
  	if (hasRequiredComments) return comments;
  	hasRequiredComments = 1;
  	Object.defineProperty(comments, "__esModule", { value: true });
  	comments.printComments = comments.attach = void 0;
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var types = tslib_1.__importStar(requireMain$1());
  	var n = types.namedTypes;
  	var isArray = types.builtInTypes.array;
  	var isObject = types.builtInTypes.object;
  	var lines_1 = requireLines();
  	var util_1 = requireUtil();
  	var childNodesCache = new WeakMap();
  	// TODO Move a non-caching implementation of this function into ast-types,
  	// and implement a caching wrapper function here.
  	function getSortedChildNodes(node, lines, resultArray) {
  	    if (!node) {
  	        return resultArray;
  	    }
  	    // The .loc checks below are sensitive to some of the problems that
  	    // are fixed by this utility function. Specifically, if it decides to
  	    // set node.loc to null, indicating that the node's .loc information
  	    // is unreliable, then we don't want to add node to the resultArray.
  	    (0, util_1.fixFaultyLocations)(node, lines);
  	    if (resultArray) {
  	        if (n.Node.check(node) && n.SourceLocation.check(node.loc)) {
  	            // This reverse insertion sort almost always takes constant
  	            // time because we almost always (maybe always?) append the
  	            // nodes in order anyway.
  	            var i = resultArray.length - 1;
  	            for (; i >= 0; --i) {
  	                var child = resultArray[i];
  	                if (child &&
  	                    child.loc &&
  	                    (0, util_1.comparePos)(child.loc.end, node.loc.start) <= 0) {
  	                    break;
  	                }
  	            }
  	            resultArray.splice(i + 1, 0, node);
  	            return resultArray;
  	        }
  	    }
  	    else {
  	        var childNodes = childNodesCache.get(node);
  	        if (childNodes) {
  	            return childNodes;
  	        }
  	    }
  	    var names;
  	    if (isArray.check(node)) {
  	        names = Object.keys(node);
  	    }
  	    else if (isObject.check(node)) {
  	        names = types.getFieldNames(node);
  	    }
  	    else {
  	        return resultArray;
  	    }
  	    if (!resultArray) {
  	        childNodesCache.set(node, (resultArray = []));
  	    }
  	    for (var i = 0, nameCount = names.length; i < nameCount; ++i) {
  	        getSortedChildNodes(node[names[i]], lines, resultArray);
  	    }
  	    return resultArray;
  	}
  	// As efficiently as possible, decorate the comment object with
  	// .precedingNode, .enclosingNode, and/or .followingNode properties, at
  	// least one of which is guaranteed to be defined.
  	function decorateComment(node, comment, lines) {
  	    var childNodes = getSortedChildNodes(node, lines);
  	    // Time to dust off the old binary search robes and wizard hat.
  	    var left = 0;
  	    var right = childNodes && childNodes.length;
  	    var precedingNode;
  	    var followingNode;
  	    while (typeof right === "number" && left < right) {
  	        var middle = (left + right) >> 1;
  	        var child = childNodes[middle];
  	        if ((0, util_1.comparePos)(child.loc.start, comment.loc.start) <= 0 &&
  	            (0, util_1.comparePos)(comment.loc.end, child.loc.end) <= 0) {
  	            // The comment is completely contained by this child node.
  	            decorateComment((comment.enclosingNode = child), comment, lines);
  	            return; // Abandon the binary search at this level.
  	        }
  	        if ((0, util_1.comparePos)(child.loc.end, comment.loc.start) <= 0) {
  	            // This child node falls completely before the comment.
  	            // Because we will never consider this node or any nodes
  	            // before it again, this node must be the closest preceding
  	            // node we have encountered so far.
  	            precedingNode = child;
  	            left = middle + 1;
  	            continue;
  	        }
  	        if ((0, util_1.comparePos)(comment.loc.end, child.loc.start) <= 0) {
  	            // This child node falls completely after the comment.
  	            // Because we will never consider this node or any nodes after
  	            // it again, this node must be the closest following node we
  	            // have encountered so far.
  	            followingNode = child;
  	            right = middle;
  	            continue;
  	        }
  	        throw new Error("Comment location overlaps with node location");
  	    }
  	    if (precedingNode) {
  	        comment.precedingNode = precedingNode;
  	    }
  	    if (followingNode) {
  	        comment.followingNode = followingNode;
  	    }
  	}
  	function attach(comments, ast, lines) {
  	    if (!isArray.check(comments)) {
  	        return;
  	    }
  	    var tiesToBreak = [];
  	    comments.forEach(function (comment) {
  	        comment.loc.lines = lines;
  	        decorateComment(ast, comment, lines);
  	        var pn = comment.precedingNode;
  	        var en = comment.enclosingNode;
  	        var fn = comment.followingNode;
  	        if (pn && fn) {
  	            var tieCount = tiesToBreak.length;
  	            if (tieCount > 0) {
  	                var lastTie = tiesToBreak[tieCount - 1];
  	                (0, tiny_invariant_1.default)((lastTie.precedingNode === comment.precedingNode) ===
  	                    (lastTie.followingNode === comment.followingNode));
  	                if (lastTie.followingNode !== comment.followingNode) {
  	                    breakTies(tiesToBreak, lines);
  	                }
  	            }
  	            tiesToBreak.push(comment);
  	        }
  	        else if (pn) {
  	            // No contest: we have a trailing comment.
  	            breakTies(tiesToBreak, lines);
  	            addTrailingComment(pn, comment);
  	        }
  	        else if (fn) {
  	            // No contest: we have a leading comment.
  	            breakTies(tiesToBreak, lines);
  	            addLeadingComment(fn, comment);
  	        }
  	        else if (en) {
  	            // The enclosing node has no child nodes at all, so what we
  	            // have here is a dangling comment, e.g. [/* crickets */].
  	            breakTies(tiesToBreak, lines);
  	            addDanglingComment(en, comment);
  	        }
  	        else {
  	            throw new Error("AST contains no nodes at all?");
  	        }
  	    });
  	    breakTies(tiesToBreak, lines);
  	    comments.forEach(function (comment) {
  	        // These node references were useful for breaking ties, but we
  	        // don't need them anymore, and they create cycles in the AST that
  	        // may lead to infinite recursion if we don't delete them here.
  	        delete comment.precedingNode;
  	        delete comment.enclosingNode;
  	        delete comment.followingNode;
  	    });
  	}
  	comments.attach = attach;
  	function breakTies(tiesToBreak, lines) {
  	    var tieCount = tiesToBreak.length;
  	    if (tieCount === 0) {
  	        return;
  	    }
  	    var pn = tiesToBreak[0].precedingNode;
  	    var fn = tiesToBreak[0].followingNode;
  	    var gapEndPos = fn.loc.start;
  	    // Iterate backwards through tiesToBreak, examining the gaps
  	    // between the tied comments. In order to qualify as leading, a
  	    // comment must be separated from fn by an unbroken series of
  	    // whitespace-only gaps (or other comments).
  	    var indexOfFirstLeadingComment = tieCount;
  	    var comment;
  	    for (; indexOfFirstLeadingComment > 0; --indexOfFirstLeadingComment) {
  	        comment = tiesToBreak[indexOfFirstLeadingComment - 1];
  	        (0, tiny_invariant_1.default)(comment.precedingNode === pn);
  	        (0, tiny_invariant_1.default)(comment.followingNode === fn);
  	        var gap = lines.sliceString(comment.loc.end, gapEndPos);
  	        if (/\S/.test(gap)) {
  	            // The gap string contained something other than whitespace.
  	            break;
  	        }
  	        gapEndPos = comment.loc.start;
  	    }
  	    while (indexOfFirstLeadingComment <= tieCount &&
  	        (comment = tiesToBreak[indexOfFirstLeadingComment]) &&
  	        // If the comment is a //-style comment and indented more
  	        // deeply than the node itself, reconsider it as trailing.
  	        (comment.type === "Line" || comment.type === "CommentLine") &&
  	        comment.loc.start.column > fn.loc.start.column) {
  	        ++indexOfFirstLeadingComment;
  	    }
  	    if (indexOfFirstLeadingComment) {
  	        var enclosingNode = tiesToBreak[indexOfFirstLeadingComment - 1].enclosingNode;
  	        if ((enclosingNode === null || enclosingNode === void 0 ? void 0 : enclosingNode.type) === "CallExpression") {
  	            --indexOfFirstLeadingComment;
  	        }
  	    }
  	    tiesToBreak.forEach(function (comment, i) {
  	        if (i < indexOfFirstLeadingComment) {
  	            addTrailingComment(pn, comment);
  	        }
  	        else {
  	            addLeadingComment(fn, comment);
  	        }
  	    });
  	    tiesToBreak.length = 0;
  	}
  	function addCommentHelper(node, comment) {
  	    var comments = node.comments || (node.comments = []);
  	    comments.push(comment);
  	}
  	function addLeadingComment(node, comment) {
  	    comment.leading = true;
  	    comment.trailing = false;
  	    addCommentHelper(node, comment);
  	}
  	function addDanglingComment(node, comment) {
  	    comment.leading = false;
  	    comment.trailing = false;
  	    addCommentHelper(node, comment);
  	}
  	function addTrailingComment(node, comment) {
  	    comment.leading = false;
  	    comment.trailing = true;
  	    addCommentHelper(node, comment);
  	}
  	function printLeadingComment(commentPath, print) {
  	    var comment = commentPath.getValue();
  	    n.Comment.assert(comment);
  	    var loc = comment.loc;
  	    var lines = loc && loc.lines;
  	    var parts = [print(commentPath)];
  	    if (comment.trailing) {
  	        // When we print trailing comments as leading comments, we don't
  	        // want to bring any trailing spaces along.
  	        parts.push("\n");
  	    }
  	    else if (lines instanceof lines_1.Lines) {
  	        var trailingSpace = lines.slice(loc.end, lines.skipSpaces(loc.end) || lines.lastPos());
  	        if (trailingSpace.length === 1) {
  	            // If the trailing space contains no newlines, then we want to
  	            // preserve it exactly as we found it.
  	            parts.push(trailingSpace);
  	        }
  	        else {
  	            // If the trailing space contains newlines, then replace it
  	            // with just that many newlines, with all other spaces removed.
  	            parts.push(new Array(trailingSpace.length).join("\n"));
  	        }
  	    }
  	    else {
  	        parts.push("\n");
  	    }
  	    return (0, lines_1.concat)(parts);
  	}
  	function printTrailingComment(commentPath, print) {
  	    var comment = commentPath.getValue(commentPath);
  	    n.Comment.assert(comment);
  	    var loc = comment.loc;
  	    var lines = loc && loc.lines;
  	    var parts = [];
  	    if (lines instanceof lines_1.Lines) {
  	        var fromPos = lines.skipSpaces(loc.start, true) || lines.firstPos();
  	        var leadingSpace = lines.slice(fromPos, loc.start);
  	        if (leadingSpace.length === 1) {
  	            // If the leading space contains no newlines, then we want to
  	            // preserve it exactly as we found it.
  	            parts.push(leadingSpace);
  	        }
  	        else {
  	            // If the leading space contains newlines, then replace it
  	            // with just that many newlines, sans all other spaces.
  	            parts.push(new Array(leadingSpace.length).join("\n"));
  	        }
  	    }
  	    parts.push(print(commentPath));
  	    return (0, lines_1.concat)(parts);
  	}
  	function printComments(path, print) {
  	    var value = path.getValue();
  	    var innerLines = print(path);
  	    var comments = n.Node.check(value) && types.getFieldValue(value, "comments");
  	    if (!comments || comments.length === 0) {
  	        return innerLines;
  	    }
  	    var leadingParts = [];
  	    var trailingParts = [innerLines];
  	    path.each(function (commentPath) {
  	        var comment = commentPath.getValue();
  	        var leading = types.getFieldValue(comment, "leading");
  	        var trailing = types.getFieldValue(comment, "trailing");
  	        if (leading ||
  	            (trailing &&
  	                !(n.Statement.check(value) ||
  	                    comment.type === "Block" ||
  	                    comment.type === "CommentBlock"))) {
  	            leadingParts.push(printLeadingComment(commentPath, print));
  	        }
  	        else if (trailing) {
  	            trailingParts.push(printTrailingComment(commentPath, print));
  	        }
  	    }, "comments");
  	    leadingParts.push.apply(leadingParts, trailingParts);
  	    return (0, lines_1.concat)(leadingParts);
  	}
  	comments.printComments = printComments;
  	return comments;
  }

  var hasRequiredParser;

  function requireParser () {
  	if (hasRequiredParser) return parser;
  	hasRequiredParser = 1;
  	Object.defineProperty(parser, "__esModule", { value: true });
  	parser.parse = void 0;
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var types = tslib_1.__importStar(requireMain$1());
  	var b = types.builders;
  	var isObject = types.builtInTypes.object;
  	var isArray = types.builtInTypes.array;
  	var options_1 = requireOptions();
  	var lines_1 = requireLines();
  	var comments_1 = requireComments();
  	var util = tslib_1.__importStar(requireUtil());
  	function parse(source, options) {
  	    options = (0, options_1.normalize)(options);
  	    var lines = (0, lines_1.fromString)(source, options);
  	    var sourceWithoutTabs = lines.toString({
  	        tabWidth: options.tabWidth,
  	        reuseWhitespace: false,
  	        useTabs: false,
  	    });
  	    var comments = [];
  	    var ast = options.parser.parse(sourceWithoutTabs, {
  	        jsx: true,
  	        loc: true,
  	        locations: true,
  	        range: options.range,
  	        comment: true,
  	        onComment: comments,
  	        tolerant: util.getOption(options, "tolerant", true),
  	        ecmaVersion: 6,
  	        sourceType: util.getOption(options, "sourceType", "module"),
  	    });
  	    // Use ast.tokens if possible, and otherwise fall back to the Esprima
  	    // tokenizer. All the preconfigured ../parsers/* expose ast.tokens
  	    // automatically, but custom parsers might need additional configuration
  	    // to avoid this fallback.
  	    var tokens = Array.isArray(ast.tokens)
  	        ? ast.tokens
  	        : require$$7.tokenize(sourceWithoutTabs, {
  	            loc: true,
  	        });
  	    // We will reattach the tokens array to the file object below.
  	    delete ast.tokens;
  	    // Make sure every token has a token.value string.
  	    tokens.forEach(function (token) {
  	        if (typeof token.value !== "string") {
  	            token.value = lines.sliceString(token.loc.start, token.loc.end);
  	        }
  	    });
  	    if (Array.isArray(ast.comments)) {
  	        comments = ast.comments;
  	        delete ast.comments;
  	    }
  	    if (ast.loc) {
  	        // If the source was empty, some parsers give loc.{start,end}.line
  	        // values of 0, instead of the minimum of 1.
  	        util.fixFaultyLocations(ast, lines);
  	    }
  	    else {
  	        ast.loc = {
  	            start: lines.firstPos(),
  	            end: lines.lastPos(),
  	        };
  	    }
  	    ast.loc.lines = lines;
  	    ast.loc.indent = 0;
  	    var file;
  	    var program;
  	    if (ast.type === "Program") {
  	        program = ast;
  	        // In order to ensure we reprint leading and trailing program
  	        // comments, wrap the original Program node with a File node. Only
  	        // ESTree parsers (Acorn and Esprima) return a Program as the root AST
  	        // node. Most other (Babylon-like) parsers return a File.
  	        file = b.file(ast, options.sourceFileName || null);
  	        file.loc = {
  	            start: lines.firstPos(),
  	            end: lines.lastPos(),
  	            lines: lines,
  	            indent: 0,
  	        };
  	    }
  	    else if (ast.type === "File") {
  	        file = ast;
  	        program = file.program;
  	    }
  	    // Expose file.tokens unless the caller passed false for options.tokens.
  	    if (options.tokens) {
  	        file.tokens = tokens;
  	    }
  	    // Expand the Program's .loc to include all comments (not just those
  	    // attached to the Program node, as its children may have comments as
  	    // well), since sometimes program.loc.{start,end} will coincide with the
  	    // .loc.{start,end} of the first and last *statements*, mistakenly
  	    // excluding comments that fall outside that region.
  	    var trueProgramLoc = util.getTrueLoc({
  	        type: program.type,
  	        loc: program.loc,
  	        body: [],
  	        comments: comments,
  	    }, lines);
  	    program.loc.start = trueProgramLoc.start;
  	    program.loc.end = trueProgramLoc.end;
  	    // Passing file.program here instead of just file means that initial
  	    // comments will be attached to program.body[0] instead of program.
  	    (0, comments_1.attach)(comments, program.body.length ? file.program : file, lines);
  	    // Return a copy of the original AST so that any changes made may be
  	    // compared to the original.
  	    return new TreeCopier(lines, tokens).copy(file);
  	}
  	parser.parse = parse;
  	var TreeCopier = function TreeCopier(lines, tokens) {
  	    (0, tiny_invariant_1.default)(this instanceof TreeCopier);
  	    this.lines = lines;
  	    this.tokens = tokens;
  	    this.startTokenIndex = 0;
  	    this.endTokenIndex = tokens.length;
  	    this.indent = 0;
  	    this.seen = new Map();
  	};
  	var TCp = TreeCopier.prototype;
  	TCp.copy = function (node) {
  	    if (this.seen.has(node)) {
  	        return this.seen.get(node);
  	    }
  	    if (isArray.check(node)) {
  	        var copy_1 = new Array(node.length);
  	        this.seen.set(node, copy_1);
  	        node.forEach(function (item, i) {
  	            copy_1[i] = this.copy(item);
  	        }, this);
  	        return copy_1;
  	    }
  	    if (!isObject.check(node)) {
  	        return node;
  	    }
  	    util.fixFaultyLocations(node, this.lines);
  	    var copy = Object.create(Object.getPrototypeOf(node), {
  	        original: {
  	            // Provide a link from the copy to the original.
  	            value: node,
  	            configurable: false,
  	            enumerable: false,
  	            writable: true,
  	        },
  	    });
  	    this.seen.set(node, copy);
  	    var loc = node.loc;
  	    var oldIndent = this.indent;
  	    var newIndent = oldIndent;
  	    var oldStartTokenIndex = this.startTokenIndex;
  	    var oldEndTokenIndex = this.endTokenIndex;
  	    if (loc) {
  	        // When node is a comment, we set node.loc.indent to
  	        // node.loc.start.column so that, when/if we print the comment by
  	        // itself, we can strip that much whitespace from the left margin of
  	        // the comment. This only really matters for multiline Block comments,
  	        // but it doesn't hurt for Line comments.
  	        if (node.type === "Block" ||
  	            node.type === "Line" ||
  	            node.type === "CommentBlock" ||
  	            node.type === "CommentLine" ||
  	            this.lines.isPrecededOnlyByWhitespace(loc.start)) {
  	            newIndent = this.indent = loc.start.column;
  	        }
  	        // Every node.loc has a reference to the original source lines as well
  	        // as a complete list of source tokens.
  	        loc.lines = this.lines;
  	        loc.tokens = this.tokens;
  	        loc.indent = newIndent;
  	        // Set loc.start.token and loc.end.token such that
  	        // loc.tokens.slice(loc.start.token, loc.end.token) returns a list of
  	        // all the tokens that make up this node.
  	        this.findTokenRange(loc);
  	    }
  	    var keys = Object.keys(node);
  	    var keyCount = keys.length;
  	    for (var i = 0; i < keyCount; ++i) {
  	        var key = keys[i];
  	        if (key === "loc") {
  	            copy[key] = node[key];
  	        }
  	        else if (key === "tokens" && node.type === "File") {
  	            // Preserve file.tokens (uncopied) in case client code cares about
  	            // it, even though Recast ignores it when reprinting.
  	            copy[key] = node[key];
  	        }
  	        else {
  	            copy[key] = this.copy(node[key]);
  	        }
  	    }
  	    this.indent = oldIndent;
  	    this.startTokenIndex = oldStartTokenIndex;
  	    this.endTokenIndex = oldEndTokenIndex;
  	    return copy;
  	};
  	// If we didn't have any idea where in loc.tokens to look for tokens
  	// contained by this loc, a binary search would be appropriate, but
  	// because we maintain this.startTokenIndex and this.endTokenIndex as we
  	// traverse the AST, we only need to make small (linear) adjustments to
  	// those indexes with each recursive iteration.
  	TCp.findTokenRange = function (loc) {
  	    // In the unlikely event that loc.tokens[this.startTokenIndex] starts
  	    // *after* loc.start, we need to rewind this.startTokenIndex first.
  	    while (this.startTokenIndex > 0) {
  	        var token = loc.tokens[this.startTokenIndex];
  	        if (util.comparePos(loc.start, token.loc.start) < 0) {
  	            --this.startTokenIndex;
  	        }
  	        else
  	            break;
  	    }
  	    // In the unlikely event that loc.tokens[this.endTokenIndex - 1] ends
  	    // *before* loc.end, we need to fast-forward this.endTokenIndex first.
  	    while (this.endTokenIndex < loc.tokens.length) {
  	        var token = loc.tokens[this.endTokenIndex];
  	        if (util.comparePos(token.loc.end, loc.end) < 0) {
  	            ++this.endTokenIndex;
  	        }
  	        else
  	            break;
  	    }
  	    // Increment this.startTokenIndex until we've found the first token
  	    // contained by this node.
  	    while (this.startTokenIndex < this.endTokenIndex) {
  	        var token = loc.tokens[this.startTokenIndex];
  	        if (util.comparePos(token.loc.start, loc.start) < 0) {
  	            ++this.startTokenIndex;
  	        }
  	        else
  	            break;
  	    }
  	    // Index into loc.tokens of the first token within this node.
  	    loc.start.token = this.startTokenIndex;
  	    // Decrement this.endTokenIndex until we've found the first token after
  	    // this node (not contained by the node).
  	    while (this.endTokenIndex > this.startTokenIndex) {
  	        var token = loc.tokens[this.endTokenIndex - 1];
  	        if (util.comparePos(loc.end, token.loc.end) < 0) {
  	            --this.endTokenIndex;
  	        }
  	        else
  	            break;
  	    }
  	    // Index into loc.tokens of the first token *after* this node.
  	    // If loc.start.token === loc.end.token, the node contains no tokens,
  	    // and the index is that of the next token following this node.
  	    loc.end.token = this.endTokenIndex;
  	};
  	return parser;
  }

  var printer = {};

  var fastPath = {};

  var hasRequiredFastPath;

  function requireFastPath () {
  	if (hasRequiredFastPath) return fastPath;
  	hasRequiredFastPath = 1;
  	Object.defineProperty(fastPath, "__esModule", { value: true });
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var types = tslib_1.__importStar(requireMain$1());
  	var util = tslib_1.__importStar(requireUtil());
  	var n = types.namedTypes;
  	var isArray = types.builtInTypes.array;
  	var isNumber = types.builtInTypes.number;
  	var PRECEDENCE = {};
  	[
  	    ["??"],
  	    ["||"],
  	    ["&&"],
  	    ["|"],
  	    ["^"],
  	    ["&"],
  	    ["==", "===", "!=", "!=="],
  	    ["<", ">", "<=", ">=", "in", "instanceof"],
  	    [">>", "<<", ">>>"],
  	    ["+", "-"],
  	    ["*", "/", "%"],
  	    ["**"],
  	].forEach(function (tier, i) {
  	    tier.forEach(function (op) {
  	        PRECEDENCE[op] = i;
  	    });
  	});
  	var FastPath = function FastPath(value) {
  	    (0, tiny_invariant_1.default)(this instanceof FastPath);
  	    this.stack = [value];
  	};
  	var FPp = FastPath.prototype;
  	// Static convenience function for coercing a value to a FastPath.
  	FastPath.from = function (obj) {
  	    if (obj instanceof FastPath) {
  	        // Return a defensive copy of any existing FastPath instances.
  	        return obj.copy();
  	    }
  	    if (obj instanceof types.NodePath) {
  	        // For backwards compatibility, unroll NodePath instances into
  	        // lightweight FastPath [..., name, value] stacks.
  	        var copy = Object.create(FastPath.prototype);
  	        var stack = [obj.value];
  	        for (var pp = void 0; (pp = obj.parentPath); obj = pp)
  	            stack.push(obj.name, pp.value);
  	        copy.stack = stack.reverse();
  	        return copy;
  	    }
  	    // Otherwise use obj as the value of the new FastPath instance.
  	    return new FastPath(obj);
  	};
  	FPp.copy = function copy() {
  	    var copy = Object.create(FastPath.prototype);
  	    copy.stack = this.stack.slice(0);
  	    return copy;
  	};
  	// The name of the current property is always the penultimate element of
  	// this.stack, and always a String.
  	FPp.getName = function getName() {
  	    var s = this.stack;
  	    var len = s.length;
  	    if (len > 1) {
  	        return s[len - 2];
  	    }
  	    // Since the name is always a string, null is a safe sentinel value to
  	    // return if we do not know the name of the (root) value.
  	    return null;
  	};
  	// The value of the current property is always the final element of
  	// this.stack.
  	FPp.getValue = function getValue() {
  	    var s = this.stack;
  	    return s[s.length - 1];
  	};
  	FPp.valueIsDuplicate = function () {
  	    var s = this.stack;
  	    var valueIndex = s.length - 1;
  	    return s.lastIndexOf(s[valueIndex], valueIndex - 1) >= 0;
  	};
  	function getNodeHelper(path, count) {
  	    var s = path.stack;
  	    for (var i = s.length - 1; i >= 0; i -= 2) {
  	        var value = s[i];
  	        if (n.Node.check(value) && --count < 0) {
  	            return value;
  	        }
  	    }
  	    return null;
  	}
  	FPp.getNode = function getNode(count) {
  	    if (count === void 0) { count = 0; }
  	    return getNodeHelper(this, ~~count);
  	};
  	FPp.getParentNode = function getParentNode(count) {
  	    if (count === void 0) { count = 0; }
  	    return getNodeHelper(this, ~~count + 1);
  	};
  	// The length of the stack can be either even or odd, depending on whether
  	// or not we have a name for the root value. The difference between the
  	// index of the root value and the index of the final value is always
  	// even, though, which allows us to return the root value in constant time
  	// (i.e. without iterating backwards through the stack).
  	FPp.getRootValue = function getRootValue() {
  	    var s = this.stack;
  	    if (s.length % 2 === 0) {
  	        return s[1];
  	    }
  	    return s[0];
  	};
  	// Temporarily push properties named by string arguments given after the
  	// callback function onto this.stack, then call the callback with a
  	// reference to this (modified) FastPath object. Note that the stack will
  	// be restored to its original state after the callback is finished, so it
  	// is probably a mistake to retain a reference to the path.
  	FPp.call = function call(callback /*, name1, name2, ... */) {
  	    var s = this.stack;
  	    var origLen = s.length;
  	    var value = s[origLen - 1];
  	    var argc = arguments.length;
  	    for (var i = 1; i < argc; ++i) {
  	        var name = arguments[i];
  	        value = value[name];
  	        s.push(name, value);
  	    }
  	    var result = callback(this);
  	    s.length = origLen;
  	    return result;
  	};
  	// Similar to FastPath.prototype.call, except that the value obtained by
  	// accessing this.getValue()[name1][name2]... should be array-like. The
  	// callback will be called with a reference to this path object for each
  	// element of the array.
  	FPp.each = function each(callback /*, name1, name2, ... */) {
  	    var s = this.stack;
  	    var origLen = s.length;
  	    var value = s[origLen - 1];
  	    var argc = arguments.length;
  	    for (var i = 1; i < argc; ++i) {
  	        var name = arguments[i];
  	        value = value[name];
  	        s.push(name, value);
  	    }
  	    for (var i = 0; i < value.length; ++i) {
  	        if (i in value) {
  	            s.push(i, value[i]);
  	            // If the callback needs to know the value of i, call
  	            // path.getName(), assuming path is the parameter name.
  	            callback(this);
  	            s.length -= 2;
  	        }
  	    }
  	    s.length = origLen;
  	};
  	// Similar to FastPath.prototype.each, except that the results of the
  	// callback function invocations are stored in an array and returned at
  	// the end of the iteration.
  	FPp.map = function map(callback /*, name1, name2, ... */) {
  	    var s = this.stack;
  	    var origLen = s.length;
  	    var value = s[origLen - 1];
  	    var argc = arguments.length;
  	    for (var i = 1; i < argc; ++i) {
  	        var name = arguments[i];
  	        value = value[name];
  	        s.push(name, value);
  	    }
  	    var result = new Array(value.length);
  	    for (var i = 0; i < value.length; ++i) {
  	        if (i in value) {
  	            s.push(i, value[i]);
  	            result[i] = callback(this, i);
  	            s.length -= 2;
  	        }
  	    }
  	    s.length = origLen;
  	    return result;
  	};
  	// Returns true if the node at the tip of the path is wrapped with
  	// parentheses, OR if the only reason the node needed parentheses was that
  	// it couldn't be the first expression in the enclosing statement (see
  	// FastPath#canBeFirstInStatement), and it has an opening `(` character.
  	// For example, the FunctionExpression in `(function(){}())` appears to
  	// need parentheses only because it's the first expression in the AST, but
  	// since it happens to be preceded by a `(` (which is not apparent from
  	// the AST but can be determined using FastPath#getPrevToken), there is no
  	// ambiguity about how to parse it, so it counts as having parentheses,
  	// even though it is not immediately followed by a `)`.
  	FPp.hasParens = function () {
  	    var node = this.getNode();
  	    var prevToken = this.getPrevToken(node);
  	    if (!prevToken) {
  	        return false;
  	    }
  	    var nextToken = this.getNextToken(node);
  	    if (!nextToken) {
  	        return false;
  	    }
  	    if (prevToken.value === "(") {
  	        if (nextToken.value === ")") {
  	            // If the node preceded by a `(` token and followed by a `)` token,
  	            // then of course it has parentheses.
  	            return true;
  	        }
  	        // If this is one of the few Expression types that can't come first in
  	        // the enclosing statement because of parsing ambiguities (namely,
  	        // FunctionExpression, ObjectExpression, and ClassExpression) and
  	        // this.firstInStatement() returns true, and the node would not need
  	        // parentheses in an expression context because this.needsParens(true)
  	        // returns false, then it just needs an opening parenthesis to resolve
  	        // the parsing ambiguity that made it appear to need parentheses.
  	        var justNeedsOpeningParen = !this.canBeFirstInStatement() &&
  	            this.firstInStatement() &&
  	            !this.needsParens(true);
  	        if (justNeedsOpeningParen) {
  	            return true;
  	        }
  	    }
  	    return false;
  	};
  	FPp.getPrevToken = function (node) {
  	    node = node || this.getNode();
  	    var loc = node && node.loc;
  	    var tokens = loc && loc.tokens;
  	    if (tokens && loc.start.token > 0) {
  	        var token = tokens[loc.start.token - 1];
  	        if (token) {
  	            // Do not return tokens that fall outside the root subtree.
  	            var rootLoc = this.getRootValue().loc;
  	            if (util.comparePos(rootLoc.start, token.loc.start) <= 0) {
  	                return token;
  	            }
  	        }
  	    }
  	    return null;
  	};
  	FPp.getNextToken = function (node) {
  	    node = node || this.getNode();
  	    var loc = node && node.loc;
  	    var tokens = loc && loc.tokens;
  	    if (tokens && loc.end.token < tokens.length) {
  	        var token = tokens[loc.end.token];
  	        if (token) {
  	            // Do not return tokens that fall outside the root subtree.
  	            var rootLoc = this.getRootValue().loc;
  	            if (util.comparePos(token.loc.end, rootLoc.end) <= 0) {
  	                return token;
  	            }
  	        }
  	    }
  	    return null;
  	};
  	// Inspired by require("ast-types").NodePath.prototype.needsParens, but
  	// more efficient because we're iterating backwards through a stack.
  	FPp.needsParens = function (assumeExpressionContext) {
  	    var node = this.getNode();
  	    // This needs to come before `if (!parent) { return false }` because
  	    // an object destructuring assignment requires parens for
  	    // correctness even when it's the topmost expression.
  	    if (node.type === "AssignmentExpression" &&
  	        node.left.type === "ObjectPattern") {
  	        return true;
  	    }
  	    var parent = this.getParentNode();
  	    var name = this.getName();
  	    // If the value of this path is some child of a Node and not a Node
  	    // itself, then it doesn't need parentheses. Only Node objects (in fact,
  	    // only Expression nodes) need parentheses.
  	    if (this.getValue() !== node) {
  	        return false;
  	    }
  	    // Only statements don't need parentheses.
  	    if (n.Statement.check(node)) {
  	        return false;
  	    }
  	    // Identifiers never need parentheses.
  	    if (node.type === "Identifier") {
  	        return false;
  	    }
  	    if (parent && parent.type === "ParenthesizedExpression") {
  	        return false;
  	    }
  	    if (node.extra && node.extra.parenthesized) {
  	        return true;
  	    }
  	    if (!parent)
  	        return false;
  	    // Wrap e.g. `-1` in parentheses inside `(-1) ** 2`.
  	    if (node.type === "UnaryExpression" &&
  	        parent.type === "BinaryExpression" &&
  	        name === "left" &&
  	        parent.left === node &&
  	        parent.operator === "**") {
  	        return true;
  	    }
  	    switch (node.type) {
  	        case "UnaryExpression":
  	        case "SpreadElement":
  	        case "SpreadProperty":
  	            return (parent.type === "MemberExpression" &&
  	                name === "object" &&
  	                parent.object === node);
  	        case "BinaryExpression":
  	        case "LogicalExpression":
  	            switch (parent.type) {
  	                case "CallExpression":
  	                    return name === "callee" && parent.callee === node;
  	                case "UnaryExpression":
  	                case "SpreadElement":
  	                case "SpreadProperty":
  	                    return true;
  	                case "MemberExpression":
  	                    return name === "object" && parent.object === node;
  	                case "BinaryExpression":
  	                case "LogicalExpression": {
  	                    var po = parent.operator;
  	                    var pp = PRECEDENCE[po];
  	                    var no = node.operator;
  	                    var np = PRECEDENCE[no];
  	                    if (pp > np) {
  	                        return true;
  	                    }
  	                    if (pp === np && name === "right") {
  	                        (0, tiny_invariant_1.default)(parent.right === node);
  	                        return true;
  	                    }
  	                    break;
  	                }
  	                default:
  	                    return false;
  	            }
  	            break;
  	        case "SequenceExpression":
  	            switch (parent.type) {
  	                case "ReturnStatement":
  	                    return false;
  	                case "ForStatement":
  	                    // Although parentheses wouldn't hurt around sequence expressions in
  	                    // the head of for loops, traditional style dictates that e.g. i++,
  	                    // j++ should not be wrapped with parentheses.
  	                    return false;
  	                case "ExpressionStatement":
  	                    return name !== "expression";
  	                default:
  	                    // Otherwise err on the side of overparenthesization, adding
  	                    // explicit exceptions above if this proves overzealous.
  	                    return true;
  	            }
  	        case "OptionalIndexedAccessType":
  	            return node.optional && parent.type === "IndexedAccessType";
  	        case "IntersectionTypeAnnotation":
  	        case "UnionTypeAnnotation":
  	            return parent.type === "NullableTypeAnnotation";
  	        case "Literal":
  	            return (parent.type === "MemberExpression" &&
  	                isNumber.check(node.value) &&
  	                name === "object" &&
  	                parent.object === node);
  	        // Babel 6 Literal split
  	        case "NumericLiteral":
  	            return (parent.type === "MemberExpression" &&
  	                name === "object" &&
  	                parent.object === node);
  	        case "YieldExpression":
  	        case "AwaitExpression":
  	        case "AssignmentExpression":
  	        case "ConditionalExpression":
  	            switch (parent.type) {
  	                case "UnaryExpression":
  	                case "SpreadElement":
  	                case "SpreadProperty":
  	                case "BinaryExpression":
  	                case "LogicalExpression":
  	                    return true;
  	                case "CallExpression":
  	                case "NewExpression":
  	                    return name === "callee" && parent.callee === node;
  	                case "ConditionalExpression":
  	                    return name === "test" && parent.test === node;
  	                case "MemberExpression":
  	                    return name === "object" && parent.object === node;
  	                default:
  	                    return false;
  	            }
  	        case "ArrowFunctionExpression":
  	            if (n.CallExpression.check(parent) &&
  	                name === "callee" &&
  	                parent.callee === node) {
  	                return true;
  	            }
  	            if (n.MemberExpression.check(parent) &&
  	                name === "object" &&
  	                parent.object === node) {
  	                return true;
  	            }
  	            if (n.TSAsExpression &&
  	                n.TSAsExpression.check(parent) &&
  	                name === "expression" &&
  	                parent.expression === node) {
  	                return true;
  	            }
  	            return isBinary(parent);
  	        case "ObjectExpression":
  	            if (parent.type === "ArrowFunctionExpression" &&
  	                name === "body" &&
  	                parent.body === node) {
  	                return true;
  	            }
  	            break;
  	        case "TSAsExpression":
  	            if (parent.type === "ArrowFunctionExpression" &&
  	                name === "body" &&
  	                parent.body === node &&
  	                node.expression.type === "ObjectExpression") {
  	                return true;
  	            }
  	            break;
  	        case "CallExpression":
  	            if (name === "declaration" &&
  	                n.ExportDefaultDeclaration.check(parent) &&
  	                n.FunctionExpression.check(node.callee)) {
  	                return true;
  	            }
  	    }
  	    if (parent.type === "NewExpression" &&
  	        name === "callee" &&
  	        parent.callee === node) {
  	        return containsCallExpression(node);
  	    }
  	    if (assumeExpressionContext !== true &&
  	        !this.canBeFirstInStatement() &&
  	        this.firstInStatement()) {
  	        return true;
  	    }
  	    return false;
  	};
  	function isBinary(node) {
  	    return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
  	}
  	function containsCallExpression(node) {
  	    if (n.CallExpression.check(node)) {
  	        return true;
  	    }
  	    if (isArray.check(node)) {
  	        return node.some(containsCallExpression);
  	    }
  	    if (n.Node.check(node)) {
  	        return types.someField(node, function (_name, child) {
  	            return containsCallExpression(child);
  	        });
  	    }
  	    return false;
  	}
  	FPp.canBeFirstInStatement = function () {
  	    var node = this.getNode();
  	    if (n.FunctionExpression.check(node)) {
  	        return false;
  	    }
  	    if (n.ObjectExpression.check(node)) {
  	        return false;
  	    }
  	    if (n.ClassExpression.check(node)) {
  	        return false;
  	    }
  	    return true;
  	};
  	FPp.firstInStatement = function () {
  	    var s = this.stack;
  	    var parentName, parent;
  	    var childName, child;
  	    for (var i = s.length - 1; i >= 0; i -= 2) {
  	        if (n.Node.check(s[i])) {
  	            childName = parentName;
  	            child = parent;
  	            parentName = s[i - 1];
  	            parent = s[i];
  	        }
  	        if (!parent || !child) {
  	            continue;
  	        }
  	        if (n.BlockStatement.check(parent) &&
  	            parentName === "body" &&
  	            childName === 0) {
  	            (0, tiny_invariant_1.default)(parent.body[0] === child);
  	            return true;
  	        }
  	        if (n.ExpressionStatement.check(parent) && childName === "expression") {
  	            (0, tiny_invariant_1.default)(parent.expression === child);
  	            return true;
  	        }
  	        if (n.AssignmentExpression.check(parent) && childName === "left") {
  	            (0, tiny_invariant_1.default)(parent.left === child);
  	            return true;
  	        }
  	        if (n.ArrowFunctionExpression.check(parent) && childName === "body") {
  	            (0, tiny_invariant_1.default)(parent.body === child);
  	            return true;
  	        }
  	        // s[i + 1] and s[i + 2] represent the array between the parent
  	        // SequenceExpression node and its child nodes
  	        if (n.SequenceExpression.check(parent) &&
  	            s[i + 1] === "expressions" &&
  	            childName === 0) {
  	            (0, tiny_invariant_1.default)(parent.expressions[0] === child);
  	            continue;
  	        }
  	        if (n.CallExpression.check(parent) && childName === "callee") {
  	            (0, tiny_invariant_1.default)(parent.callee === child);
  	            continue;
  	        }
  	        if (n.MemberExpression.check(parent) && childName === "object") {
  	            (0, tiny_invariant_1.default)(parent.object === child);
  	            continue;
  	        }
  	        if (n.ConditionalExpression.check(parent) && childName === "test") {
  	            (0, tiny_invariant_1.default)(parent.test === child);
  	            continue;
  	        }
  	        if (isBinary(parent) && childName === "left") {
  	            (0, tiny_invariant_1.default)(parent.left === child);
  	            continue;
  	        }
  	        if (n.UnaryExpression.check(parent) &&
  	            !parent.prefix &&
  	            childName === "argument") {
  	            (0, tiny_invariant_1.default)(parent.argument === child);
  	            continue;
  	        }
  	        return false;
  	    }
  	    return true;
  	};
  	fastPath.default = FastPath;
  	return fastPath;
  }

  var patcher = {};

  var hasRequiredPatcher;

  function requirePatcher () {
  	if (hasRequiredPatcher) return patcher;
  	hasRequiredPatcher = 1;
  	Object.defineProperty(patcher, "__esModule", { value: true });
  	patcher.getReprinter = patcher.Patcher = void 0;
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var linesModule = tslib_1.__importStar(requireLines());
  	var types = tslib_1.__importStar(requireMain$1());
  	var Printable = types.namedTypes.Printable;
  	var Expression = types.namedTypes.Expression;
  	var ReturnStatement = types.namedTypes.ReturnStatement;
  	var SourceLocation = types.namedTypes.SourceLocation;
  	var util_1 = requireUtil();
  	var fast_path_1 = tslib_1.__importDefault(requireFastPath());
  	var isObject = types.builtInTypes.object;
  	var isArray = types.builtInTypes.array;
  	var isString = types.builtInTypes.string;
  	var riskyAdjoiningCharExp = /[0-9a-z_$]/i;
  	var Patcher = function Patcher(lines) {
  	    (0, tiny_invariant_1.default)(this instanceof Patcher);
  	    (0, tiny_invariant_1.default)(lines instanceof linesModule.Lines);
  	    var self = this, replacements = [];
  	    self.replace = function (loc, lines) {
  	        if (isString.check(lines))
  	            lines = linesModule.fromString(lines);
  	        replacements.push({
  	            lines: lines,
  	            start: loc.start,
  	            end: loc.end,
  	        });
  	    };
  	    self.get = function (loc) {
  	        // If no location is provided, return the complete Lines object.
  	        loc = loc || {
  	            start: { line: 1, column: 0 },
  	            end: { line: lines.length, column: lines.getLineLength(lines.length) },
  	        };
  	        var sliceFrom = loc.start, toConcat = [];
  	        function pushSlice(from, to) {
  	            (0, tiny_invariant_1.default)((0, util_1.comparePos)(from, to) <= 0);
  	            toConcat.push(lines.slice(from, to));
  	        }
  	        replacements
  	            .sort(function (a, b) { return (0, util_1.comparePos)(a.start, b.start); })
  	            .forEach(function (rep) {
  	            if ((0, util_1.comparePos)(sliceFrom, rep.start) > 0) ;
  	            else {
  	                pushSlice(sliceFrom, rep.start);
  	                toConcat.push(rep.lines);
  	                sliceFrom = rep.end;
  	            }
  	        });
  	        pushSlice(sliceFrom, loc.end);
  	        return linesModule.concat(toConcat);
  	    };
  	};
  	patcher.Patcher = Patcher;
  	var Pp = Patcher.prototype;
  	Pp.tryToReprintComments = function (newNode, oldNode, print) {
  	    var patcher = this;
  	    if (!newNode.comments && !oldNode.comments) {
  	        // We were (vacuously) able to reprint all the comments!
  	        return true;
  	    }
  	    var newPath = fast_path_1.default.from(newNode);
  	    var oldPath = fast_path_1.default.from(oldNode);
  	    newPath.stack.push("comments", getSurroundingComments(newNode));
  	    oldPath.stack.push("comments", getSurroundingComments(oldNode));
  	    var reprints = [];
  	    var ableToReprintComments = findArrayReprints(newPath, oldPath, reprints);
  	    // No need to pop anything from newPath.stack or oldPath.stack, since
  	    // newPath and oldPath are fresh local variables.
  	    if (ableToReprintComments && reprints.length > 0) {
  	        reprints.forEach(function (reprint) {
  	            var oldComment = reprint.oldPath.getValue();
  	            (0, tiny_invariant_1.default)(oldComment.leading || oldComment.trailing);
  	            patcher.replace(oldComment.loc, 
  	            // Comments can't have .comments, so it doesn't matter whether we
  	            // print with comments or without.
  	            print(reprint.newPath).indentTail(oldComment.loc.indent));
  	        });
  	    }
  	    return ableToReprintComments;
  	};
  	// Get all comments that are either leading or trailing, ignoring any
  	// comments that occur inside node.loc. Returns an empty array for nodes
  	// with no leading or trailing comments.
  	function getSurroundingComments(node) {
  	    var result = [];
  	    if (node.comments && node.comments.length > 0) {
  	        node.comments.forEach(function (comment) {
  	            if (comment.leading || comment.trailing) {
  	                result.push(comment);
  	            }
  	        });
  	    }
  	    return result;
  	}
  	Pp.deleteComments = function (node) {
  	    if (!node.comments) {
  	        return;
  	    }
  	    var patcher = this;
  	    node.comments.forEach(function (comment) {
  	        if (comment.leading) {
  	            // Delete leading comments along with any trailing whitespace they
  	            // might have.
  	            patcher.replace({
  	                start: comment.loc.start,
  	                end: node.loc.lines.skipSpaces(comment.loc.end, false, false),
  	            }, "");
  	        }
  	        else if (comment.trailing) {
  	            // Delete trailing comments along with any leading whitespace they
  	            // might have.
  	            patcher.replace({
  	                start: node.loc.lines.skipSpaces(comment.loc.start, true, false),
  	                end: comment.loc.end,
  	            }, "");
  	        }
  	    });
  	};
  	function getReprinter(path) {
  	    (0, tiny_invariant_1.default)(path instanceof fast_path_1.default);
  	    // Make sure that this path refers specifically to a Node, rather than
  	    // some non-Node subproperty of a Node.
  	    var node = path.getValue();
  	    if (!Printable.check(node))
  	        return;
  	    var orig = node.original;
  	    var origLoc = orig && orig.loc;
  	    var lines = origLoc && origLoc.lines;
  	    var reprints = [];
  	    if (!lines || !findReprints(path, reprints))
  	        return;
  	    return function (print) {
  	        var patcher = new Patcher(lines);
  	        reprints.forEach(function (reprint) {
  	            var newNode = reprint.newPath.getValue();
  	            var oldNode = reprint.oldPath.getValue();
  	            SourceLocation.assert(oldNode.loc, true);
  	            var needToPrintNewPathWithComments = !patcher.tryToReprintComments(newNode, oldNode, print);
  	            if (needToPrintNewPathWithComments) {
  	                // Since we were not able to preserve all leading/trailing
  	                // comments, we delete oldNode's comments, print newPath with
  	                // comments, and then patch the resulting lines where oldNode used
  	                // to be.
  	                patcher.deleteComments(oldNode);
  	            }
  	            var newLines = print(reprint.newPath, {
  	                includeComments: needToPrintNewPathWithComments,
  	                // If the oldNode we're replacing already had parentheses, we may
  	                // not need to print the new node with any extra parentheses,
  	                // because the existing parentheses will suffice. However, if the
  	                // newNode has a different type than the oldNode, let the printer
  	                // decide if reprint.newPath needs parentheses, as usual.
  	                avoidRootParens: oldNode.type === newNode.type && reprint.oldPath.hasParens(),
  	            }).indentTail(oldNode.loc.indent);
  	            var nls = needsLeadingSpace(lines, oldNode.loc, newLines);
  	            var nts = needsTrailingSpace(lines, oldNode.loc, newLines);
  	            // If we try to replace the argument of a ReturnStatement like
  	            // return"asdf" with e.g. a literal null expression, we run the risk
  	            // of ending up with returnnull, so we need to add an extra leading
  	            // space in situations where that might happen. Likewise for
  	            // "asdf"in obj. See #170.
  	            if (nls || nts) {
  	                var newParts = [];
  	                nls && newParts.push(" ");
  	                newParts.push(newLines);
  	                nts && newParts.push(" ");
  	                newLines = linesModule.concat(newParts);
  	            }
  	            patcher.replace(oldNode.loc, newLines);
  	        });
  	        // Recall that origLoc is the .loc of an ancestor node that is
  	        // guaranteed to contain all the reprinted nodes and comments.
  	        var patchedLines = patcher.get(origLoc).indentTail(-orig.loc.indent);
  	        if (path.needsParens()) {
  	            return linesModule.concat(["(", patchedLines, ")"]);
  	        }
  	        return patchedLines;
  	    };
  	}
  	patcher.getReprinter = getReprinter;
  	// If the last character before oldLoc and the first character of newLines
  	// are both identifier characters, they must be separated by a space,
  	// otherwise they will most likely get fused together into a single token.
  	function needsLeadingSpace(oldLines, oldLoc, newLines) {
  	    var posBeforeOldLoc = (0, util_1.copyPos)(oldLoc.start);
  	    // The character just before the location occupied by oldNode.
  	    var charBeforeOldLoc = oldLines.prevPos(posBeforeOldLoc) && oldLines.charAt(posBeforeOldLoc);
  	    // First character of the reprinted node.
  	    var newFirstChar = newLines.charAt(newLines.firstPos());
  	    return (charBeforeOldLoc &&
  	        riskyAdjoiningCharExp.test(charBeforeOldLoc) &&
  	        newFirstChar &&
  	        riskyAdjoiningCharExp.test(newFirstChar));
  	}
  	// If the last character of newLines and the first character after oldLoc
  	// are both identifier characters, they must be separated by a space,
  	// otherwise they will most likely get fused together into a single token.
  	function needsTrailingSpace(oldLines, oldLoc, newLines) {
  	    // The character just after the location occupied by oldNode.
  	    var charAfterOldLoc = oldLines.charAt(oldLoc.end);
  	    var newLastPos = newLines.lastPos();
  	    // Last character of the reprinted node.
  	    var newLastChar = newLines.prevPos(newLastPos) && newLines.charAt(newLastPos);
  	    return (newLastChar &&
  	        riskyAdjoiningCharExp.test(newLastChar) &&
  	        charAfterOldLoc &&
  	        riskyAdjoiningCharExp.test(charAfterOldLoc));
  	}
  	function findReprints(newPath, reprints) {
  	    var newNode = newPath.getValue();
  	    Printable.assert(newNode);
  	    var oldNode = newNode.original;
  	    Printable.assert(oldNode);
  	    (0, tiny_invariant_1.default)(reprints.length === 0);
  	    if (newNode.type !== oldNode.type) {
  	        return false;
  	    }
  	    var oldPath = new fast_path_1.default(oldNode);
  	    var canReprint = findChildReprints(newPath, oldPath, reprints);
  	    if (!canReprint) {
  	        // Make absolutely sure the calling code does not attempt to reprint
  	        // any nodes.
  	        reprints.length = 0;
  	    }
  	    return canReprint;
  	}
  	function findAnyReprints(newPath, oldPath, reprints) {
  	    var newNode = newPath.getValue();
  	    var oldNode = oldPath.getValue();
  	    if (newNode === oldNode)
  	        return true;
  	    if (isArray.check(newNode))
  	        return findArrayReprints(newPath, oldPath, reprints);
  	    if (isObject.check(newNode))
  	        return findObjectReprints(newPath, oldPath, reprints);
  	    return false;
  	}
  	function findArrayReprints(newPath, oldPath, reprints) {
  	    var newNode = newPath.getValue();
  	    var oldNode = oldPath.getValue();
  	    if (newNode === oldNode ||
  	        newPath.valueIsDuplicate() ||
  	        oldPath.valueIsDuplicate()) {
  	        return true;
  	    }
  	    isArray.assert(newNode);
  	    var len = newNode.length;
  	    if (!(isArray.check(oldNode) && oldNode.length === len))
  	        return false;
  	    for (var i = 0; i < len; ++i) {
  	        newPath.stack.push(i, newNode[i]);
  	        oldPath.stack.push(i, oldNode[i]);
  	        var canReprint = findAnyReprints(newPath, oldPath, reprints);
  	        newPath.stack.length -= 2;
  	        oldPath.stack.length -= 2;
  	        if (!canReprint) {
  	            return false;
  	        }
  	    }
  	    return true;
  	}
  	function findObjectReprints(newPath, oldPath, reprints) {
  	    var newNode = newPath.getValue();
  	    isObject.assert(newNode);
  	    if (newNode.original === null) {
  	        // If newNode.original node was set to null, reprint the node.
  	        return false;
  	    }
  	    var oldNode = oldPath.getValue();
  	    if (!isObject.check(oldNode))
  	        return false;
  	    if (newNode === oldNode ||
  	        newPath.valueIsDuplicate() ||
  	        oldPath.valueIsDuplicate()) {
  	        return true;
  	    }
  	    if (Printable.check(newNode)) {
  	        if (!Printable.check(oldNode)) {
  	            return false;
  	        }
  	        var newParentNode = newPath.getParentNode();
  	        var oldParentNode = oldPath.getParentNode();
  	        if (oldParentNode !== null &&
  	            oldParentNode.type === "FunctionTypeAnnotation" &&
  	            newParentNode !== null &&
  	            newParentNode.type === "FunctionTypeAnnotation") {
  	            var oldNeedsParens = oldParentNode.params.length !== 1 || !!oldParentNode.params[0].name;
  	            var newNeedParens = newParentNode.params.length !== 1 || !!newParentNode.params[0].name;
  	            if (!oldNeedsParens && newNeedParens) {
  	                return false;
  	            }
  	        }
  	        // Here we need to decide whether the reprinted code for newNode is
  	        // appropriate for patching into the location of oldNode.
  	        if (newNode.type === oldNode.type) {
  	            var childReprints = [];
  	            if (findChildReprints(newPath, oldPath, childReprints)) {
  	                reprints.push.apply(reprints, childReprints);
  	            }
  	            else if (oldNode.loc) {
  	                // If we have no .loc information for oldNode, then we won't be
  	                // able to reprint it.
  	                reprints.push({
  	                    oldPath: oldPath.copy(),
  	                    newPath: newPath.copy(),
  	                });
  	            }
  	            else {
  	                return false;
  	            }
  	            return true;
  	        }
  	        if (Expression.check(newNode) &&
  	            Expression.check(oldNode) &&
  	            // If we have no .loc information for oldNode, then we won't be
  	            // able to reprint it.
  	            oldNode.loc) {
  	            // If both nodes are subtypes of Expression, then we should be able
  	            // to fill the location occupied by the old node with code printed
  	            // for the new node with no ill consequences.
  	            reprints.push({
  	                oldPath: oldPath.copy(),
  	                newPath: newPath.copy(),
  	            });
  	            return true;
  	        }
  	        // The nodes have different types, and at least one of the types is
  	        // not a subtype of the Expression type, so we cannot safely assume
  	        // the nodes are syntactically interchangeable.
  	        return false;
  	    }
  	    return findChildReprints(newPath, oldPath, reprints);
  	}
  	function findChildReprints(newPath, oldPath, reprints) {
  	    var newNode = newPath.getValue();
  	    var oldNode = oldPath.getValue();
  	    isObject.assert(newNode);
  	    isObject.assert(oldNode);
  	    if (newNode.original === null) {
  	        // If newNode.original node was set to null, reprint the node.
  	        return false;
  	    }
  	    // If this node needs parentheses and will not be wrapped with
  	    // parentheses when reprinted, then return false to skip reprinting and
  	    // let it be printed generically.
  	    if (newPath.needsParens() && !oldPath.hasParens()) {
  	        return false;
  	    }
  	    var keys = (0, util_1.getUnionOfKeys)(oldNode, newNode);
  	    if (oldNode.type === "File" || newNode.type === "File") {
  	        // Don't bother traversing file.tokens, an often very large array
  	        // returned by Babylon, and useless for our purposes.
  	        delete keys.tokens;
  	    }
  	    // Don't bother traversing .loc objects looking for reprintable nodes.
  	    delete keys.loc;
  	    var originalReprintCount = reprints.length;
  	    for (var k in keys) {
  	        if (k.charAt(0) === "_") {
  	            // Ignore "private" AST properties added by e.g. Babel plugins and
  	            // parsers like Babylon.
  	            continue;
  	        }
  	        newPath.stack.push(k, types.getFieldValue(newNode, k));
  	        oldPath.stack.push(k, types.getFieldValue(oldNode, k));
  	        var canReprint = findAnyReprints(newPath, oldPath, reprints);
  	        newPath.stack.length -= 2;
  	        oldPath.stack.length -= 2;
  	        if (!canReprint) {
  	            return false;
  	        }
  	    }
  	    // Return statements might end up running into ASI issues due to
  	    // comments inserted deep within the tree, so reprint them if anything
  	    // changed within them.
  	    if (ReturnStatement.check(newPath.getNode()) &&
  	        reprints.length > originalReprintCount) {
  	        return false;
  	    }
  	    return true;
  	}
  	return patcher;
  }

  var hasRequiredPrinter;

  function requirePrinter () {
  	if (hasRequiredPrinter) return printer;
  	hasRequiredPrinter = 1;
  	Object.defineProperty(printer, "__esModule", { value: true });
  	printer.Printer = void 0;
  	var tslib_1 = require$$0;
  	var tiny_invariant_1 = tslib_1.__importDefault(/*@__PURE__*/ requireTinyInvariant_cjs());
  	var types = tslib_1.__importStar(requireMain$1());
  	var comments_1 = requireComments();
  	var fast_path_1 = tslib_1.__importDefault(requireFastPath());
  	var lines_1 = requireLines();
  	var options_1 = requireOptions();
  	var patcher_1 = requirePatcher();
  	var util = tslib_1.__importStar(requireUtil());
  	var namedTypes = types.namedTypes;
  	var isString = types.builtInTypes.string;
  	var isObject = types.builtInTypes.object;
  	var PrintResult = function PrintResult(code, sourceMap) {
  	    (0, tiny_invariant_1.default)(this instanceof PrintResult);
  	    isString.assert(code);
  	    this.code = code;
  	    if (sourceMap) {
  	        isObject.assert(sourceMap);
  	        this.map = sourceMap;
  	    }
  	};
  	var PRp = PrintResult.prototype;
  	var warnedAboutToString = false;
  	PRp.toString = function () {
  	    if (!warnedAboutToString) {
  	        console.warn("Deprecation warning: recast.print now returns an object with " +
  	            "a .code property. You appear to be treating the object as a " +
  	            "string, which might still work but is strongly discouraged.");
  	        warnedAboutToString = true;
  	    }
  	    return this.code;
  	};
  	var emptyPrintResult = new PrintResult("");
  	var Printer = function Printer(config) {
  	    (0, tiny_invariant_1.default)(this instanceof Printer);
  	    var explicitTabWidth = config && config.tabWidth;
  	    config = (0, options_1.normalize)(config);
  	    // It's common for client code to pass the same options into both
  	    // recast.parse and recast.print, but the Printer doesn't need (and
  	    // can be confused by) config.sourceFileName, so we null it out.
  	    config.sourceFileName = null;
  	    // Non-destructively modifies options with overrides, and returns a
  	    // new print function that uses the modified options.
  	    function makePrintFunctionWith(options, overrides) {
  	        options = Object.assign({}, options, overrides);
  	        return function (path) { return print(path, options); };
  	    }
  	    function print(path, options) {
  	        (0, tiny_invariant_1.default)(path instanceof fast_path_1.default);
  	        options = options || {};
  	        if (options.includeComments) {
  	            return (0, comments_1.printComments)(path, makePrintFunctionWith(options, {
  	                includeComments: false,
  	            }));
  	        }
  	        var oldTabWidth = config.tabWidth;
  	        if (!explicitTabWidth) {
  	            var loc = path.getNode().loc;
  	            if (loc && loc.lines && loc.lines.guessTabWidth) {
  	                config.tabWidth = loc.lines.guessTabWidth();
  	            }
  	        }
  	        var reprinter = (0, patcher_1.getReprinter)(path);
  	        var lines = reprinter
  	            ? // Since the print function that we pass to the reprinter will
  	                // be used to print "new" nodes, it's tempting to think we
  	                // should pass printRootGenerically instead of print, to avoid
  	                // calling maybeReprint again, but that would be a mistake
  	                // because the new nodes might not be entirely new, but merely
  	                // moved from elsewhere in the AST. The print function is the
  	                // right choice because it gives us the opportunity to reprint
  	                // such nodes using their original source.
  	                reprinter(print)
  	            : genericPrint(path, config, options, makePrintFunctionWith(options, {
  	                includeComments: true,
  	                avoidRootParens: false,
  	            }));
  	        config.tabWidth = oldTabWidth;
  	        return lines;
  	    }
  	    this.print = function (ast) {
  	        if (!ast) {
  	            return emptyPrintResult;
  	        }
  	        var lines = print(fast_path_1.default.from(ast), {
  	            includeComments: true,
  	            avoidRootParens: false,
  	        });
  	        return new PrintResult(lines.toString(config), util.composeSourceMaps(config.inputSourceMap, lines.getSourceMap(config.sourceMapName, config.sourceRoot)));
  	    };
  	    this.printGenerically = function (ast) {
  	        if (!ast) {
  	            return emptyPrintResult;
  	        }
  	        // Print the entire AST generically.
  	        function printGenerically(path) {
  	            return (0, comments_1.printComments)(path, function (path) {
  	                return genericPrint(path, config, {
  	                    avoidRootParens: false,
  	                }, printGenerically);
  	            });
  	        }
  	        var path = fast_path_1.default.from(ast);
  	        var oldReuseWhitespace = config.reuseWhitespace;
  	        // Do not reuse whitespace (or anything else, for that matter)
  	        // when printing generically.
  	        config.reuseWhitespace = false;
  	        // TODO Allow printing of comments?
  	        var pr = new PrintResult(printGenerically(path).toString(config));
  	        config.reuseWhitespace = oldReuseWhitespace;
  	        return pr;
  	    };
  	};
  	printer.Printer = Printer;
  	function genericPrint(path, config, options, printPath) {
  	    (0, tiny_invariant_1.default)(path instanceof fast_path_1.default);
  	    var node = path.getValue();
  	    var parts = [];
  	    var linesWithoutParens = genericPrintNoParens(path, config, printPath);
  	    if (!node || linesWithoutParens.isEmpty()) {
  	        return linesWithoutParens;
  	    }
  	    var shouldAddParens = false;
  	    var decoratorsLines = printDecorators(path, printPath);
  	    if (decoratorsLines.isEmpty()) {
  	        // Nodes with decorators can't have parentheses, so we can avoid
  	        // computing path.needsParens() except in this case.
  	        if (!options.avoidRootParens) {
  	            shouldAddParens = path.needsParens();
  	        }
  	    }
  	    else {
  	        parts.push(decoratorsLines);
  	    }
  	    if (shouldAddParens) {
  	        parts.unshift("(");
  	    }
  	    parts.push(linesWithoutParens);
  	    if (shouldAddParens) {
  	        parts.push(")");
  	    }
  	    return (0, lines_1.concat)(parts);
  	}
  	// Note that the `options` parameter of this function is what other
  	// functions in this file call the `config` object (that is, the
  	// configuration object originally passed into the Printer constructor).
  	// Its properties are documented in lib/options.js.
  	function genericPrintNoParens(path, options, print) {
  	    var _a, _b, _c;
  	    var n = path.getValue();
  	    if (!n) {
  	        return (0, lines_1.fromString)("");
  	    }
  	    if (typeof n === "string") {
  	        return (0, lines_1.fromString)(n, options);
  	    }
  	    namedTypes.Printable.assert(n);
  	    var parts = [];
  	    switch (n.type) {
  	        case "File":
  	            return path.call(print, "program");
  	        case "Program":
  	            // Babel 6
  	            if (n.directives) {
  	                path.each(function (childPath) {
  	                    parts.push(print(childPath), ";\n");
  	                }, "directives");
  	            }
  	            if (n.interpreter) {
  	                parts.push(path.call(print, "interpreter"));
  	            }
  	            parts.push(path.call(function (bodyPath) { return printStatementSequence(bodyPath, options, print); }, "body"));
  	            return (0, lines_1.concat)(parts);
  	        case "Noop": // Babel extension.
  	        case "EmptyStatement":
  	            return (0, lines_1.fromString)("");
  	        case "ExpressionStatement":
  	            return (0, lines_1.concat)([path.call(print, "expression"), ";"]);
  	        case "ParenthesizedExpression": // Babel extension.
  	            return (0, lines_1.concat)(["(", path.call(print, "expression"), ")"]);
  	        case "BinaryExpression":
  	        case "LogicalExpression":
  	        case "AssignmentExpression":
  	            return (0, lines_1.fromString)(" ").join([
  	                path.call(print, "left"),
  	                n.operator,
  	                path.call(print, "right"),
  	            ]);
  	        case "AssignmentPattern":
  	            return (0, lines_1.concat)([
  	                path.call(print, "left"),
  	                " = ",
  	                path.call(print, "right"),
  	            ]);
  	        case "MemberExpression":
  	        case "OptionalMemberExpression": {
  	            parts.push(path.call(print, "object"));
  	            var property = path.call(print, "property");
  	            // Like n.optional, except with defaults applied, so optional
  	            // defaults to true for OptionalMemberExpression nodes.
  	            var optional = types.getFieldValue(n, "optional");
  	            if (n.computed) {
  	                parts.push(optional ? "?.[" : "[", property, "]");
  	            }
  	            else {
  	                parts.push(optional ? "?." : ".", property);
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ChainExpression":
  	            return path.call(print, "expression");
  	        case "MetaProperty":
  	            return (0, lines_1.concat)([
  	                path.call(print, "meta"),
  	                ".",
  	                path.call(print, "property"),
  	            ]);
  	        case "BindExpression":
  	            if (n.object) {
  	                parts.push(path.call(print, "object"));
  	            }
  	            parts.push("::", path.call(print, "callee"));
  	            return (0, lines_1.concat)(parts);
  	        case "Path":
  	            return (0, lines_1.fromString)(".").join(n.body);
  	        case "Identifier":
  	            return (0, lines_1.concat)([
  	                (0, lines_1.fromString)(n.name, options),
  	                n.optional ? "?" : "",
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "SpreadElement":
  	        case "SpreadElementPattern":
  	        case "RestProperty": // Babel 6 for ObjectPattern
  	        case "SpreadProperty":
  	        case "SpreadPropertyPattern":
  	        case "ObjectTypeSpreadProperty":
  	        case "RestElement":
  	            return (0, lines_1.concat)([
  	                "...",
  	                path.call(print, "argument"),
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "FunctionDeclaration":
  	        case "FunctionExpression":
  	        case "TSDeclareFunction":
  	            if (n.declare) {
  	                parts.push("declare ");
  	            }
  	            if (n.async) {
  	                parts.push("async ");
  	            }
  	            parts.push("function");
  	            if (n.generator)
  	                parts.push("*");
  	            if (n.id) {
  	                parts.push(" ", path.call(print, "id"), path.call(print, "typeParameters"));
  	            }
  	            else {
  	                if (n.typeParameters) {
  	                    parts.push(path.call(print, "typeParameters"));
  	                }
  	            }
  	            parts.push("(", printFunctionParams(path, options, print), ")", path.call(print, "returnType"));
  	            if (n.body) {
  	                parts.push(" ", path.call(print, "body"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "ArrowFunctionExpression":
  	            if (n.async) {
  	                parts.push("async ");
  	            }
  	            if (n.typeParameters) {
  	                parts.push(path.call(print, "typeParameters"));
  	            }
  	            if (!options.arrowParensAlways &&
  	                n.params.length === 1 &&
  	                !n.rest &&
  	                n.params[0].type === "Identifier" &&
  	                !n.params[0].typeAnnotation &&
  	                !n.returnType) {
  	                parts.push(path.call(print, "params", 0));
  	            }
  	            else {
  	                parts.push("(", printFunctionParams(path, options, print), ")", path.call(print, "returnType"));
  	            }
  	            parts.push(" => ", path.call(print, "body"));
  	            return (0, lines_1.concat)(parts);
  	        case "MethodDefinition":
  	            return printMethod(path, options, print);
  	        case "YieldExpression":
  	            parts.push("yield");
  	            if (n.delegate)
  	                parts.push("*");
  	            if (n.argument)
  	                parts.push(" ", path.call(print, "argument"));
  	            return (0, lines_1.concat)(parts);
  	        case "AwaitExpression":
  	            parts.push("await");
  	            if (n.all)
  	                parts.push("*");
  	            if (n.argument)
  	                parts.push(" ", path.call(print, "argument"));
  	            return (0, lines_1.concat)(parts);
  	        case "ModuleExpression":
  	            return (0, lines_1.concat)([
  	                "module {\n",
  	                path.call(print, "body").indent(options.tabWidth),
  	                "\n}",
  	            ]);
  	        case "ModuleDeclaration":
  	            parts.push("module", path.call(print, "id"));
  	            if (n.source) {
  	                (0, tiny_invariant_1.default)(!n.body);
  	                parts.push("from", path.call(print, "source"));
  	            }
  	            else {
  	                parts.push(path.call(print, "body"));
  	            }
  	            return (0, lines_1.fromString)(" ").join(parts);
  	        case "ImportSpecifier":
  	            if (n.importKind && n.importKind !== "value") {
  	                parts.push(n.importKind + " ");
  	            }
  	            if (n.imported) {
  	                parts.push(path.call(print, "imported"));
  	                if (n.local && n.local.name !== n.imported.name) {
  	                    parts.push(" as ", path.call(print, "local"));
  	                }
  	            }
  	            else if (n.id) {
  	                parts.push(path.call(print, "id"));
  	                if (n.name) {
  	                    parts.push(" as ", path.call(print, "name"));
  	                }
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "ExportSpecifier":
  	            if (n.exportKind && n.exportKind !== "value") {
  	                parts.push(n.exportKind + " ");
  	            }
  	            if (n.local) {
  	                parts.push(path.call(print, "local"));
  	                if (n.exported && n.exported.name !== n.local.name) {
  	                    parts.push(" as ", path.call(print, "exported"));
  	                }
  	            }
  	            else if (n.id) {
  	                parts.push(path.call(print, "id"));
  	                if (n.name) {
  	                    parts.push(" as ", path.call(print, "name"));
  	                }
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "ExportBatchSpecifier":
  	            return (0, lines_1.fromString)("*");
  	        case "ImportNamespaceSpecifier":
  	            parts.push("* as ");
  	            if (n.local) {
  	                parts.push(path.call(print, "local"));
  	            }
  	            else if (n.id) {
  	                parts.push(path.call(print, "id"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "ImportDefaultSpecifier":
  	            if (n.local) {
  	                return path.call(print, "local");
  	            }
  	            return path.call(print, "id");
  	        case "TSExportAssignment":
  	            return (0, lines_1.concat)(["export = ", path.call(print, "expression")]);
  	        case "ExportDeclaration":
  	        case "ExportDefaultDeclaration":
  	        case "ExportNamedDeclaration":
  	            return printExportDeclaration(path, options, print);
  	        case "ExportAllDeclaration":
  	            parts.push("export *");
  	            if (n.exported) {
  	                parts.push(" as ", path.call(print, "exported"));
  	            }
  	            parts.push(" from ", path.call(print, "source"), ";");
  	            return (0, lines_1.concat)(parts);
  	        case "TSNamespaceExportDeclaration":
  	            parts.push("export as namespace ", path.call(print, "id"));
  	            return maybeAddSemicolon((0, lines_1.concat)(parts));
  	        case "ExportNamespaceSpecifier":
  	            return (0, lines_1.concat)(["* as ", path.call(print, "exported")]);
  	        case "ExportDefaultSpecifier":
  	            return path.call(print, "exported");
  	        case "Import":
  	            return (0, lines_1.fromString)("import", options);
  	        // Recast and ast-types currently support dynamic import(...) using
  	        // either this dedicated ImportExpression type or a CallExpression
  	        // whose callee has type Import.
  	        // https://github.com/benjamn/ast-types/pull/365#issuecomment-605214486
  	        case "ImportExpression":
  	            return (0, lines_1.concat)(["import(", path.call(print, "source"), ")"]);
  	        case "ImportDeclaration": {
  	            parts.push("import ");
  	            if (n.importKind && n.importKind !== "value") {
  	                parts.push(n.importKind + " ");
  	            }
  	            if (n.specifiers && n.specifiers.length > 0) {
  	                var unbracedSpecifiers_1 = [];
  	                var bracedSpecifiers_1 = [];
  	                path.each(function (specifierPath) {
  	                    var spec = specifierPath.getValue();
  	                    if (spec.type === "ImportSpecifier") {
  	                        bracedSpecifiers_1.push(print(specifierPath));
  	                    }
  	                    else if (spec.type === "ImportDefaultSpecifier" ||
  	                        spec.type === "ImportNamespaceSpecifier") {
  	                        unbracedSpecifiers_1.push(print(specifierPath));
  	                    }
  	                }, "specifiers");
  	                unbracedSpecifiers_1.forEach(function (lines, i) {
  	                    if (i > 0) {
  	                        parts.push(", ");
  	                    }
  	                    parts.push(lines);
  	                });
  	                if (bracedSpecifiers_1.length > 0) {
  	                    var lines = (0, lines_1.fromString)(", ").join(bracedSpecifiers_1);
  	                    if (lines.getLineLength(1) > options.wrapColumn) {
  	                        lines = (0, lines_1.concat)([
  	                            (0, lines_1.fromString)(",\n").join(bracedSpecifiers_1).indent(options.tabWidth),
  	                            ",",
  	                        ]);
  	                    }
  	                    if (unbracedSpecifiers_1.length > 0) {
  	                        parts.push(", ");
  	                    }
  	                    if (lines.length > 1) {
  	                        parts.push("{\n", lines, "\n}");
  	                    }
  	                    else if (options.objectCurlySpacing) {
  	                        parts.push("{ ", lines, " }");
  	                    }
  	                    else {
  	                        parts.push("{", lines, "}");
  	                    }
  	                }
  	                parts.push(" from ");
  	            }
  	            parts.push(path.call(print, "source"), maybePrintImportAssertions(path, options, print), ";");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ImportAttribute":
  	            return (0, lines_1.concat)([path.call(print, "key"), ": ", path.call(print, "value")]);
  	        case "StaticBlock":
  	            parts.push("static ");
  	        // Intentionally fall through to BlockStatement below.
  	        case "BlockStatement": {
  	            var naked_1 = path.call(function (bodyPath) { return printStatementSequence(bodyPath, options, print); }, "body");
  	            if (naked_1.isEmpty()) {
  	                if (!n.directives || n.directives.length === 0) {
  	                    parts.push("{}");
  	                    return (0, lines_1.concat)(parts);
  	                }
  	            }
  	            parts.push("{\n");
  	            // Babel 6
  	            if (n.directives) {
  	                path.each(function (childPath) {
  	                    parts.push(maybeAddSemicolon(print(childPath).indent(options.tabWidth)), n.directives.length > 1 || !naked_1.isEmpty() ? "\n" : "");
  	                }, "directives");
  	            }
  	            parts.push(naked_1.indent(options.tabWidth));
  	            parts.push("\n}");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ReturnStatement": {
  	            parts.push("return");
  	            if (n.argument) {
  	                var argIsJsxElement = ((_a = namedTypes.JSXElement) === null || _a === void 0 ? void 0 : _a.check(n.argument)) ||
  	                    ((_b = namedTypes.JSXFragment) === null || _b === void 0 ? void 0 : _b.check(n.argument));
  	                var argLines = path.call(print, "argument");
  	                if (argLines.startsWithComment() ||
  	                    (argLines.length > 1 && argIsJsxElement)) {
  	                    // Babel: regenerate parenthesized jsxElements so we don't double parentheses
  	                    if (argIsJsxElement && ((_c = n.argument.extra) === null || _c === void 0 ? void 0 : _c.parenthesized)) {
  	                        n.argument.extra.parenthesized = false;
  	                        argLines = path.call(print, "argument");
  	                        n.argument.extra.parenthesized = true;
  	                    }
  	                    parts.push(" ", (0, lines_1.concat)(["(\n", argLines]).indentTail(options.tabWidth), "\n)");
  	                }
  	                else {
  	                    parts.push(" ", argLines);
  	                }
  	            }
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "CallExpression":
  	        case "OptionalCallExpression":
  	            parts.push(path.call(print, "callee"));
  	            if (n.typeParameters) {
  	                parts.push(path.call(print, "typeParameters"));
  	            }
  	            if (n.typeArguments) {
  	                parts.push(path.call(print, "typeArguments"));
  	            }
  	            // Like n.optional, but defaults to true for OptionalCallExpression
  	            // nodes that are missing an n.optional property (unusual),
  	            // according to the OptionalCallExpression definition in ast-types.
  	            if (types.getFieldValue(n, "optional")) {
  	                parts.push("?.");
  	            }
  	            parts.push(printArgumentsList(path, options, print));
  	            return (0, lines_1.concat)(parts);
  	        case "RecordExpression":
  	            parts.push("#");
  	        // Intentionally fall through to printing the object literal...
  	        case "ObjectExpression":
  	        case "ObjectPattern":
  	        case "ObjectTypeAnnotation": {
  	            var isTypeAnnotation_1 = n.type === "ObjectTypeAnnotation";
  	            var separator_1 = options.flowObjectCommas
  	                ? ","
  	                : isTypeAnnotation_1
  	                    ? ";"
  	                    : ",";
  	            var fields = [];
  	            var allowBreak_1 = false;
  	            if (isTypeAnnotation_1) {
  	                fields.push("indexers", "callProperties");
  	                if (n.internalSlots != null) {
  	                    fields.push("internalSlots");
  	                }
  	            }
  	            fields.push("properties");
  	            var len_1 = 0;
  	            fields.forEach(function (field) {
  	                len_1 += n[field].length;
  	            });
  	            var oneLine_1 = (isTypeAnnotation_1 && len_1 === 1) || len_1 === 0;
  	            var leftBrace = n.exact ? "{|" : "{";
  	            var rightBrace = n.exact ? "|}" : "}";
  	            parts.push(oneLine_1 ? leftBrace : leftBrace + "\n");
  	            var leftBraceIndex = parts.length - 1;
  	            var i_1 = 0;
  	            fields.forEach(function (field) {
  	                path.each(function (childPath) {
  	                    var lines = print(childPath);
  	                    if (!oneLine_1) {
  	                        lines = lines.indent(options.tabWidth);
  	                    }
  	                    var multiLine = !isTypeAnnotation_1 && lines.length > 1;
  	                    if (multiLine && allowBreak_1) {
  	                        // Similar to the logic for BlockStatement.
  	                        parts.push("\n");
  	                    }
  	                    parts.push(lines);
  	                    if (i_1 < len_1 - 1) {
  	                        // Add an extra line break if the previous object property
  	                        // had a multi-line value.
  	                        parts.push(separator_1 + (multiLine ? "\n\n" : "\n"));
  	                        allowBreak_1 = !multiLine;
  	                    }
  	                    else if (len_1 !== 1 && isTypeAnnotation_1) {
  	                        parts.push(separator_1);
  	                    }
  	                    else if (!oneLine_1 &&
  	                        util.isTrailingCommaEnabled(options, "objects") &&
  	                        childPath.getValue().type !== "RestElement") {
  	                        parts.push(separator_1);
  	                    }
  	                    i_1++;
  	                }, field);
  	            });
  	            if (n.inexact) {
  	                var line = (0, lines_1.fromString)("...", options);
  	                if (oneLine_1) {
  	                    if (len_1 > 0) {
  	                        parts.push(separator_1, " ");
  	                    }
  	                    parts.push(line);
  	                }
  	                else {
  	                    // No trailing separator after ... to maintain parity with prettier.
  	                    parts.push("\n", line.indent(options.tabWidth));
  	                }
  	            }
  	            parts.push(oneLine_1 ? rightBrace : "\n" + rightBrace);
  	            if (i_1 !== 0 && oneLine_1 && options.objectCurlySpacing) {
  	                parts[leftBraceIndex] = leftBrace + " ";
  	                parts[parts.length - 1] = " " + rightBrace;
  	            }
  	            if (n.typeAnnotation) {
  	                parts.push(path.call(print, "typeAnnotation"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "PropertyPattern":
  	            return (0, lines_1.concat)([
  	                path.call(print, "key"),
  	                ": ",
  	                path.call(print, "pattern"),
  	            ]);
  	        case "ObjectProperty": // Babel 6
  	        case "Property": {
  	            // Non-standard AST node type.
  	            if (n.method || n.kind === "get" || n.kind === "set") {
  	                return printMethod(path, options, print);
  	            }
  	            if (n.shorthand && n.value.type === "AssignmentPattern") {
  	                return path.call(print, "value");
  	            }
  	            var key = path.call(print, "key");
  	            if (n.computed) {
  	                parts.push("[", key, "]");
  	            }
  	            else {
  	                parts.push(key);
  	            }
  	            if (!n.shorthand || n.key.name !== n.value.name) {
  	                parts.push(": ", path.call(print, "value"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ClassMethod": // Babel 6
  	        case "ObjectMethod": // Babel 6
  	        case "ClassPrivateMethod":
  	        case "TSDeclareMethod":
  	            return printMethod(path, options, print);
  	        case "PrivateName":
  	            return (0, lines_1.concat)(["#", path.call(print, "id")]);
  	        case "Decorator":
  	            return (0, lines_1.concat)(["@", path.call(print, "expression")]);
  	        case "TupleExpression":
  	            parts.push("#");
  	        // Intentionally fall through to printing the tuple elements...
  	        case "ArrayExpression":
  	        case "ArrayPattern": {
  	            var elems = n.elements;
  	            var len_2 = elems.length;
  	            var printed_1 = path.map(print, "elements");
  	            var joined = (0, lines_1.fromString)(", ").join(printed_1);
  	            var oneLine_2 = joined.getLineLength(1) <= options.wrapColumn;
  	            if (oneLine_2) {
  	                if (options.arrayBracketSpacing) {
  	                    parts.push("[ ");
  	                }
  	                else {
  	                    parts.push("[");
  	                }
  	            }
  	            else {
  	                parts.push("[\n");
  	            }
  	            path.each(function (elemPath) {
  	                var i = elemPath.getName();
  	                var elem = elemPath.getValue();
  	                if (!elem) {
  	                    // If the array expression ends with a hole, that hole
  	                    // will be ignored by the interpreter, but if it ends with
  	                    // two (or more) holes, we need to write out two (or more)
  	                    // commas so that the resulting code is interpreted with
  	                    // both (all) of the holes.
  	                    parts.push(",");
  	                }
  	                else {
  	                    var lines = printed_1[i];
  	                    if (oneLine_2) {
  	                        if (i > 0)
  	                            parts.push(" ");
  	                    }
  	                    else {
  	                        lines = lines.indent(options.tabWidth);
  	                    }
  	                    parts.push(lines);
  	                    if (i < len_2 - 1 ||
  	                        (!oneLine_2 && util.isTrailingCommaEnabled(options, "arrays")))
  	                        parts.push(",");
  	                    if (!oneLine_2)
  	                        parts.push("\n");
  	                }
  	            }, "elements");
  	            if (oneLine_2 && options.arrayBracketSpacing) {
  	                parts.push(" ]");
  	            }
  	            else {
  	                parts.push("]");
  	            }
  	            if (n.typeAnnotation) {
  	                parts.push(path.call(print, "typeAnnotation"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "SequenceExpression":
  	            return (0, lines_1.fromString)(", ").join(path.map(print, "expressions"));
  	        case "ThisExpression":
  	            return (0, lines_1.fromString)("this");
  	        case "Super":
  	            return (0, lines_1.fromString)("super");
  	        case "NullLiteral": // Babel 6 Literal split
  	            return (0, lines_1.fromString)("null");
  	        case "RegExpLiteral": // Babel 6 Literal split
  	            return (0, lines_1.fromString)(getPossibleRaw(n) || "/".concat(n.pattern, "/").concat(n.flags || ""), options);
  	        case "BigIntLiteral": // Babel 7 Literal split
  	            return (0, lines_1.fromString)(getPossibleRaw(n) || n.value + "n", options);
  	        case "NumericLiteral": // Babel 6 Literal Split
  	            return (0, lines_1.fromString)(getPossibleRaw(n) || n.value, options);
  	        case "DecimalLiteral":
  	            return (0, lines_1.fromString)(getPossibleRaw(n) || n.value + "m", options);
  	        case "StringLiteral":
  	            return (0, lines_1.fromString)(nodeStr(n.value, options));
  	        case "BooleanLiteral": // Babel 6 Literal split
  	        case "Literal":
  	            return (0, lines_1.fromString)(getPossibleRaw(n) ||
  	                (typeof n.value === "string" ? nodeStr(n.value, options) : n.value), options);
  	        case "Directive": // Babel 6
  	            return path.call(print, "value");
  	        case "DirectiveLiteral": // Babel 6
  	            return (0, lines_1.fromString)(getPossibleRaw(n) || nodeStr(n.value, options), options);
  	        case "InterpreterDirective":
  	            return (0, lines_1.fromString)("#!".concat(n.value, "\n"), options);
  	        case "ModuleSpecifier":
  	            if (n.local) {
  	                throw new Error("The ESTree ModuleSpecifier type should be abstract");
  	            }
  	            // The Esprima ModuleSpecifier type is just a string-valued
  	            // Literal identifying the imported-from module.
  	            return (0, lines_1.fromString)(nodeStr(n.value, options), options);
  	        case "UnaryExpression":
  	            parts.push(n.operator);
  	            if (/[a-z]$/.test(n.operator))
  	                parts.push(" ");
  	            parts.push(path.call(print, "argument"));
  	            return (0, lines_1.concat)(parts);
  	        case "UpdateExpression":
  	            parts.push(path.call(print, "argument"), n.operator);
  	            if (n.prefix)
  	                parts.reverse();
  	            return (0, lines_1.concat)(parts);
  	        case "ConditionalExpression":
  	            return (0, lines_1.concat)([
  	                path.call(print, "test"),
  	                " ? ",
  	                path.call(print, "consequent"),
  	                " : ",
  	                path.call(print, "alternate"),
  	            ]);
  	        case "NewExpression": {
  	            parts.push("new ", path.call(print, "callee"));
  	            if (n.typeParameters) {
  	                parts.push(path.call(print, "typeParameters"));
  	            }
  	            if (n.typeArguments) {
  	                parts.push(path.call(print, "typeArguments"));
  	            }
  	            var args = n.arguments;
  	            if (args) {
  	                parts.push(printArgumentsList(path, options, print));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "VariableDeclaration": {
  	            if (n.declare) {
  	                parts.push("declare ");
  	            }
  	            parts.push(n.kind, " ");
  	            var maxLen_1 = 0;
  	            var printed = path.map(function (childPath) {
  	                var lines = print(childPath);
  	                maxLen_1 = Math.max(lines.length, maxLen_1);
  	                return lines;
  	            }, "declarations");
  	            if (maxLen_1 === 1) {
  	                parts.push((0, lines_1.fromString)(", ").join(printed));
  	            }
  	            else if (printed.length > 1) {
  	                parts.push((0, lines_1.fromString)(",\n")
  	                    .join(printed)
  	                    .indentTail(n.kind.length + 1));
  	            }
  	            else {
  	                parts.push(printed[0]);
  	            }
  	            // We generally want to terminate all variable declarations with a
  	            // semicolon, except when they are children of for loops.
  	            var parentNode = path.getParentNode();
  	            if (!namedTypes.ForStatement.check(parentNode) &&
  	                !namedTypes.ForInStatement.check(parentNode) &&
  	                !(namedTypes.ForOfStatement &&
  	                    namedTypes.ForOfStatement.check(parentNode)) &&
  	                !(namedTypes.ForAwaitStatement &&
  	                    namedTypes.ForAwaitStatement.check(parentNode))) {
  	                parts.push(";");
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "VariableDeclarator":
  	            return n.init
  	                ? (0, lines_1.fromString)(" = ").join([
  	                    path.call(print, "id"),
  	                    path.call(print, "init"),
  	                ])
  	                : path.call(print, "id");
  	        case "WithStatement":
  	            return (0, lines_1.concat)([
  	                "with (",
  	                path.call(print, "object"),
  	                ") ",
  	                path.call(print, "body"),
  	            ]);
  	        case "IfStatement": {
  	            var con = adjustClause(path.call(print, "consequent"), options);
  	            parts.push("if (", path.call(print, "test"), ")", con);
  	            if (n.alternate)
  	                parts.push(endsWithBrace(con) ? " else" : "\nelse", adjustClause(path.call(print, "alternate"), options));
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ForStatement": {
  	            // TODO Get the for (;;) case right.
  	            var init = path.call(print, "init");
  	            var sep = init.length > 1 ? ";\n" : "; ";
  	            var forParen = "for (";
  	            var indented = (0, lines_1.fromString)(sep)
  	                .join([init, path.call(print, "test"), path.call(print, "update")])
  	                .indentTail(forParen.length);
  	            var head = (0, lines_1.concat)([forParen, indented, ")"]);
  	            var clause = adjustClause(path.call(print, "body"), options);
  	            parts.push(head);
  	            if (head.length > 1) {
  	                parts.push("\n");
  	                clause = clause.trimLeft();
  	            }
  	            parts.push(clause);
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "WhileStatement":
  	            return (0, lines_1.concat)([
  	                "while (",
  	                path.call(print, "test"),
  	                ")",
  	                adjustClause(path.call(print, "body"), options),
  	            ]);
  	        case "ForInStatement":
  	            // Note: esprima can't actually parse "for each (".
  	            return (0, lines_1.concat)([
  	                n.each ? "for each (" : "for (",
  	                path.call(print, "left"),
  	                " in ",
  	                path.call(print, "right"),
  	                ")",
  	                adjustClause(path.call(print, "body"), options),
  	            ]);
  	        case "ForOfStatement":
  	        case "ForAwaitStatement":
  	            parts.push("for ");
  	            if (n.await || n.type === "ForAwaitStatement") {
  	                parts.push("await ");
  	            }
  	            parts.push("(", path.call(print, "left"), " of ", path.call(print, "right"), ")", adjustClause(path.call(print, "body"), options));
  	            return (0, lines_1.concat)(parts);
  	        case "DoWhileStatement": {
  	            var doBody = (0, lines_1.concat)([
  	                "do",
  	                adjustClause(path.call(print, "body"), options),
  	            ]);
  	            parts.push(doBody);
  	            if (endsWithBrace(doBody))
  	                parts.push(" while");
  	            else
  	                parts.push("\nwhile");
  	            parts.push(" (", path.call(print, "test"), ");");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "DoExpression": {
  	            var statements = path.call(function (bodyPath) { return printStatementSequence(bodyPath, options, print); }, "body");
  	            return (0, lines_1.concat)(["do {\n", statements.indent(options.tabWidth), "\n}"]);
  	        }
  	        case "BreakStatement":
  	            parts.push("break");
  	            if (n.label)
  	                parts.push(" ", path.call(print, "label"));
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        case "ContinueStatement":
  	            parts.push("continue");
  	            if (n.label)
  	                parts.push(" ", path.call(print, "label"));
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        case "LabeledStatement":
  	            return (0, lines_1.concat)([
  	                path.call(print, "label"),
  	                ":\n",
  	                path.call(print, "body"),
  	            ]);
  	        case "TryStatement":
  	            parts.push("try ", path.call(print, "block"));
  	            if (n.handler) {
  	                parts.push(" ", path.call(print, "handler"));
  	            }
  	            else if (n.handlers) {
  	                path.each(function (handlerPath) {
  	                    parts.push(" ", print(handlerPath));
  	                }, "handlers");
  	            }
  	            if (n.finalizer) {
  	                parts.push(" finally ", path.call(print, "finalizer"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "CatchClause":
  	            parts.push("catch ");
  	            if (n.param) {
  	                parts.push("(", path.call(print, "param"));
  	            }
  	            if (n.guard) {
  	                // Note: esprima does not recognize conditional catch clauses.
  	                parts.push(" if ", path.call(print, "guard"));
  	            }
  	            if (n.param) {
  	                parts.push(") ");
  	            }
  	            parts.push(path.call(print, "body"));
  	            return (0, lines_1.concat)(parts);
  	        case "ThrowStatement":
  	            return (0, lines_1.concat)(["throw ", path.call(print, "argument"), ";"]);
  	        case "SwitchStatement":
  	            return (0, lines_1.concat)([
  	                "switch (",
  	                path.call(print, "discriminant"),
  	                ") {\n",
  	                (0, lines_1.fromString)("\n").join(path.map(print, "cases")),
  	                "\n}",
  	            ]);
  	        // Note: ignoring n.lexical because it has no printing consequences.
  	        case "SwitchCase":
  	            if (n.test)
  	                parts.push("case ", path.call(print, "test"), ":");
  	            else
  	                parts.push("default:");
  	            if (n.consequent.length > 0) {
  	                parts.push("\n", path
  	                    .call(function (consequentPath) {
  	                    return printStatementSequence(consequentPath, options, print);
  	                }, "consequent")
  	                    .indent(options.tabWidth));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "DebuggerStatement":
  	            return (0, lines_1.fromString)("debugger;");
  	        // JSX extensions below.
  	        case "JSXAttribute":
  	            parts.push(path.call(print, "name"));
  	            if (n.value)
  	                parts.push("=", path.call(print, "value"));
  	            return (0, lines_1.concat)(parts);
  	        case "JSXIdentifier":
  	            return (0, lines_1.fromString)(n.name, options);
  	        case "JSXNamespacedName":
  	            return (0, lines_1.fromString)(":").join([
  	                path.call(print, "namespace"),
  	                path.call(print, "name"),
  	            ]);
  	        case "JSXMemberExpression":
  	            return (0, lines_1.fromString)(".").join([
  	                path.call(print, "object"),
  	                path.call(print, "property"),
  	            ]);
  	        case "JSXSpreadAttribute":
  	            return (0, lines_1.concat)(["{...", path.call(print, "argument"), "}"]);
  	        case "JSXSpreadChild":
  	            return (0, lines_1.concat)(["{...", path.call(print, "expression"), "}"]);
  	        case "JSXExpressionContainer":
  	            return (0, lines_1.concat)(["{", path.call(print, "expression"), "}"]);
  	        case "JSXElement":
  	        case "JSXFragment": {
  	            var openingPropName = "opening" + (n.type === "JSXElement" ? "Element" : "Fragment");
  	            var closingPropName = "closing" + (n.type === "JSXElement" ? "Element" : "Fragment");
  	            var openingLines = path.call(print, openingPropName);
  	            if (n[openingPropName].selfClosing) {
  	                (0, tiny_invariant_1.default)(!n[closingPropName], "unexpected " +
  	                    closingPropName +
  	                    " element in self-closing " +
  	                    n.type);
  	                return openingLines;
  	            }
  	            var childLines = (0, lines_1.concat)(path.map(function (childPath) {
  	                var child = childPath.getValue();
  	                if (namedTypes.Literal.check(child) &&
  	                    typeof child.value === "string") {
  	                    if (/\S/.test(child.value)) {
  	                        return child.value.replace(/^\s+/g, "");
  	                    }
  	                    else if (/\n/.test(child.value)) {
  	                        return "\n";
  	                    }
  	                }
  	                return print(childPath);
  	            }, "children")).indentTail(options.tabWidth);
  	            var closingLines = path.call(print, closingPropName);
  	            return (0, lines_1.concat)([openingLines, childLines, closingLines]);
  	        }
  	        case "JSXOpeningElement": {
  	            parts.push("<", path.call(print, "name"));
  	            var typeDefPart = path.call(print, "typeParameters");
  	            if (typeDefPart.length)
  	                parts.push(typeDefPart);
  	            var attrParts_1 = [];
  	            path.each(function (attrPath) {
  	                attrParts_1.push(" ", print(attrPath));
  	            }, "attributes");
  	            var attrLines = (0, lines_1.concat)(attrParts_1);
  	            var needLineWrap = attrLines.length > 1 || attrLines.getLineLength(1) > options.wrapColumn;
  	            if (needLineWrap) {
  	                attrParts_1.forEach(function (part, i) {
  	                    if (part === " ") {
  	                        (0, tiny_invariant_1.default)(i % 2 === 0);
  	                        attrParts_1[i] = "\n";
  	                    }
  	                });
  	                attrLines = (0, lines_1.concat)(attrParts_1).indentTail(options.tabWidth);
  	            }
  	            parts.push(attrLines, n.selfClosing ? " />" : ">");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "JSXClosingElement":
  	            return (0, lines_1.concat)(["</", path.call(print, "name"), ">"]);
  	        case "JSXOpeningFragment":
  	            return (0, lines_1.fromString)("<>");
  	        case "JSXClosingFragment":
  	            return (0, lines_1.fromString)("</>");
  	        case "JSXText":
  	            return (0, lines_1.fromString)(n.value, options);
  	        case "JSXEmptyExpression":
  	            return (0, lines_1.fromString)("");
  	        case "TypeAnnotatedIdentifier":
  	            return (0, lines_1.concat)([
  	                path.call(print, "annotation"),
  	                " ",
  	                path.call(print, "identifier"),
  	            ]);
  	        case "ClassBody":
  	            if (n.body.length === 0) {
  	                return (0, lines_1.fromString)("{}");
  	            }
  	            return (0, lines_1.concat)([
  	                "{\n",
  	                path
  	                    .call(function (bodyPath) { return printStatementSequence(bodyPath, options, print); }, "body")
  	                    .indent(options.tabWidth),
  	                "\n}",
  	            ]);
  	        case "ClassPropertyDefinition":
  	            parts.push("static ", path.call(print, "definition"));
  	            if (!namedTypes.MethodDefinition.check(n.definition))
  	                parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        case "ClassProperty": {
  	            if (n.declare) {
  	                parts.push("declare ");
  	            }
  	            var access = n.accessibility || n.access;
  	            if (typeof access === "string") {
  	                parts.push(access, " ");
  	            }
  	            if (n.static) {
  	                parts.push("static ");
  	            }
  	            if (n.abstract) {
  	                parts.push("abstract ");
  	            }
  	            if (n.readonly) {
  	                parts.push("readonly ");
  	            }
  	            var key = path.call(print, "key");
  	            if (n.computed) {
  	                key = (0, lines_1.concat)(["[", key, "]"]);
  	            }
  	            if (n.variance) {
  	                key = (0, lines_1.concat)([printVariance(path, print), key]);
  	            }
  	            parts.push(key);
  	            if (n.optional) {
  	                parts.push("?");
  	            }
  	            if (n.definite) {
  	                parts.push("!");
  	            }
  	            if (n.typeAnnotation) {
  	                parts.push(path.call(print, "typeAnnotation"));
  	            }
  	            if (n.value) {
  	                parts.push(" = ", path.call(print, "value"));
  	            }
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ClassPrivateProperty":
  	            if (n.static) {
  	                parts.push("static ");
  	            }
  	            parts.push(path.call(print, "key"));
  	            if (n.typeAnnotation) {
  	                parts.push(path.call(print, "typeAnnotation"));
  	            }
  	            if (n.value) {
  	                parts.push(" = ", path.call(print, "value"));
  	            }
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        case "ClassAccessorProperty": {
  	            parts.push.apply(parts, tslib_1.__spreadArray(tslib_1.__spreadArray([], printClassMemberModifiers(n), false), ["accessor "], false));
  	            if (n.computed) {
  	                parts.push("[", path.call(print, "key"), "]");
  	            }
  	            else {
  	                parts.push(path.call(print, "key"));
  	            }
  	            if (n.optional) {
  	                parts.push("?");
  	            }
  	            if (n.definite) {
  	                parts.push("!");
  	            }
  	            if (n.typeAnnotation) {
  	                parts.push(path.call(print, "typeAnnotation"));
  	            }
  	            if (n.value) {
  	                parts.push(" = ", path.call(print, "value"));
  	            }
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "ClassDeclaration":
  	        case "ClassExpression":
  	        case "DeclareClass":
  	            if (n.declare) {
  	                parts.push("declare ");
  	            }
  	            if (n.abstract) {
  	                parts.push("abstract ");
  	            }
  	            parts.push("class");
  	            if (n.id) {
  	                parts.push(" ", path.call(print, "id"));
  	            }
  	            if (n.typeParameters) {
  	                parts.push(path.call(print, "typeParameters"));
  	            }
  	            if (n.superClass) {
  	                // ClassDeclaration and ClassExpression only
  	                parts.push(" extends ", path.call(print, "superClass"), path.call(print, "superTypeParameters"));
  	            }
  	            if (n.extends && n.extends.length > 0) {
  	                // DeclareClass only
  	                parts.push(" extends ", (0, lines_1.fromString)(", ").join(path.map(print, "extends")));
  	            }
  	            if (n["implements"] && n["implements"].length > 0) {
  	                parts.push(" implements ", (0, lines_1.fromString)(", ").join(path.map(print, "implements")));
  	            }
  	            parts.push(" ", path.call(print, "body"));
  	            if (n.type === "DeclareClass") {
  	                return printFlowDeclaration(path, parts);
  	            }
  	            else {
  	                return (0, lines_1.concat)(parts);
  	            }
  	        case "TemplateElement":
  	            return (0, lines_1.fromString)(n.value.raw, options).lockIndentTail();
  	        case "TemplateLiteral": {
  	            var expressions_1 = path.map(print, "expressions");
  	            parts.push("`");
  	            path.each(function (childPath) {
  	                var i = childPath.getName();
  	                parts.push(print(childPath));
  	                if (i < expressions_1.length) {
  	                    parts.push("${", expressions_1[i], "}");
  	                }
  	            }, "quasis");
  	            parts.push("`");
  	            return (0, lines_1.concat)(parts).lockIndentTail();
  	        }
  	        case "TaggedTemplateExpression":
  	            parts.push(path.call(print, "tag"));
  	            if (n.typeParameters) {
  	                parts.push(path.call(print, "typeParameters"));
  	            }
  	            parts.push(path.call(print, "quasi"));
  	            return (0, lines_1.concat)(parts);
  	        // These types are unprintable because they serve as abstract
  	        // supertypes for other (printable) types.
  	        case "Node":
  	        case "Printable":
  	        case "SourceLocation":
  	        case "Position":
  	        case "Statement":
  	        case "Function":
  	        case "Pattern":
  	        case "Expression":
  	        case "Declaration":
  	        case "Specifier":
  	        case "NamedSpecifier":
  	        case "Comment": // Supertype of Block and Line
  	        case "Flow": // Supertype of all Flow AST node types
  	        case "FlowType": // Supertype of all Flow types
  	        case "FlowPredicate": // Supertype of InferredPredicate and DeclaredPredicate
  	        case "MemberTypeAnnotation": // Flow
  	        case "Type": // Flow
  	        case "TSHasOptionalTypeParameterInstantiation":
  	        case "TSHasOptionalTypeParameters":
  	        case "TSHasOptionalTypeAnnotation":
  	        case "ChainElement": // Supertype of MemberExpression and CallExpression
  	            throw new Error("unprintable type: " + JSON.stringify(n.type));
  	        case "CommentBlock": // Babel block comment.
  	        case "Block": // Esprima block comment.
  	            return (0, lines_1.concat)(["/*", (0, lines_1.fromString)(n.value, options), "*/"]);
  	        case "CommentLine": // Babel line comment.
  	        case "Line": // Esprima line comment.
  	            return (0, lines_1.concat)(["//", (0, lines_1.fromString)(n.value, options)]);
  	        // Type Annotations for Facebook Flow, typically stripped out or
  	        // transformed away before printing.
  	        case "TypeAnnotation":
  	            if (n.typeAnnotation) {
  	                if (n.typeAnnotation.type !== "FunctionTypeAnnotation") {
  	                    parts.push(": ");
  	                }
  	                parts.push(path.call(print, "typeAnnotation"));
  	                return (0, lines_1.concat)(parts);
  	            }
  	            return (0, lines_1.fromString)("");
  	        case "ExistentialTypeParam":
  	        case "ExistsTypeAnnotation":
  	            return (0, lines_1.fromString)("*", options);
  	        case "EmptyTypeAnnotation":
  	            return (0, lines_1.fromString)("empty", options);
  	        case "AnyTypeAnnotation":
  	            return (0, lines_1.fromString)("any", options);
  	        case "MixedTypeAnnotation":
  	            return (0, lines_1.fromString)("mixed", options);
  	        case "ArrayTypeAnnotation":
  	            return (0, lines_1.concat)([path.call(print, "elementType"), "[]"]);
  	        case "TupleTypeAnnotation": {
  	            var printed_2 = path.map(print, "types");
  	            var joined = (0, lines_1.fromString)(", ").join(printed_2);
  	            var oneLine_3 = joined.getLineLength(1) <= options.wrapColumn;
  	            if (oneLine_3) {
  	                if (options.arrayBracketSpacing) {
  	                    parts.push("[ ");
  	                }
  	                else {
  	                    parts.push("[");
  	                }
  	            }
  	            else {
  	                parts.push("[\n");
  	            }
  	            path.each(function (elemPath) {
  	                var i = elemPath.getName();
  	                var elem = elemPath.getValue();
  	                if (!elem) {
  	                    // If the array expression ends with a hole, that hole
  	                    // will be ignored by the interpreter, but if it ends with
  	                    // two (or more) holes, we need to write out two (or more)
  	                    // commas so that the resulting code is interpreted with
  	                    // both (all) of the holes.
  	                    parts.push(",");
  	                }
  	                else {
  	                    var lines = printed_2[i];
  	                    if (oneLine_3) {
  	                        if (i > 0)
  	                            parts.push(" ");
  	                    }
  	                    else {
  	                        lines = lines.indent(options.tabWidth);
  	                    }
  	                    parts.push(lines);
  	                    if (i < n.types.length - 1 ||
  	                        (!oneLine_3 && util.isTrailingCommaEnabled(options, "arrays")))
  	                        parts.push(",");
  	                    if (!oneLine_3)
  	                        parts.push("\n");
  	                }
  	            }, "types");
  	            if (oneLine_3 && options.arrayBracketSpacing) {
  	                parts.push(" ]");
  	            }
  	            else {
  	                parts.push("]");
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "BooleanTypeAnnotation":
  	            return (0, lines_1.fromString)("boolean", options);
  	        case "BooleanLiteralTypeAnnotation":
  	            (0, tiny_invariant_1.default)(typeof n.value === "boolean");
  	            return (0, lines_1.fromString)("" + n.value, options);
  	        case "InterfaceTypeAnnotation":
  	            parts.push("interface");
  	            if (n.extends && n.extends.length > 0) {
  	                parts.push(" extends ", (0, lines_1.fromString)(", ").join(path.map(print, "extends")));
  	            }
  	            parts.push(" ", path.call(print, "body"));
  	            return (0, lines_1.concat)(parts);
  	        case "DeclareFunction":
  	            return printFlowDeclaration(path, [
  	                "function ",
  	                path.call(print, "id"),
  	                ";",
  	            ]);
  	        case "DeclareModule":
  	            return printFlowDeclaration(path, [
  	                "module ",
  	                path.call(print, "id"),
  	                " ",
  	                path.call(print, "body"),
  	            ]);
  	        case "DeclareModuleExports":
  	            return printFlowDeclaration(path, [
  	                "module.exports",
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "DeclareVariable":
  	            return printFlowDeclaration(path, ["var ", path.call(print, "id"), ";"]);
  	        case "DeclareExportDeclaration":
  	        case "DeclareExportAllDeclaration":
  	            return (0, lines_1.concat)(["declare ", printExportDeclaration(path, options, print)]);
  	        case "EnumDeclaration":
  	            return (0, lines_1.concat)([
  	                "enum ",
  	                path.call(print, "id"),
  	                path.call(print, "body"),
  	            ]);
  	        case "EnumBooleanBody":
  	        case "EnumNumberBody":
  	        case "EnumStringBody":
  	        case "EnumSymbolBody": {
  	            if (n.type === "EnumSymbolBody" || n.explicitType) {
  	                parts.push(" of ", 
  	                // EnumBooleanBody => boolean, etc.
  	                n.type.slice(4, -4).toLowerCase());
  	            }
  	            parts.push(" {\n", (0, lines_1.fromString)("\n")
  	                .join(path.map(print, "members"))
  	                .indent(options.tabWidth), "\n}");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "EnumDefaultedMember":
  	            return (0, lines_1.concat)([path.call(print, "id"), ","]);
  	        case "EnumBooleanMember":
  	        case "EnumNumberMember":
  	        case "EnumStringMember":
  	            return (0, lines_1.concat)([
  	                path.call(print, "id"),
  	                " = ",
  	                path.call(print, "init"),
  	                ",",
  	            ]);
  	        case "InferredPredicate":
  	            return (0, lines_1.fromString)("%checks", options);
  	        case "DeclaredPredicate":
  	            return (0, lines_1.concat)(["%checks(", path.call(print, "value"), ")"]);
  	        case "FunctionTypeAnnotation": {
  	            // FunctionTypeAnnotation is ambiguous:
  	            // declare function(a: B): void; OR
  	            // const A: (a: B) => void;
  	            var parent = path.getParentNode(0);
  	            var isArrowFunctionTypeAnnotation = !(namedTypes.ObjectTypeCallProperty.check(parent) ||
  	                (namedTypes.ObjectTypeInternalSlot.check(parent) && parent.method) ||
  	                namedTypes.DeclareFunction.check(path.getParentNode(2)));
  	            var needsColon = isArrowFunctionTypeAnnotation &&
  	                !namedTypes.FunctionTypeParam.check(parent) &&
  	                !namedTypes.TypeAlias.check(parent);
  	            if (needsColon) {
  	                parts.push(": ");
  	            }
  	            var hasTypeParameters = !!n.typeParameters;
  	            var needsParens = hasTypeParameters || n.params.length !== 1 || n.params[0].name;
  	            parts.push(hasTypeParameters ? path.call(print, "typeParameters") : "", needsParens ? "(" : "", printFunctionParams(path, options, print), needsParens ? ")" : "");
  	            // The returnType is not wrapped in a TypeAnnotation, so the colon
  	            // needs to be added separately.
  	            if (n.returnType) {
  	                parts.push(isArrowFunctionTypeAnnotation ? " => " : ": ", path.call(print, "returnType"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "FunctionTypeParam": {
  	            var name = path.call(print, "name");
  	            parts.push(name);
  	            if (n.optional) {
  	                parts.push("?");
  	            }
  	            if (name.infos[0].line) {
  	                parts.push(": ");
  	            }
  	            parts.push(path.call(print, "typeAnnotation"));
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "GenericTypeAnnotation":
  	            return (0, lines_1.concat)([
  	                path.call(print, "id"),
  	                path.call(print, "typeParameters"),
  	            ]);
  	        case "DeclareInterface":
  	            parts.push("declare ");
  	        // Fall through to InterfaceDeclaration...
  	        case "InterfaceDeclaration":
  	        case "TSInterfaceDeclaration":
  	            if (n.declare) {
  	                parts.push("declare ");
  	            }
  	            parts.push("interface ", path.call(print, "id"), path.call(print, "typeParameters"), " ");
  	            if (n["extends"] && n["extends"].length > 0) {
  	                parts.push("extends ", (0, lines_1.fromString)(", ").join(path.map(print, "extends")), " ");
  	            }
  	            if (n.body) {
  	                parts.push(path.call(print, "body"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "ClassImplements":
  	        case "InterfaceExtends":
  	            return (0, lines_1.concat)([
  	                path.call(print, "id"),
  	                path.call(print, "typeParameters"),
  	            ]);
  	        case "IntersectionTypeAnnotation":
  	            return (0, lines_1.fromString)(" & ").join(path.map(print, "types"));
  	        case "NullableTypeAnnotation":
  	            return (0, lines_1.concat)(["?", path.call(print, "typeAnnotation")]);
  	        case "NullLiteralTypeAnnotation":
  	            return (0, lines_1.fromString)("null", options);
  	        case "ThisTypeAnnotation":
  	            return (0, lines_1.fromString)("this", options);
  	        case "NumberTypeAnnotation":
  	            return (0, lines_1.fromString)("number", options);
  	        case "ObjectTypeCallProperty":
  	            return path.call(print, "value");
  	        case "ObjectTypeIndexer":
  	            if (n.static) {
  	                parts.push("static ");
  	            }
  	            parts.push(printVariance(path, print), "[");
  	            if (n.id) {
  	                parts.push(path.call(print, "id"), ": ");
  	            }
  	            parts.push(path.call(print, "key"), "]: ", path.call(print, "value"));
  	            return (0, lines_1.concat)(parts);
  	        case "ObjectTypeProperty":
  	            return (0, lines_1.concat)([
  	                printVariance(path, print),
  	                path.call(print, "key"),
  	                n.optional ? "?" : "",
  	                ": ",
  	                path.call(print, "value"),
  	            ]);
  	        case "ObjectTypeInternalSlot":
  	            return (0, lines_1.concat)([
  	                n.static ? "static " : "",
  	                "[[",
  	                path.call(print, "id"),
  	                "]]",
  	                n.optional ? "?" : "",
  	                n.value.type !== "FunctionTypeAnnotation" ? ": " : "",
  	                path.call(print, "value"),
  	            ]);
  	        case "QualifiedTypeIdentifier":
  	            return (0, lines_1.concat)([
  	                path.call(print, "qualification"),
  	                ".",
  	                path.call(print, "id"),
  	            ]);
  	        case "StringLiteralTypeAnnotation":
  	            return (0, lines_1.fromString)(nodeStr(n.value, options), options);
  	        case "NumberLiteralTypeAnnotation":
  	        case "NumericLiteralTypeAnnotation":
  	            (0, tiny_invariant_1.default)(typeof n.value === "number");
  	            return (0, lines_1.fromString)(JSON.stringify(n.value), options);
  	        case "BigIntLiteralTypeAnnotation":
  	            return (0, lines_1.fromString)(n.raw, options);
  	        case "StringTypeAnnotation":
  	            return (0, lines_1.fromString)("string", options);
  	        case "DeclareTypeAlias":
  	            parts.push("declare ");
  	        // Fall through to TypeAlias...
  	        case "TypeAlias":
  	            return (0, lines_1.concat)([
  	                "type ",
  	                path.call(print, "id"),
  	                path.call(print, "typeParameters"),
  	                " = ",
  	                path.call(print, "right"),
  	                ";",
  	            ]);
  	        case "DeclareOpaqueType":
  	            parts.push("declare ");
  	        // Fall through to OpaqueType...
  	        case "OpaqueType":
  	            parts.push("opaque type ", path.call(print, "id"), path.call(print, "typeParameters"));
  	            if (n["supertype"]) {
  	                parts.push(": ", path.call(print, "supertype"));
  	            }
  	            if (n["impltype"]) {
  	                parts.push(" = ", path.call(print, "impltype"));
  	            }
  	            parts.push(";");
  	            return (0, lines_1.concat)(parts);
  	        case "TypeCastExpression":
  	            return (0, lines_1.concat)([
  	                "(",
  	                path.call(print, "expression"),
  	                path.call(print, "typeAnnotation"),
  	                ")",
  	            ]);
  	        case "TypeParameterDeclaration":
  	        case "TypeParameterInstantiation":
  	            return (0, lines_1.concat)([
  	                "<",
  	                (0, lines_1.fromString)(", ").join(path.map(print, "params")),
  	                ">",
  	            ]);
  	        case "Variance":
  	            if (n.kind === "plus") {
  	                return (0, lines_1.fromString)("+");
  	            }
  	            if (n.kind === "minus") {
  	                return (0, lines_1.fromString)("-");
  	            }
  	            return (0, lines_1.fromString)("");
  	        case "TypeParameter":
  	            if (n.variance) {
  	                parts.push(printVariance(path, print));
  	            }
  	            parts.push(path.call(print, "name"));
  	            if (n.bound) {
  	                parts.push(path.call(print, "bound"));
  	            }
  	            if (n["default"]) {
  	                parts.push("=", path.call(print, "default"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "TypeofTypeAnnotation":
  	            return (0, lines_1.concat)([
  	                (0, lines_1.fromString)("typeof ", options),
  	                path.call(print, "argument"),
  	            ]);
  	        case "IndexedAccessType":
  	        case "OptionalIndexedAccessType":
  	            return (0, lines_1.concat)([
  	                path.call(print, "objectType"),
  	                n.optional ? "?." : "",
  	                "[",
  	                path.call(print, "indexType"),
  	                "]",
  	            ]);
  	        case "UnionTypeAnnotation":
  	            return (0, lines_1.fromString)(" | ").join(path.map(print, "types"));
  	        case "VoidTypeAnnotation":
  	            return (0, lines_1.fromString)("void", options);
  	        case "NullTypeAnnotation":
  	            return (0, lines_1.fromString)("null", options);
  	        case "SymbolTypeAnnotation":
  	            return (0, lines_1.fromString)("symbol", options);
  	        case "BigIntTypeAnnotation":
  	            return (0, lines_1.fromString)("bigint", options);
  	        // Type Annotations for TypeScript (when using Babylon as parser)
  	        case "TSType":
  	            throw new Error("unprintable type: " + JSON.stringify(n.type));
  	        case "TSNumberKeyword":
  	            return (0, lines_1.fromString)("number", options);
  	        case "TSBigIntKeyword":
  	            return (0, lines_1.fromString)("bigint", options);
  	        case "TSObjectKeyword":
  	            return (0, lines_1.fromString)("object", options);
  	        case "TSBooleanKeyword":
  	            return (0, lines_1.fromString)("boolean", options);
  	        case "TSStringKeyword":
  	            return (0, lines_1.fromString)("string", options);
  	        case "TSSymbolKeyword":
  	            return (0, lines_1.fromString)("symbol", options);
  	        case "TSAnyKeyword":
  	            return (0, lines_1.fromString)("any", options);
  	        case "TSVoidKeyword":
  	            return (0, lines_1.fromString)("void", options);
  	        case "TSIntrinsicKeyword":
  	            return (0, lines_1.fromString)("intrinsic", options);
  	        case "TSThisType":
  	            return (0, lines_1.fromString)("this", options);
  	        case "TSNullKeyword":
  	            return (0, lines_1.fromString)("null", options);
  	        case "TSUndefinedKeyword":
  	            return (0, lines_1.fromString)("undefined", options);
  	        case "TSUnknownKeyword":
  	            return (0, lines_1.fromString)("unknown", options);
  	        case "TSNeverKeyword":
  	            return (0, lines_1.fromString)("never", options);
  	        case "TSArrayType":
  	            return (0, lines_1.concat)([path.call(print, "elementType"), "[]"]);
  	        case "TSLiteralType":
  	            return path.call(print, "literal");
  	        case "TSUnionType":
  	            return (0, lines_1.fromString)(" | ").join(path.map(print, "types"));
  	        case "TSIntersectionType":
  	            return (0, lines_1.fromString)(" & ").join(path.map(print, "types"));
  	        case "TSConditionalType":
  	            parts.push(path.call(print, "checkType"), " extends ", path.call(print, "extendsType"), " ? ", path.call(print, "trueType"), " : ", path.call(print, "falseType"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSInferType":
  	            parts.push("infer ", path.call(print, "typeParameter"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSParenthesizedType":
  	            return (0, lines_1.concat)(["(", path.call(print, "typeAnnotation"), ")"]);
  	        case "TSFunctionType":
  	            return (0, lines_1.concat)([
  	                path.call(print, "typeParameters"),
  	                "(",
  	                printFunctionParams(path, options, print),
  	                ") => ",
  	                path.call(print, "typeAnnotation", "typeAnnotation"),
  	            ]);
  	        case "TSConstructorType":
  	            return (0, lines_1.concat)([
  	                "new ",
  	                path.call(print, "typeParameters"),
  	                "(",
  	                printFunctionParams(path, options, print),
  	                ") => ",
  	                path.call(print, "typeAnnotation", "typeAnnotation"),
  	            ]);
  	        case "TSMappedType": {
  	            parts.push(n.readonly ? "readonly " : "", "[", path.call(print, "typeParameter"), "]", n.optional ? "?" : "");
  	            if (n.typeAnnotation) {
  	                parts.push(": ", path.call(print, "typeAnnotation"), ";");
  	            }
  	            return (0, lines_1.concat)(["{\n", (0, lines_1.concat)(parts).indent(options.tabWidth), "\n}"]);
  	        }
  	        case "TSTupleType":
  	            return (0, lines_1.concat)([
  	                "[",
  	                (0, lines_1.fromString)(", ").join(path.map(print, "elementTypes")),
  	                "]",
  	            ]);
  	        case "TSNamedTupleMember":
  	            parts.push(path.call(print, "label"));
  	            if (n.optional) {
  	                parts.push("?");
  	            }
  	            parts.push(": ", path.call(print, "elementType"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSRestType":
  	            return (0, lines_1.concat)(["...", path.call(print, "typeAnnotation")]);
  	        case "TSOptionalType":
  	            return (0, lines_1.concat)([path.call(print, "typeAnnotation"), "?"]);
  	        case "TSIndexedAccessType":
  	            return (0, lines_1.concat)([
  	                path.call(print, "objectType"),
  	                "[",
  	                path.call(print, "indexType"),
  	                "]",
  	            ]);
  	        case "TSTypeOperator":
  	            return (0, lines_1.concat)([
  	                path.call(print, "operator"),
  	                " ",
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "TSTypeLiteral": {
  	            var members = (0, lines_1.fromString)("\n").join(path.map(print, "members").map(function (member) {
  	                if (lastNonSpaceCharacter(member) !== ";") {
  	                    return member.concat(";");
  	                }
  	                return member;
  	            }));
  	            if (members.isEmpty()) {
  	                return (0, lines_1.fromString)("{}", options);
  	            }
  	            parts.push("{\n", members.indent(options.tabWidth), "\n}");
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSEnumMember":
  	            parts.push(path.call(print, "id"));
  	            if (n.initializer) {
  	                parts.push(" = ", path.call(print, "initializer"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "TSTypeQuery":
  	            return (0, lines_1.concat)(["typeof ", path.call(print, "exprName")]);
  	        case "TSParameterProperty":
  	            if (n.accessibility) {
  	                parts.push(n.accessibility, " ");
  	            }
  	            if (n.export) {
  	                parts.push("export ");
  	            }
  	            if (n.static) {
  	                parts.push("static ");
  	            }
  	            if (n.readonly) {
  	                parts.push("readonly ");
  	            }
  	            parts.push(path.call(print, "parameter"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSTypeReference":
  	            return (0, lines_1.concat)([
  	                path.call(print, "typeName"),
  	                path.call(print, "typeParameters"),
  	            ]);
  	        case "TSQualifiedName":
  	            return (0, lines_1.concat)([path.call(print, "left"), ".", path.call(print, "right")]);
  	        case "TSAsExpression":
  	        case "TSSatisfiesExpression": {
  	            var expression = path.call(print, "expression");
  	            parts.push(expression, n.type === "TSSatisfiesExpression" ? " satisfies " : " as ", path.call(print, "typeAnnotation"));
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSTypeCastExpression":
  	            return (0, lines_1.concat)([
  	                path.call(print, "expression"),
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "TSNonNullExpression":
  	            return (0, lines_1.concat)([path.call(print, "expression"), "!"]);
  	        case "TSTypeAnnotation":
  	            return (0, lines_1.concat)([": ", path.call(print, "typeAnnotation")]);
  	        case "TSIndexSignature":
  	            return (0, lines_1.concat)([
  	                n.readonly ? "readonly " : "",
  	                "[",
  	                path.map(print, "parameters"),
  	                "]",
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "TSPropertySignature":
  	            parts.push(printVariance(path, print), n.readonly ? "readonly " : "");
  	            if (n.computed) {
  	                parts.push("[", path.call(print, "key"), "]");
  	            }
  	            else {
  	                parts.push(path.call(print, "key"));
  	            }
  	            parts.push(n.optional ? "?" : "", path.call(print, "typeAnnotation"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSMethodSignature":
  	            if (n.kind === "get") {
  	                parts.push("get ");
  	            }
  	            else if (n.kind === "set") {
  	                parts.push("set ");
  	            }
  	            if (n.computed) {
  	                parts.push("[", path.call(print, "key"), "]");
  	            }
  	            else {
  	                parts.push(path.call(print, "key"));
  	            }
  	            if (n.optional) {
  	                parts.push("?");
  	            }
  	            parts.push(path.call(print, "typeParameters"), "(", printFunctionParams(path, options, print), ")", path.call(print, "typeAnnotation"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSTypePredicate":
  	            if (n.asserts) {
  	                parts.push("asserts ");
  	            }
  	            parts.push(path.call(print, "parameterName"));
  	            if (n.typeAnnotation) {
  	                parts.push(" is ", path.call(print, "typeAnnotation", "typeAnnotation"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "TSCallSignatureDeclaration":
  	            return (0, lines_1.concat)([
  	                path.call(print, "typeParameters"),
  	                "(",
  	                printFunctionParams(path, options, print),
  	                ")",
  	                path.call(print, "typeAnnotation"),
  	            ]);
  	        case "TSConstructSignatureDeclaration":
  	            if (n.typeParameters) {
  	                parts.push("new", path.call(print, "typeParameters"));
  	            }
  	            else {
  	                parts.push("new ");
  	            }
  	            parts.push("(", printFunctionParams(path, options, print), ")", path.call(print, "typeAnnotation"));
  	            return (0, lines_1.concat)(parts);
  	        case "TSTypeAliasDeclaration":
  	            return (0, lines_1.concat)([
  	                n.declare ? "declare " : "",
  	                "type ",
  	                path.call(print, "id"),
  	                path.call(print, "typeParameters"),
  	                " = ",
  	                path.call(print, "typeAnnotation"),
  	                ";",
  	            ]);
  	        case "TSTypeParameter": {
  	            parts.push(path.call(print, "name"));
  	            // ambiguous because of TSMappedType
  	            var parent = path.getParentNode(0);
  	            var isInMappedType = namedTypes.TSMappedType.check(parent);
  	            if (n.constraint) {
  	                parts.push(isInMappedType ? " in " : " extends ", path.call(print, "constraint"));
  	            }
  	            if (n["default"]) {
  	                parts.push(" = ", path.call(print, "default"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSTypeAssertion": {
  	            parts.push("<", path.call(print, "typeAnnotation"), "> ", path.call(print, "expression"));
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSTypeParameterDeclaration":
  	        case "TSTypeParameterInstantiation":
  	            return (0, lines_1.concat)([
  	                "<",
  	                (0, lines_1.fromString)(", ").join(path.map(print, "params")),
  	                ">",
  	            ]);
  	        case "TSEnumDeclaration": {
  	            parts.push(n.declare ? "declare " : "", n.const ? "const " : "", "enum ", path.call(print, "id"));
  	            var memberLines = (0, lines_1.fromString)(",\n").join(path.map(print, "members"));
  	            if (memberLines.isEmpty()) {
  	                parts.push(" {}");
  	            }
  	            else {
  	                parts.push(" {\n", memberLines.indent(options.tabWidth), "\n}");
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSExpressionWithTypeArguments":
  	            return (0, lines_1.concat)([
  	                path.call(print, "expression"),
  	                path.call(print, "typeParameters"),
  	            ]);
  	        case "TSInterfaceBody": {
  	            var lines = (0, lines_1.fromString)("\n").join(path.map(print, "body").map(function (element) {
  	                if (lastNonSpaceCharacter(element) !== ";") {
  	                    return element.concat(";");
  	                }
  	                return element;
  	            }));
  	            if (lines.isEmpty()) {
  	                return (0, lines_1.fromString)("{}", options);
  	            }
  	            return (0, lines_1.concat)(["{\n", lines.indent(options.tabWidth), "\n}"]);
  	        }
  	        case "TSImportType":
  	            parts.push("import(", path.call(print, "argument"), ")");
  	            if (n.qualifier) {
  	                parts.push(".", path.call(print, "qualifier"));
  	            }
  	            if (n.typeParameters) {
  	                parts.push(path.call(print, "typeParameters"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        case "TSImportEqualsDeclaration":
  	            if (n.isExport) {
  	                parts.push("export ");
  	            }
  	            parts.push("import ", path.call(print, "id"), " = ", path.call(print, "moduleReference"));
  	            return maybeAddSemicolon((0, lines_1.concat)(parts));
  	        case "TSExternalModuleReference":
  	            return (0, lines_1.concat)(["require(", path.call(print, "expression"), ")"]);
  	        case "TSModuleDeclaration": {
  	            var parent = path.getParentNode();
  	            if (parent.type === "TSModuleDeclaration") {
  	                parts.push(".");
  	            }
  	            else {
  	                if (n.declare) {
  	                    parts.push("declare ");
  	                }
  	                if (!n.global) {
  	                    var isExternal = n.id.type === "StringLiteral" ||
  	                        (n.id.type === "Literal" && typeof n.id.value === "string");
  	                    if (isExternal) {
  	                        parts.push("module ");
  	                    }
  	                    else if (n.loc && n.loc.lines && n.id.loc) {
  	                        var prefix = n.loc.lines.sliceString(n.loc.start, n.id.loc.start);
  	                        // These keywords are fundamentally ambiguous in the
  	                        // Babylon parser, and not reflected in the AST, so
  	                        // the best we can do is to match the original code,
  	                        // when possible.
  	                        if (prefix.indexOf("module") >= 0) {
  	                            parts.push("module ");
  	                        }
  	                        else {
  	                            parts.push("namespace ");
  	                        }
  	                    }
  	                    else {
  	                        parts.push("namespace ");
  	                    }
  	                }
  	            }
  	            parts.push(path.call(print, "id"));
  	            if (n.body) {
  	                parts.push(" ");
  	                parts.push(path.call(print, "body"));
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSModuleBlock": {
  	            var naked = path.call(function (bodyPath) { return printStatementSequence(bodyPath, options, print); }, "body");
  	            if (naked.isEmpty()) {
  	                parts.push("{}");
  	            }
  	            else {
  	                parts.push("{\n", naked.indent(options.tabWidth), "\n}");
  	            }
  	            return (0, lines_1.concat)(parts);
  	        }
  	        case "TSInstantiationExpression": {
  	            parts.push(path.call(print, "expression"), path.call(print, "typeParameters"));
  	            return (0, lines_1.concat)(parts);
  	        }
  	        // https://github.com/babel/babel/pull/10148
  	        case "V8IntrinsicIdentifier":
  	            return (0, lines_1.concat)(["%", path.call(print, "name")]);
  	        // https://github.com/babel/babel/pull/13191
  	        case "TopicReference":
  	            return (0, lines_1.fromString)("#");
  	        // Unhandled types below. If encountered, nodes of these types should
  	        // be either left alone or desugared into AST types that are fully
  	        // supported by the pretty-printer.
  	        case "ClassHeritage": // TODO
  	        case "ComprehensionBlock": // TODO
  	        case "ComprehensionExpression": // TODO
  	        case "Glob": // TODO
  	        case "GeneratorExpression": // TODO
  	        case "LetStatement": // TODO
  	        case "LetExpression": // TODO
  	        case "GraphExpression": // TODO
  	        case "GraphIndexExpression": // TODO
  	        case "XMLDefaultDeclaration":
  	        case "XMLAnyName":
  	        case "XMLQualifiedIdentifier":
  	        case "XMLFunctionQualifiedIdentifier":
  	        case "XMLAttributeSelector":
  	        case "XMLFilterExpression":
  	        case "XML":
  	        case "XMLElement":
  	        case "XMLList":
  	        case "XMLEscape":
  	        case "XMLText":
  	        case "XMLStartTag":
  	        case "XMLEndTag":
  	        case "XMLPointTag":
  	        case "XMLName":
  	        case "XMLAttribute":
  	        case "XMLCdata":
  	        case "XMLComment":
  	        case "XMLProcessingInstruction":
  	        default:
  	            debugger;
  	            throw new Error("unknown type: " + JSON.stringify(n.type));
  	    }
  	}
  	function printDecorators(path, printPath) {
  	    var parts = [];
  	    var node = path.getValue();
  	    if (node.decorators &&
  	        node.decorators.length > 0 &&
  	        // If the parent node is an export declaration, it will be
  	        // responsible for printing node.decorators.
  	        !util.getParentExportDeclaration(path)) {
  	        path.each(function (decoratorPath) {
  	            parts.push(printPath(decoratorPath), "\n");
  	        }, "decorators");
  	    }
  	    else if (util.isExportDeclaration(node) &&
  	        node.declaration &&
  	        node.declaration.decorators) {
  	        // Export declarations are responsible for printing any decorators
  	        // that logically apply to node.declaration.
  	        path.each(function (decoratorPath) {
  	            parts.push(printPath(decoratorPath), "\n");
  	        }, "declaration", "decorators");
  	    }
  	    return (0, lines_1.concat)(parts);
  	}
  	function printStatementSequence(path, options, print) {
  	    var filtered = [];
  	    var sawComment = false;
  	    var sawStatement = false;
  	    path.each(function (stmtPath) {
  	        var stmt = stmtPath.getValue();
  	        // Just in case the AST has been modified to contain falsy
  	        // "statements," it's safer simply to skip them.
  	        if (!stmt) {
  	            return;
  	        }
  	        // Skip printing EmptyStatement nodes to avoid leaving stray
  	        // semicolons lying around.
  	        if (stmt.type === "EmptyStatement" &&
  	            !(stmt.comments && stmt.comments.length > 0)) {
  	            return;
  	        }
  	        if (namedTypes.Comment.check(stmt)) {
  	            // The pretty printer allows a dangling Comment node to act as
  	            // a Statement when the Comment can't be attached to any other
  	            // non-Comment node in the tree.
  	            sawComment = true;
  	        }
  	        else if (namedTypes.Statement.check(stmt)) {
  	            sawStatement = true;
  	        }
  	        else {
  	            // When the pretty printer encounters a string instead of an
  	            // AST node, it just prints the string. This behavior can be
  	            // useful for fine-grained formatting decisions like inserting
  	            // blank lines.
  	            isString.assert(stmt);
  	        }
  	        // We can't hang onto stmtPath outside of this function, because
  	        // it's just a reference to a mutable FastPath object, so we have
  	        // to go ahead and print it here.
  	        filtered.push({
  	            node: stmt,
  	            printed: print(stmtPath),
  	        });
  	    });
  	    if (sawComment) {
  	        (0, tiny_invariant_1.default)(sawStatement === false, "Comments may appear as statements in otherwise empty statement " +
  	            "lists, but may not coexist with non-Comment nodes.");
  	    }
  	    var prevTrailingSpace = null;
  	    var len = filtered.length;
  	    var parts = [];
  	    filtered.forEach(function (info, i) {
  	        var printed = info.printed;
  	        var stmt = info.node;
  	        var multiLine = printed.length > 1;
  	        var notFirst = i > 0;
  	        var notLast = i < len - 1;
  	        var leadingSpace;
  	        var trailingSpace;
  	        var lines = stmt && stmt.loc && stmt.loc.lines;
  	        var trueLoc = lines && options.reuseWhitespace && util.getTrueLoc(stmt, lines);
  	        if (notFirst) {
  	            if (trueLoc) {
  	                var beforeStart = lines.skipSpaces(trueLoc.start, true);
  	                var beforeStartLine = beforeStart ? beforeStart.line : 1;
  	                var leadingGap = trueLoc.start.line - beforeStartLine;
  	                leadingSpace = Array(leadingGap + 1).join("\n");
  	            }
  	            else {
  	                leadingSpace = multiLine ? "\n\n" : "\n";
  	            }
  	        }
  	        else {
  	            leadingSpace = "";
  	        }
  	        if (notLast) {
  	            if (trueLoc) {
  	                var afterEnd = lines.skipSpaces(trueLoc.end);
  	                var afterEndLine = afterEnd ? afterEnd.line : lines.length;
  	                var trailingGap = afterEndLine - trueLoc.end.line;
  	                trailingSpace = Array(trailingGap + 1).join("\n");
  	            }
  	            else {
  	                trailingSpace = multiLine ? "\n\n" : "\n";
  	            }
  	        }
  	        else {
  	            trailingSpace = "";
  	        }
  	        parts.push(maxSpace(prevTrailingSpace, leadingSpace), printed);
  	        if (notLast) {
  	            prevTrailingSpace = trailingSpace;
  	        }
  	        else if (trailingSpace) {
  	            parts.push(trailingSpace);
  	        }
  	    });
  	    return (0, lines_1.concat)(parts);
  	}
  	function maxSpace(s1, s2) {
  	    if (!s1 && !s2) {
  	        return (0, lines_1.fromString)("");
  	    }
  	    if (!s1) {
  	        return (0, lines_1.fromString)(s2);
  	    }
  	    if (!s2) {
  	        return (0, lines_1.fromString)(s1);
  	    }
  	    var spaceLines1 = (0, lines_1.fromString)(s1);
  	    var spaceLines2 = (0, lines_1.fromString)(s2);
  	    if (spaceLines2.length > spaceLines1.length) {
  	        return spaceLines2;
  	    }
  	    return spaceLines1;
  	}
  	function printClassMemberModifiers(node) {
  	    var parts = [];
  	    if (node.declare) {
  	        parts.push("declare ");
  	    }
  	    var access = node.accessibility || node.access;
  	    if (typeof access === "string") {
  	        parts.push(access, " ");
  	    }
  	    if (node.static) {
  	        parts.push("static ");
  	    }
  	    if (node.override) {
  	        parts.push("override ");
  	    }
  	    if (node.abstract) {
  	        parts.push("abstract ");
  	    }
  	    if (node.readonly) {
  	        parts.push("readonly ");
  	    }
  	    return parts;
  	}
  	function printMethod(path, options, print) {
  	    var node = path.getNode();
  	    var kind = node.kind;
  	    var parts = [];
  	    var nodeValue = node.value;
  	    if (!namedTypes.FunctionExpression.check(nodeValue)) {
  	        nodeValue = node;
  	    }
  	    parts.push.apply(parts, printClassMemberModifiers(node));
  	    if (nodeValue.async) {
  	        parts.push("async ");
  	    }
  	    if (nodeValue.generator) {
  	        parts.push("*");
  	    }
  	    if (kind === "get" || kind === "set") {
  	        parts.push(kind, " ");
  	    }
  	    var key = path.call(print, "key");
  	    if (node.computed) {
  	        key = (0, lines_1.concat)(["[", key, "]"]);
  	    }
  	    parts.push(key);
  	    if (node.optional) {
  	        parts.push("?");
  	    }
  	    if (node === nodeValue) {
  	        parts.push(path.call(print, "typeParameters"), "(", printFunctionParams(path, options, print), ")", path.call(print, "returnType"));
  	        if (node.body) {
  	            parts.push(" ", path.call(print, "body"));
  	        }
  	        else {
  	            parts.push(";");
  	        }
  	    }
  	    else {
  	        parts.push(path.call(print, "value", "typeParameters"), "(", path.call(function (valuePath) { return printFunctionParams(valuePath, options, print); }, "value"), ")", path.call(print, "value", "returnType"));
  	        if (nodeValue.body) {
  	            parts.push(" ", path.call(print, "value", "body"));
  	        }
  	        else {
  	            parts.push(";");
  	        }
  	    }
  	    return (0, lines_1.concat)(parts);
  	}
  	function printArgumentsList(path, options, print) {
  	    var printed = path.map(print, "arguments");
  	    var trailingComma = util.isTrailingCommaEnabled(options, "parameters");
  	    var joined = (0, lines_1.fromString)(", ").join(printed);
  	    if (joined.getLineLength(1) > options.wrapColumn) {
  	        joined = (0, lines_1.fromString)(",\n").join(printed);
  	        return (0, lines_1.concat)([
  	            "(\n",
  	            joined.indent(options.tabWidth),
  	            trailingComma ? ",\n)" : "\n)",
  	        ]);
  	    }
  	    return (0, lines_1.concat)(["(", joined, ")"]);
  	}
  	function printFunctionParams(path, options, print) {
  	    var fun = path.getValue();
  	    var params;
  	    var printed = [];
  	    if (fun.params) {
  	        params = fun.params;
  	        printed = path.map(print, "params");
  	    }
  	    else if (fun.parameters) {
  	        params = fun.parameters;
  	        printed = path.map(print, "parameters");
  	    }
  	    if (fun.defaults) {
  	        path.each(function (defExprPath) {
  	            var i = defExprPath.getName();
  	            var p = printed[i];
  	            if (p && defExprPath.getValue()) {
  	                printed[i] = (0, lines_1.concat)([p, " = ", print(defExprPath)]);
  	            }
  	        }, "defaults");
  	    }
  	    if (fun.rest) {
  	        printed.push((0, lines_1.concat)(["...", path.call(print, "rest")]));
  	    }
  	    var joined = (0, lines_1.fromString)(", ").join(printed);
  	    if (joined.length > 1 || joined.getLineLength(1) > options.wrapColumn) {
  	        joined = (0, lines_1.fromString)(",\n").join(printed);
  	        if (util.isTrailingCommaEnabled(options, "parameters") &&
  	            !fun.rest &&
  	            params[params.length - 1].type !== "RestElement") {
  	            joined = (0, lines_1.concat)([joined, ",\n"]);
  	        }
  	        else {
  	            joined = (0, lines_1.concat)([joined, "\n"]);
  	        }
  	        return (0, lines_1.concat)(["\n", joined.indent(options.tabWidth)]);
  	    }
  	    return joined;
  	}
  	function maybePrintImportAssertions(path, options, print) {
  	    var n = path.getValue();
  	    if (n.assertions && n.assertions.length > 0) {
  	        var parts = [" assert {"];
  	        var printed = path.map(print, "assertions");
  	        var flat = (0, lines_1.fromString)(", ").join(printed);
  	        if (flat.length > 1 || flat.getLineLength(1) > options.wrapColumn) {
  	            parts.push("\n", (0, lines_1.fromString)(",\n").join(printed).indent(options.tabWidth), "\n}");
  	        }
  	        else {
  	            parts.push(" ", flat, " }");
  	        }
  	        return (0, lines_1.concat)(parts);
  	    }
  	    return (0, lines_1.fromString)("");
  	}
  	function printExportDeclaration(path, options, print) {
  	    var decl = path.getValue();
  	    var parts = ["export "];
  	    if (decl.exportKind && decl.exportKind === "type") {
  	        if (!decl.declaration) {
  	            parts.push("type ");
  	        }
  	    }
  	    var shouldPrintSpaces = options.objectCurlySpacing;
  	    namedTypes.Declaration.assert(decl);
  	    if (decl["default"] || decl.type === "ExportDefaultDeclaration") {
  	        parts.push("default ");
  	    }
  	    if (decl.declaration) {
  	        parts.push(path.call(print, "declaration"));
  	    }
  	    else if (decl.specifiers) {
  	        if (decl.specifiers.length === 1 &&
  	            decl.specifiers[0].type === "ExportBatchSpecifier") {
  	            parts.push("*");
  	        }
  	        else if (decl.specifiers.length === 0) {
  	            parts.push("{}");
  	        }
  	        else if (decl.specifiers[0].type === "ExportDefaultSpecifier" ||
  	            decl.specifiers[0].type === "ExportNamespaceSpecifier") {
  	            var unbracedSpecifiers_2 = [];
  	            var bracedSpecifiers_2 = [];
  	            path.each(function (specifierPath) {
  	                var spec = specifierPath.getValue();
  	                if (spec.type === "ExportDefaultSpecifier" ||
  	                    spec.type === "ExportNamespaceSpecifier") {
  	                    unbracedSpecifiers_2.push(print(specifierPath));
  	                }
  	                else {
  	                    bracedSpecifiers_2.push(print(specifierPath));
  	                }
  	            }, "specifiers");
  	            unbracedSpecifiers_2.forEach(function (lines, i) {
  	                if (i > 0) {
  	                    parts.push(", ");
  	                }
  	                parts.push(lines);
  	            });
  	            if (bracedSpecifiers_2.length > 0) {
  	                var lines_2 = (0, lines_1.fromString)(", ").join(bracedSpecifiers_2);
  	                if (lines_2.getLineLength(1) > options.wrapColumn) {
  	                    lines_2 = (0, lines_1.concat)([
  	                        (0, lines_1.fromString)(",\n").join(bracedSpecifiers_2).indent(options.tabWidth),
  	                        ",",
  	                    ]);
  	                }
  	                if (unbracedSpecifiers_2.length > 0) {
  	                    parts.push(", ");
  	                }
  	                if (lines_2.length > 1) {
  	                    parts.push("{\n", lines_2, "\n}");
  	                }
  	                else if (options.objectCurlySpacing) {
  	                    parts.push("{ ", lines_2, " }");
  	                }
  	                else {
  	                    parts.push("{", lines_2, "}");
  	                }
  	            }
  	        }
  	        else {
  	            parts.push(shouldPrintSpaces ? "{ " : "{", (0, lines_1.fromString)(", ").join(path.map(print, "specifiers")), shouldPrintSpaces ? " }" : "}");
  	        }
  	        if (decl.source) {
  	            parts.push(" from ", path.call(print, "source"), maybePrintImportAssertions(path, options, print));
  	        }
  	    }
  	    var lines = (0, lines_1.concat)(parts);
  	    if (lastNonSpaceCharacter(lines) !== ";" &&
  	        !(decl.declaration &&
  	            (decl.declaration.type === "FunctionDeclaration" ||
  	                decl.declaration.type === "ClassDeclaration" ||
  	                decl.declaration.type === "TSModuleDeclaration" ||
  	                decl.declaration.type === "TSInterfaceDeclaration" ||
  	                decl.declaration.type === "TSEnumDeclaration"))) {
  	        lines = (0, lines_1.concat)([lines, ";"]);
  	    }
  	    return lines;
  	}
  	function printFlowDeclaration(path, parts) {
  	    var parentExportDecl = util.getParentExportDeclaration(path);
  	    if (parentExportDecl) {
  	        (0, tiny_invariant_1.default)(parentExportDecl.type === "DeclareExportDeclaration");
  	    }
  	    else {
  	        // If the parent node has type DeclareExportDeclaration, then it
  	        // will be responsible for printing the "declare" token. Otherwise
  	        // it needs to be printed with this non-exported declaration node.
  	        parts.unshift("declare ");
  	    }
  	    return (0, lines_1.concat)(parts);
  	}
  	function printVariance(path, print) {
  	    return path.call(function (variancePath) {
  	        var value = variancePath.getValue();
  	        if (value) {
  	            if (value === "plus") {
  	                return (0, lines_1.fromString)("+");
  	            }
  	            if (value === "minus") {
  	                return (0, lines_1.fromString)("-");
  	            }
  	            return print(variancePath);
  	        }
  	        return (0, lines_1.fromString)("");
  	    }, "variance");
  	}
  	function adjustClause(clause, options) {
  	    if (clause.length > 1)
  	        return (0, lines_1.concat)([" ", clause]);
  	    return (0, lines_1.concat)(["\n", maybeAddSemicolon(clause).indent(options.tabWidth)]);
  	}
  	function lastNonSpaceCharacter(lines) {
  	    var pos = lines.lastPos();
  	    do {
  	        var ch = lines.charAt(pos);
  	        if (/\S/.test(ch))
  	            return ch;
  	    } while (lines.prevPos(pos));
  	}
  	function endsWithBrace(lines) {
  	    return lastNonSpaceCharacter(lines) === "}";
  	}
  	function swapQuotes(str) {
  	    return str.replace(/['"]/g, function (m) { return (m === '"' ? "'" : '"'); });
  	}
  	function getPossibleRaw(node) {
  	    var value = types.getFieldValue(node, "value");
  	    var extra = types.getFieldValue(node, "extra");
  	    if (extra && typeof extra.raw === "string" && value == extra.rawValue) {
  	        return extra.raw;
  	    }
  	    if (node.type === "Literal") {
  	        var raw = node.raw;
  	        if (typeof raw === "string" && value == raw) {
  	            return raw;
  	        }
  	    }
  	}
  	function jsSafeStringify(str) {
  	    return JSON.stringify(str).replace(/[\u2028\u2029]/g, function (m) {
  	        return "\\u" + m.charCodeAt(0).toString(16);
  	    });
  	}
  	function nodeStr(str, options) {
  	    isString.assert(str);
  	    switch (options.quote) {
  	        case "auto": {
  	            var double = jsSafeStringify(str);
  	            var single = swapQuotes(jsSafeStringify(swapQuotes(str)));
  	            return double.length > single.length ? single : double;
  	        }
  	        case "single":
  	            return swapQuotes(jsSafeStringify(swapQuotes(str)));
  	        case "double":
  	        default:
  	            return jsSafeStringify(str);
  	    }
  	}
  	function maybeAddSemicolon(lines) {
  	    var eoc = lastNonSpaceCharacter(lines);
  	    if (!eoc || "\n};".indexOf(eoc) < 0)
  	        return (0, lines_1.concat)([lines, ";"]);
  	    return lines;
  	}
  	return printer;
  }

  var hasRequiredMain;

  function requireMain () {
  	if (hasRequiredMain) return main$1;
  	hasRequiredMain = 1;
  	(function (exports) {
  		Object.defineProperty(exports, "__esModule", { value: true });
  		exports.run = exports.prettyPrint = exports.print = exports.visit = exports.types = exports.parse = void 0;
  		var tslib_1 = require$$0;
  		var fs_1 = tslib_1.__importDefault(require$$1);
  		var types = tslib_1.__importStar(requireMain$1());
  		exports.types = types;
  		var parser_1 = requireParser();
  		Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parser_1.parse; } });
  		var printer_1 = requirePrinter();
  		/**
  		 * Traverse and potentially modify an abstract syntax tree using a
  		 * convenient visitor syntax:
  		 *
  		 *   recast.visit(ast, {
  		 *     names: [],
  		 *     visitIdentifier: function(path) {
  		 *       var node = path.value;
  		 *       this.visitor.names.push(node.name);
  		 *       this.traverse(path);
  		 *     }
  		 *   });
  		 */
  		var ast_types_1 = requireMain$1();
  		Object.defineProperty(exports, "visit", { enumerable: true, get: function () { return ast_types_1.visit; } });
  		/**
  		 * Reprint a modified syntax tree using as much of the original source
  		 * code as possible.
  		 */
  		function print(node, options) {
  		    return new printer_1.Printer(options).print(node);
  		}
  		exports.print = print;
  		/**
  		 * Print without attempting to reuse any original source code.
  		 */
  		function prettyPrint(node, options) {
  		    return new printer_1.Printer(options).printGenerically(node);
  		}
  		exports.prettyPrint = prettyPrint;
  		/**
  		 * Convenient command-line interface (see e.g. example/add-braces).
  		 */
  		function run(transformer, options) {
  		    return runFile(process.argv[2], transformer, options);
  		}
  		exports.run = run;
  		function runFile(path, transformer, options) {
  		    fs_1.default.readFile(path, "utf-8", function (err, code) {
  		        if (err) {
  		            console.error(err);
  		            return;
  		        }
  		        runString(code, transformer, options);
  		    });
  		}
  		function defaultWriteback(output) {
  		    process.stdout.write(output);
  		}
  		function runString(code, transformer, options) {
  		    var writeback = (options && options.writeback) || defaultWriteback;
  		    transformer((0, parser_1.parse)(code, options), function (node) {
  		        writeback(print(node, options).code);
  		    });
  		} 
  	} (main$1));
  	return main$1;
  }

  var mainExports = requireMain();

  const types = mainExports.types;
  const builders = mainExports.types.builders;
  const namedTypes = mainExports.types.namedTypes;

  const builtin = {
  	AggregateError: false,
  	"Array": false,
  	"ArrayBuffer": false,
  	Atomics: false,
  	BigInt: false,
  	BigInt64Array: false,
  	BigUint64Array: false,
  	"Boolean": false,
  	"DataView": false,
  	"Date": false,
  	"decodeURI": false,
  	"decodeURIComponent": false,
  	"encodeURI": false,
  	"encodeURIComponent": false,
  	"Error": false,
  	"escape": false,
  	"eval": false,
  	"EvalError": false,
  	FinalizationRegistry: false,
  	Float16Array: false,
  	"Float32Array": false,
  	"Float64Array": false,
  	"Function": false,
  	globalThis: false,
  	"Infinity": false,
  	"Int16Array": false,
  	"Int32Array": false,
  	"Int8Array": false,
  	"Intl": false,
  	"isFinite": false,
  	"isNaN": false,
  	Iterator: false,
  	"JSON": false,
  	"Map": false,
  	"Math": false,
  	"NaN": false,
  	"Number": false,
  	"Object": false,
  	"parseFloat": false,
  	"parseInt": false,
  	"Promise": false,
  	"Proxy": false,
  	"RangeError": false,
  	"ReferenceError": false,
  	"Reflect": false,
  	"RegExp": false,
  	"Set": false,
  	SharedArrayBuffer: false,
  	"String": false,
  	"Symbol": false,
  	"SyntaxError": false,
  	"TypeError": false,
  	"Uint16Array": false,
  	"Uint32Array": false,
  	"Uint8Array": false,
  	"Uint8ClampedArray": false,
  	"undefined": false,
  	"unescape": false,
  	"URIError": false,
  	"WeakMap": false,
  	WeakRef: false,
  	"WeakSet": false
  };
  var globals = {
  	builtin: builtin};

  const browserAPIs = ['window', 'document', 'console'];
  const builtinAPIs = Object.keys(globals.builtin);

  const isIdentifier = (n) => namedTypes.Identifier.check(n);
  const isLiteral = (n) => namedTypes.Literal.check(n);
  const isExpressionStatement = (n) =>
    namedTypes.ExpressionStatement.check(n);
  const isThisExpression = (n) => namedTypes.ThisExpression.check(n);
  const isObjectExpression = (n) => namedTypes.ObjectExpression.check(n);
  const isThisExpressionStatement = (n) =>
    isExpressionStatement(n) &&
    isMemberExpression(n.expression.left) &&
    isThisExpression(n.expression.left.object);
  const isNewExpression = (n) => namedTypes.NewExpression.check(n);
  const isSequenceExpression = (n) =>
    namedTypes.SequenceExpression.check(n);
  const isExportDefaultStatement = (n) =>
    namedTypes.ExportDefaultDeclaration.check(n);
  const isMemberExpression = (n) => namedTypes.MemberExpression.check(n);
  const isImportDeclaration = (n) => namedTypes.ImportDeclaration.check(n);
  const isTypeAliasDeclaration = (n) =>
    namedTypes.TSTypeAliasDeclaration.check(n);
  const isInterfaceDeclaration = (n) =>
    namedTypes.TSInterfaceDeclaration.check(n);
  const isExportNamedDeclaration = (n) =>
    namedTypes.ExportNamedDeclaration.check(n);

  const isBrowserAPI = ({ name }) => browserAPIs.includes(name);
  const isBuiltinAPI = ({ name }) => builtinAPIs.includes(name);
  const isRaw = (n) => n && n.raw;

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  function compose$1(...fns) {
    return fns.reduce((f, g) => (...args) => f(g(...args)))
  }

  /**
   * True if the node has not expression set nor bindings directives
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only if it's a static node that doesn't need bindings or expressions
   */
  function isStaticNode(node) {
    return [
      hasExpressions,
      findEachAttribute,
      findIfAttribute,
      isCustomNode,
      isSlotNode,
    ].every((test) => !test(node))
  }

  /**
   * Check if a node should be rendered in the final component HTML
   * For example slot <template slot="content"> tags not using `each` or `if` directives can be removed
   * see also https://github.com/riot/riot/issues/2888
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true if we can remove this tag from the component rendered HTML
   */
  function isRemovableNode(node) {
    return (
      isTemplateNode(node) &&
      !isNil(findAttribute(SLOT_ATTRIBUTE, node)) &&
      !hasEachAttribute(node) &&
      !hasIfAttribute(node)
    )
  }

  /**
   * Check if a node name is part of the browser or builtin javascript api or it belongs to the current scope
   * @param   { types.NodePath } path - containing the current node visited
   * @returns {boolean} true if it's a global api variable
   */
  function isGlobal({ scope, node }) {
    // recursively find the identifier of this AST path
    if (node.object) {
      return isGlobal({ node: node.object, scope })
    }

    return Boolean(
      isRaw(node) ||
        isBuiltinAPI(node) ||
        isBrowserAPI(node) ||
        isNewExpression(node) ||
        isNodeInScope(scope, node),
    )
  }

  /**
   * Checks if the identifier of a given node exists in a scope
   * @param {Scope} scope - scope where to search for the identifier
   * @param {types.Node} node - node to search for the identifier
   * @returns {boolean} true if the node identifier is defined in the given scope
   */
  function isNodeInScope(scope, node) {
    const traverse = (isInScope = false) => {
      types.visit(node, {
        visitIdentifier(path) {
          if (scope.lookup(getName$1(path.node))) {
            isInScope = true;
          }

          this.abort();
        },
      });

      return isInScope
    };

    return traverse()
  }

  /**
   * True if the node has the isCustom attribute set
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true if either it's a riot component or a custom element
   */
  function isCustomNode(node) {
    return !!(node[IS_CUSTOM_NODE] || hasIsAttribute(node))
  }

  /**
   * True the node is <slot>
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true if it's a slot node
   */
  function isSlotNode(node) {
    return node.name === SLOT_TAG_NODE_NAME
  }

  /**
   * True if the node has the isVoid attribute set
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true if the node is self closing
   */
  function isVoidNode(node) {
    return !!node[IS_VOID_NODE]
  }

  /**
   * True if the riot parser did find a tag node
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for the tag nodes
   */
  function isTagNode(node) {
    return node.type === nodeTypes.TAG
  }

  /**
   * True if the riot parser did find a text node
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for the text nodes
   */
  function isTextNode(node) {
    return node.type === nodeTypes.TEXT
  }

  /**
   * True if the node parsed any of the root nodes (each, tag bindings create root nodes as well...)
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for the root nodes
   */
  function isRootNode(node) {
    return node.isRoot
  }

  /**
   * True if the attribute parsed is of type spread one
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true if the attribute node is of type spread
   */
  function isSpreadAttribute(node) {
    return node[IS_SPREAD_ATTRIBUTE]
  }

  /**
   * True if the node is an attribute and its name is "value"
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for value attribute nodes
   */
  function isValueAttribute(node) {
    return node.name === VALUE_ATTRIBUTE
  }

  /**
   * True if the node is an attribute and its name is "ref"
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for ref attribute nodes
   */
  function isRefAttribute(node) {
    return node.name === REF_ATTRIBUTE
  }

  /**
   * True if the DOM node is a progress tag
   * @param   {RiotParser.Node}  node - riot parser node
   * @returns {boolean} true for the progress tags
   */
  function isProgressNode(node) {
    return node.name === PROGRESS_TAG_NODE_NAME
  }

  /**
   * True if the DOM node is a <template> tag
   * @param   {RiotParser.Node}  node - riot parser node
   * @returns {boolean} true for the progress tags
   */
  function isTemplateNode(node) {
    return node.name === TEMPLATE_TAG_NODE_NAME
  }

  /**
   * True if the node is an attribute and a DOM handler
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for dom listener attribute nodes
   */
  const isEventAttribute = (() => {
    return (node) => isEventAttribute$1(node.name)
  })();

  /**
   * Check if a string is an html comment
   * @param   {string}  string - test string
   * @returns {boolean} true if html comment
   */
  function isCommentString(string) {
    return string.trim().indexOf('<!') === 0
  }

  /**
   * True if the node has expressions or expression attributes
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} ditto
   */
  function hasExpressions(node) {
    return !!(
      node.expressions ||
      // has expression attributes
      getNodeAttributes(node).some((attribute) => hasExpressions(attribute)) ||
      // has child text nodes with expressions
      (node.nodes &&
        node.nodes.some((node) => isTextNode(node) && hasExpressions(node)))
    )
  }

  /**
   * True if the node is a directive having its own template or it's a slot node
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {boolean} true only for the IF EACH and TAG bindings or it's a slot node
   */
  function hasItsOwnTemplate(node) {
    return [findEachAttribute, findIfAttribute, isCustomNode, isSlotNode].some(
      (test) => test(node),
    )
  }

  const hasIfAttribute = compose$1(Boolean, findIfAttribute);
  const hasEachAttribute = compose$1(Boolean, findEachAttribute);
  const hasIsAttribute = compose$1(Boolean, findIsAttribute);
  compose$1(Boolean, findKeyAttribute);
  const hasChildrenNodes = (node) => node?.nodes?.length > 0;

  /**
   * Find the attribute node
   * @param   { string } name -  name of the attribute we want to find
   * @param   { riotParser.nodeTypes.TAG } node - a tag node
   * @returns { riotParser.nodeTypes.ATTR } attribute node
   */
  function findAttribute(name, node) {
    return (
      node.attributes && node.attributes.find((attr) => getName$1(attr) === name)
    )
  }

  function findIfAttribute(node) {
    return findAttribute(IF_DIRECTIVE, node)
  }

  function findEachAttribute(node) {
    return findAttribute(EACH_DIRECTIVE, node)
  }

  function findKeyAttribute(node) {
    return findAttribute(KEY_ATTRIBUTE, node)
  }

  function findIsAttribute(node) {
    return findAttribute(IS_DIRECTIVE, node)
  }

  /**
   * Find all the node attributes that are not expressions
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {Array} list of all the static attributes
   */
  function findStaticAttributes(node) {
    return getNodeAttributes(node).filter(
      (attribute) => !hasExpressions(attribute),
    )
  }

  /**
   * Find all the node attributes that have expressions
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {Array} list of all the dynamic attributes
   */
  function findDynamicAttributes(node) {
    return getNodeAttributes(node).filter(hasExpressions)
  }

  function nullNode() {
    return builders.literal(null)
  }

  function simplePropertyNode(key, value) {
    const property = builders.property(
      'init',
      builders.identifier(key),
      value,
      false,
    );

    property.sho;
    return property
  }

  const LINES_RE = /\r\n?|\n/g;

  /**
   * Split a string into a rows array generated from its EOL matches
   * @param   { string } string [description]
   * @returns { Array } array containing all the string rows
   */
  function splitStringByEOL(string) {
    return string.split(LINES_RE)
  }

  /**
   * Get the line and the column of a source text based on its position in the string
   * @param   { string } string - target string
   * @param   { number } position - target position
   * @returns {object} object containing the source text line and column
   */
  function getLineAndColumnByPosition(string, position) {
    const lines = splitStringByEOL(string.slice(0, position));

    return {
      line: lines.length,
      column: lines[lines.length - 1].length,
    }
  }

  /**
   * Add the offset to the code that must be parsed in order to generate properly the sourcemaps
   * @param {string} input - input string
   * @param {string} source - original source code
   * @param {RiotParser.Node} node - node that we are going to transform
   * @returns {string} the input string with the offset properly set
   */
  function addLineOffset(input, source, node) {
    const { column, line } = getLineAndColumnByPosition(source, node.start);
    return `${'\n'.repeat(line - 1)}${' '.repeat(column + 1)}${input}`
  }

  /**
   * Create a simple attribute expression
   * @param   {RiotParser.Node.Attr} sourceNode - the custom tag
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @returns {AST.Node} object containing the expression binding keys
   */
  function createAttributeExpression(
    sourceNode,
    sourceFile,
    sourceCode,
  ) {
    const isSpread = isSpreadAttribute(sourceNode);

    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(EXPRESSION_TYPES),
          builders.identifier(ATTRIBUTE_EXPRESSION_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_IS_BOOLEAN_ATTRIBUTE,
        builders.literal(!isSpread && !!sourceNode[IS_BOOLEAN_ATTRIBUTE]),
      ),
      simplePropertyNode(
        BINDING_NAME_KEY,
        isSpread ? nullNode() : builders.literal(sourceNode.name),
      ),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        createAttributeEvaluationFunction(sourceNode, sourceFile, sourceCode),
      ),
    ])
  }

  /**
   * Create a simple event expression
   * @param   {RiotParser.Node.Attr} sourceNode - attribute containing the event handlers
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @returns {AST.Node} object containing the expression binding keys
   */
  function createEventExpression(
    sourceNode,
    sourceFile,
    sourceCode,
  ) {
    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(EXPRESSION_TYPES),
          builders.identifier(EVENT_EXPRESSION_TYPE),
          false,
        ),
      ),
      simplePropertyNode(BINDING_NAME_KEY, builders.literal(sourceNode.name)),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        createAttributeEvaluationFunction(sourceNode, sourceFile, sourceCode),
      ),
    ])
  }

  // similar to _.uniq
  const uniq = l => l.filter((x, i, a) => a.indexOf(x) === i);

  /**
   * SVG void elements that cannot be auto-closed and shouldn't contain child nodes.
   * @const {Array}
   */
  const VOID_SVG_TAGS_LIST = [
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',
    'stop',
    'use'
  ];

  /**
   * List of html elements where the value attribute is allowed
   * @type {Array}
   */
  const HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_LIST = [
    'button',
    'data',
    'input',
    'select',
    'li',
    'meter',
    'option',
    'output',
    'progress',
    'textarea',
    'param'
  ];

  /**
   * List of all the available svg tags
   * @const {Array}
   * @see {@link https://github.com/wooorm/svg-tag-names}
   */
  const SVG_TAGS_LIST = uniq([
    'a',
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'animation',
    'audio',
    'canvas',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'discard',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feDropShadow',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'handler',
    'hatch',
    'hatchpath',
    'hkern',
    'iframe',
    'image',
    'linearGradient',
    'listener',
    'marker',
    'mask',
    'mesh',
    'meshgradient',
    'meshpatch',
    'meshrow',
    'metadata',
    'missing-glyph',
    'mpath',
    'pattern',
    'prefetch',
    'radialGradient',
    'script',
    'set',
    'solidColor',
    'solidcolor',
    'style',
    'svg',
    'switch',
    'symbol',
    'tbreak',
    'text',
    'textArea',
    'textPath',
    'title',
    'tref',
    'tspan',
    'unknown',
    'video',
    'view',
    'vkern'
  ].concat(VOID_SVG_TAGS_LIST)).sort();

  /**
   * HTML void elements that cannot be auto-closed and shouldn't contain child nodes.
   * @type {Array}
   * @see   {@link http://www.w3.org/TR/html-markup/syntax.html#syntax-elements}
   * @see   {@link http://www.w3.org/TR/html5/syntax.html#void-elements}
   */
  const VOID_HTML_TAGS_LIST = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];

  /**
   * List of all the html tags
   * @const {Array}
   * @see {@link https://github.com/sindresorhus/html-tags}
   */
  const HTML_TAGS_LIST = uniq([
    'a',
    'abbr',
    'address',
    'article',
    'aside',
    'audio',
    'b',
    'bdi',
    'bdo',
    'blockquote',
    'body',
    'canvas',
    'caption',
    'cite',
    'code',
    'colgroup',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'div',
    'dl',
    'dt',
    'em',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'html',
    'i',
    'iframe',
    'ins',
    'kbd',
    'label',
    'legend',
    'main',
    'map',
    'mark',
    'math',
    'menu',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'p',
    'picture',
    'pre',
    'q',
    'rb',
    'rp',
    'rt',
    'rtc',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'slot',
    'small',
    'span',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'tbody',
    'td',
    'template',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'u',
    'ul',
    'var',
    'video'
  ]
    .concat(VOID_HTML_TAGS_LIST)
    .concat(HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_LIST)
  ).sort();

  /**
   * List of all boolean HTML attributes
   * @const {RegExp}
   * @see {@link https://www.w3.org/TR/html5/infrastructure.html#sec-boolean-attributes}
   */
  const BOOLEAN_ATTRIBUTES_LIST = [
    'disabled',
    'visible',
    'checked',
    'readonly',
    'required',
    'allowfullscreen',
    'autofocus',
    'autoplay',
    'compact',
    'controls',
    'default',
    'formnovalidate',
    'hidden',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'noresize',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'reversed',
    'seamless',
    'selected',
    'sortable',
    'truespeed',
    'typemustmatch'
  ];

  /**
   * Join a list of items with the pipe symbol (usefull for regex list concatenation)
   * @private
   * @param   {Array} list - list of strings
   * @returns {string} the list received joined with pipes
   */
  function joinWithPipe(list) {
    return list.join('|')
  }

  /**
   * Convert list of strings to regex in order to test against it ignoring the cases
   * @private
   * @param   {...Array} lists - array of strings
   * @returns {RegExp} regex that will match all the strings in the array received ignoring the cases
   */
  function listsToRegex(...lists) {
    return new RegExp(`^/?(?:${joinWithPipe(lists.map(joinWithPipe))})$`, 'i')
  }

  /**
   * Regex matching all the html tags ignoring the cases
   * @const {RegExp}
   */
  listsToRegex(HTML_TAGS_LIST);

  /**
   * Regex matching all the svg tags ignoring the cases
   * @const {RegExp}
   */
  listsToRegex(SVG_TAGS_LIST);

  /**
   * Regex matching all the void html tags ignoring the cases
   * @const {RegExp}
   */
  listsToRegex(VOID_HTML_TAGS_LIST);

  /**
   * Regex matching all the void svg tags ignoring the cases
   * @const {RegExp}
   */
  listsToRegex(VOID_SVG_TAGS_LIST);

  /**
   * Regex matching all the html tags where the value tag is allowed
   * @const {RegExp}
   */
  const HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_RE = listsToRegex(HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_LIST);

  /**
   * Regex matching all the boolean attributes
   * @const {RegExp}
   */
  listsToRegex(BOOLEAN_ATTRIBUTES_LIST);

  /**
   * True if the value attribute is allowed on this tag
   * @param   {string}  tag - test tag
   * @returns {boolean} true if the value attribute is allowed
   * @example
   * hasValueAttribute('input') // true
   * hasValueAttribute('div') // false
   */
  function hasValueAttribute(tag) {
    return HTML_ELEMENTS_HAVING_VALUE_ATTRIBUTE_RE.test(tag)
  }

  const quot = "\"";
  const amp = "&";
  const apos = "'";
  const lt = "<";
  const gt = ">";
  const nbsp = " ";
  const iexcl = "¡";
  const cent = "¢";
  const pound = "£";
  const curren = "¤";
  const yen = "¥";
  const brvbar = "¦";
  const sect = "§";
  const uml = "¨";
  const copy = "©";
  const ordf = "ª";
  const laquo = "«";
  const not = "¬";
  const shy = "­";
  const reg = "®";
  const macr = "¯";
  const deg = "°";
  const plusmn = "±";
  const sup2 = "²";
  const sup3 = "³";
  const acute = "´";
  const micro = "µ";
  const para = "¶";
  const middot = "·";
  const cedil = "¸";
  const sup1 = "¹";
  const ordm = "º";
  const raquo = "»";
  const frac14 = "¼";
  const frac12 = "½";
  const frac34 = "¾";
  const iquest = "¿";
  const Agrave = "À";
  const Aacute = "Á";
  const Acirc = "Â";
  const Atilde = "Ã";
  const Auml = "Ä";
  const Aring = "Å";
  const AElig = "Æ";
  const Ccedil = "Ç";
  const Egrave = "È";
  const Eacute = "É";
  const Ecirc = "Ê";
  const Euml = "Ë";
  const Igrave = "Ì";
  const Iacute = "Í";
  const Icirc = "Î";
  const Iuml = "Ï";
  const ETH = "Ð";
  const Ntilde = "Ñ";
  const Ograve = "Ò";
  const Oacute = "Ó";
  const Ocirc = "Ô";
  const Otilde = "Õ";
  const Ouml = "Ö";
  const times = "×";
  const Oslash = "Ø";
  const Ugrave = "Ù";
  const Uacute = "Ú";
  const Ucirc = "Û";
  const Uuml = "Ü";
  const Yacute = "Ý";
  const THORN = "Þ";
  const szlig = "ß";
  const agrave = "à";
  const aacute = "á";
  const acirc = "â";
  const atilde = "ã";
  const auml = "ä";
  const aring = "å";
  const aelig = "æ";
  const ccedil = "ç";
  const egrave = "è";
  const eacute = "é";
  const ecirc = "ê";
  const euml = "ë";
  const igrave = "ì";
  const iacute = "í";
  const icirc = "î";
  const iuml = "ï";
  const eth = "ð";
  const ntilde = "ñ";
  const ograve = "ò";
  const oacute = "ó";
  const ocirc = "ô";
  const otilde = "õ";
  const ouml = "ö";
  const divide = "÷";
  const oslash = "ø";
  const ugrave = "ù";
  const uacute = "ú";
  const ucirc = "û";
  const uuml = "ü";
  const yacute = "ý";
  const thorn = "þ";
  const yuml = "ÿ";
  const OElig = "Œ";
  const oelig = "œ";
  const Scaron = "Š";
  const scaron = "š";
  const Yuml = "Ÿ";
  const fnof = "ƒ";
  const circ = "ˆ";
  const tilde = "˜";
  const Alpha = "Α";
  const Beta = "Β";
  const Gamma = "Γ";
  const Delta = "Δ";
  const Epsilon = "Ε";
  const Zeta = "Ζ";
  const Eta = "Η";
  const Theta = "Θ";
  const Iota = "Ι";
  const Kappa = "Κ";
  const Lambda = "Λ";
  const Mu = "Μ";
  const Nu = "Ν";
  const Xi = "Ξ";
  const Omicron = "Ο";
  const Pi = "Π";
  const Rho = "Ρ";
  const Sigma = "Σ";
  const Tau = "Τ";
  const Upsilon = "Υ";
  const Phi = "Φ";
  const Chi = "Χ";
  const Psi = "Ψ";
  const Omega = "Ω";
  const alpha = "α";
  const beta = "β";
  const gamma = "γ";
  const delta = "δ";
  const epsilon = "ε";
  const zeta = "ζ";
  const eta = "η";
  const theta = "θ";
  const iota = "ι";
  const kappa = "κ";
  const lambda = "λ";
  const mu = "μ";
  const nu = "ν";
  const xi = "ξ";
  const omicron = "ο";
  const pi = "π";
  const rho = "ρ";
  const sigmaf = "ς";
  const sigma = "σ";
  const tau = "τ";
  const upsilon = "υ";
  const phi = "φ";
  const chi = "χ";
  const psi = "ψ";
  const omega = "ω";
  const thetasym = "ϑ";
  const upsih = "ϒ";
  const piv = "ϖ";
  const ensp = " ";
  const emsp = " ";
  const thinsp = " ";
  const zwnj = "‌";
  const zwj = "‍";
  const lrm = "‎";
  const rlm = "‏";
  const ndash = "–";
  const mdash = "—";
  const lsquo = "‘";
  const rsquo = "’";
  const sbquo = "‚";
  const ldquo = "“";
  const rdquo = "”";
  const bdquo = "„";
  const dagger = "†";
  const Dagger = "‡";
  const bull = "•";
  const hellip = "…";
  const permil = "‰";
  const prime = "′";
  const Prime = "″";
  const lsaquo = "‹";
  const rsaquo = "›";
  const oline = "‾";
  const frasl = "⁄";
  const euro = "€";
  const image = "ℑ";
  const weierp = "℘";
  const real = "ℜ";
  const trade = "™";
  const alefsym = "ℵ";
  const larr = "←";
  const uarr = "↑";
  const rarr = "→";
  const darr = "↓";
  const harr = "↔";
  const crarr = "↵";
  const lArr = "⇐";
  const uArr = "⇑";
  const rArr = "⇒";
  const dArr = "⇓";
  const hArr = "⇔";
  const forall = "∀";
  const part = "∂";
  const exist = "∃";
  const empty = "∅";
  const nabla = "∇";
  const isin = "∈";
  const notin = "∉";
  const ni = "∋";
  const prod = "∏";
  const sum = "∑";
  const minus = "−";
  const lowast = "∗";
  const radic = "√";
  const prop = "∝";
  const infin = "∞";
  const ang = "∠";
  const and = "∧";
  const or = "∨";
  const cap = "∩";
  const cup = "∪";
  const int = "∫";
  const there4 = "∴";
  const sim = "∼";
  const cong = "≅";
  const asymp = "≈";
  const ne = "≠";
  const equiv = "≡";
  const le = "≤";
  const ge = "≥";
  const sub = "⊂";
  const sup = "⊃";
  const nsub = "⊄";
  const sube = "⊆";
  const supe = "⊇";
  const oplus = "⊕";
  const otimes = "⊗";
  const perp = "⊥";
  const sdot = "⋅";
  const lceil = "⌈";
  const rceil = "⌉";
  const lfloor = "⌊";
  const rfloor = "⌋";
  const lang = "〈";
  const rang = "〉";
  const loz = "◊";
  const spades = "♠";
  const clubs = "♣";
  const hearts = "♥";
  const diams = "♦";
  var entities = {
  	quot: quot,
  	amp: amp,
  	apos: apos,
  	lt: lt,
  	gt: gt,
  	nbsp: nbsp,
  	iexcl: iexcl,
  	cent: cent,
  	pound: pound,
  	curren: curren,
  	yen: yen,
  	brvbar: brvbar,
  	sect: sect,
  	uml: uml,
  	copy: copy,
  	ordf: ordf,
  	laquo: laquo,
  	not: not,
  	shy: shy,
  	reg: reg,
  	macr: macr,
  	deg: deg,
  	plusmn: plusmn,
  	sup2: sup2,
  	sup3: sup3,
  	acute: acute,
  	micro: micro,
  	para: para,
  	middot: middot,
  	cedil: cedil,
  	sup1: sup1,
  	ordm: ordm,
  	raquo: raquo,
  	frac14: frac14,
  	frac12: frac12,
  	frac34: frac34,
  	iquest: iquest,
  	Agrave: Agrave,
  	Aacute: Aacute,
  	Acirc: Acirc,
  	Atilde: Atilde,
  	Auml: Auml,
  	Aring: Aring,
  	AElig: AElig,
  	Ccedil: Ccedil,
  	Egrave: Egrave,
  	Eacute: Eacute,
  	Ecirc: Ecirc,
  	Euml: Euml,
  	Igrave: Igrave,
  	Iacute: Iacute,
  	Icirc: Icirc,
  	Iuml: Iuml,
  	ETH: ETH,
  	Ntilde: Ntilde,
  	Ograve: Ograve,
  	Oacute: Oacute,
  	Ocirc: Ocirc,
  	Otilde: Otilde,
  	Ouml: Ouml,
  	times: times,
  	Oslash: Oslash,
  	Ugrave: Ugrave,
  	Uacute: Uacute,
  	Ucirc: Ucirc,
  	Uuml: Uuml,
  	Yacute: Yacute,
  	THORN: THORN,
  	szlig: szlig,
  	agrave: agrave,
  	aacute: aacute,
  	acirc: acirc,
  	atilde: atilde,
  	auml: auml,
  	aring: aring,
  	aelig: aelig,
  	ccedil: ccedil,
  	egrave: egrave,
  	eacute: eacute,
  	ecirc: ecirc,
  	euml: euml,
  	igrave: igrave,
  	iacute: iacute,
  	icirc: icirc,
  	iuml: iuml,
  	eth: eth,
  	ntilde: ntilde,
  	ograve: ograve,
  	oacute: oacute,
  	ocirc: ocirc,
  	otilde: otilde,
  	ouml: ouml,
  	divide: divide,
  	oslash: oslash,
  	ugrave: ugrave,
  	uacute: uacute,
  	ucirc: ucirc,
  	uuml: uuml,
  	yacute: yacute,
  	thorn: thorn,
  	yuml: yuml,
  	OElig: OElig,
  	oelig: oelig,
  	Scaron: Scaron,
  	scaron: scaron,
  	Yuml: Yuml,
  	fnof: fnof,
  	circ: circ,
  	tilde: tilde,
  	Alpha: Alpha,
  	Beta: Beta,
  	Gamma: Gamma,
  	Delta: Delta,
  	Epsilon: Epsilon,
  	Zeta: Zeta,
  	Eta: Eta,
  	Theta: Theta,
  	Iota: Iota,
  	Kappa: Kappa,
  	Lambda: Lambda,
  	Mu: Mu,
  	Nu: Nu,
  	Xi: Xi,
  	Omicron: Omicron,
  	Pi: Pi,
  	Rho: Rho,
  	Sigma: Sigma,
  	Tau: Tau,
  	Upsilon: Upsilon,
  	Phi: Phi,
  	Chi: Chi,
  	Psi: Psi,
  	Omega: Omega,
  	alpha: alpha,
  	beta: beta,
  	gamma: gamma,
  	delta: delta,
  	epsilon: epsilon,
  	zeta: zeta,
  	eta: eta,
  	theta: theta,
  	iota: iota,
  	kappa: kappa,
  	lambda: lambda,
  	mu: mu,
  	nu: nu,
  	xi: xi,
  	omicron: omicron,
  	pi: pi,
  	rho: rho,
  	sigmaf: sigmaf,
  	sigma: sigma,
  	tau: tau,
  	upsilon: upsilon,
  	phi: phi,
  	chi: chi,
  	psi: psi,
  	omega: omega,
  	thetasym: thetasym,
  	upsih: upsih,
  	piv: piv,
  	ensp: ensp,
  	emsp: emsp,
  	thinsp: thinsp,
  	zwnj: zwnj,
  	zwj: zwj,
  	lrm: lrm,
  	rlm: rlm,
  	ndash: ndash,
  	mdash: mdash,
  	lsquo: lsquo,
  	rsquo: rsquo,
  	sbquo: sbquo,
  	ldquo: ldquo,
  	rdquo: rdquo,
  	bdquo: bdquo,
  	dagger: dagger,
  	Dagger: Dagger,
  	bull: bull,
  	hellip: hellip,
  	permil: permil,
  	prime: prime,
  	Prime: Prime,
  	lsaquo: lsaquo,
  	rsaquo: rsaquo,
  	oline: oline,
  	frasl: frasl,
  	euro: euro,
  	image: image,
  	weierp: weierp,
  	real: real,
  	trade: trade,
  	alefsym: alefsym,
  	larr: larr,
  	uarr: uarr,
  	rarr: rarr,
  	darr: darr,
  	harr: harr,
  	crarr: crarr,
  	lArr: lArr,
  	uArr: uArr,
  	rArr: rArr,
  	dArr: dArr,
  	hArr: hArr,
  	forall: forall,
  	part: part,
  	exist: exist,
  	empty: empty,
  	nabla: nabla,
  	isin: isin,
  	notin: notin,
  	ni: ni,
  	prod: prod,
  	sum: sum,
  	minus: minus,
  	lowast: lowast,
  	radic: radic,
  	prop: prop,
  	infin: infin,
  	ang: ang,
  	and: and,
  	or: or,
  	cap: cap,
  	cup: cup,
  	int: int,
  	there4: there4,
  	sim: sim,
  	cong: cong,
  	asymp: asymp,
  	ne: ne,
  	equiv: equiv,
  	le: le,
  	ge: ge,
  	sub: sub,
  	sup: sup,
  	nsub: nsub,
  	sube: sube,
  	supe: supe,
  	oplus: oplus,
  	otimes: otimes,
  	perp: perp,
  	sdot: sdot,
  	lceil: lceil,
  	rceil: rceil,
  	lfloor: lfloor,
  	rfloor: rfloor,
  	lang: lang,
  	rang: rang,
  	loz: loz,
  	spades: spades,
  	clubs: clubs,
  	hearts: hearts,
  	diams: diams
  };

  const HTMLEntityRe = /&(\S+);/g;
  const HEX_NUMBER = /^[\da-fA-F]+$/;
  const DECIMAL_NUMBER = /^\d+$/;

  /**
   * Encode unicode hex html entities like for example &#x222;
   * @param   {string} string - input string
   * @returns {string} encoded string
   */
  function encodeHex(string) {
    const hex = string.substring(2);

    return HEX_NUMBER.test(hex) ? String.fromCodePoint(parseInt(hex, 16)) : string
  }

  /**
   * Encode unicode decimal html entities like for example &#222;
   * @param   {string} string - input string
   * @returns {string} encoded string
   */
  function encodeDecimal(string) {
    const nr = string.substring(1);

    return DECIMAL_NUMBER.test(nr)
      ? String.fromCodePoint(parseInt(nr, 10))
      : string
  }

  /**
   * Encode html entities in strings like &nbsp;
   * @param   {string} string - input string
   * @returns {string} encoded string
   */
  function encodeHTMLEntities(string) {
    return string.replace(HTMLEntityRe, (match, entity) => {
      const [firstChar, secondChar] = entity;

      if (firstChar === '#') {
        return secondChar === 'x' ? encodeHex(entity) : encodeDecimal(entity)
      } else {
        return entities[entity] || entity
      }
    })
  }

  /**
   * Native String.prototype.trimEnd method with fallback to String.prototype.trimRight
   * Edge doesn't support the first one
   * @param   {string} string - input string
   * @returns {string} trimmed output
   */
  function trimEnd(string) {
    return (string.trimEnd || string.trimRight).apply(string)
  }

  /**
   * Native String.prototype.trimStart method with fallback to String.prototype.trimLeft
   * Edge doesn't support the first one
   * @param   {string} string - input string
   * @returns {string} trimmed output
   */
  function trimStart(string) {
    return (string.trimStart || string.trimLeft).apply(string)
  }

  /**
   * Unescape the user escaped chars
   * @param   {string} string - input string
   * @param   {string} char - probably a '{' or anything the user want's to escape
   * @returns {string} cleaned up string
   */
  function unescapeChar(string, char) {
    return string.replace(RegExp(`\\\\${char}`, 'gm'), char)
  }

  /**
   * Generate the pure immutable string chunks from a RiotParser.Node.Text
   * @param   {RiotParser.Node.Text} node - riot parser text node
   * @param   {string} sourceCode sourceCode - source code
   * @returns {Array} array containing the immutable string chunks
   */
  function generateLiteralStringChunksFromNode(node, sourceCode) {
    return (
      node.expressions
        .reduce((chunks, expression, index) => {
          const start = index ? node.expressions[index - 1].end : node.start;
          const string = encodeHTMLEntities(
            sourceCode.substring(start, expression.start),
          );

          // trimStart the first string
          chunks.push(index === 0 ? trimStart(string) : string);

          // add the tail to the string
          if (index === node.expressions.length - 1)
            chunks.push(
              encodeHTMLEntities(
                trimEnd(sourceCode.substring(expression.end, node.end)),
              ),
            );

          return chunks
        }, [])
        // comments are not supported here
        .filter((str) => !isCommentString(str))
        .map((str) => (node.unescape ? unescapeChar(str, node.unescape) : str))
    )
  }

  /**
   * Simple bindings might contain multiple expressions like for example: "{foo} and {bar}"
   * This helper aims to merge them in a template literal if it's necessary
   * @param   {RiotParser.Node} node - riot parser node
   * @param   {string} sourceFile - original tag file
   * @param   {string} sourceCode - original tag source code
   * @returns {object} a template literal expression object
   */
  function mergeNodeExpressions(node, sourceFile, sourceCode) {
    if (node.parts.length === 1)
      return transformExpression(node.expressions[0], sourceFile, sourceCode)

    const pureStringChunks = generateLiteralStringChunksFromNode(node, sourceCode);
    const stringsArray = pureStringChunks
      .reduce((acc, str, index) => {
        const expr = node.expressions[index];

        return [
          ...acc,
          builders.literal(str),
          expr ? transformExpression(expr, sourceFile, sourceCode) : nullNode(),
        ]
      }, [])
      // filter the empty literal expressions
      .filter((expr) => !isLiteral(expr) || expr.value);

    return createArrayString(stringsArray)
  }

  /**
   * Create a text expression
   * @param   {RiotParser.Node.Text} sourceNode - text node to parse
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @param   {number} childNodeIndex - position of the child text node in its parent children nodes
   * @returns {AST.Node} object containing the expression binding keys
   */
  function createTextExpression(
    sourceNode,
    sourceFile,
    sourceCode,
    childNodeIndex,
  ) {
    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(EXPRESSION_TYPES),
          builders.identifier(TEXT_EXPRESSION_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_CHILD_NODE_INDEX_KEY,
        builders.literal(childNodeIndex),
      ),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        wrapASTInFunctionWithScope(
          mergeNodeExpressions(sourceNode, sourceFile, sourceCode),
        ),
      ),
    ])
  }

  function createValueExpression(
    sourceNode,
    sourceFile,
    sourceCode,
  ) {
    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(EXPRESSION_TYPES),
          builders.identifier(VALUE_EXPRESSION_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        createAttributeEvaluationFunction(sourceNode, sourceFile, sourceCode),
      ),
    ])
  }

  function createRefExpression(
    sourceNode,
    sourceFile,
    sourceCode,
  ) {
    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(EXPRESSION_TYPES),
          builders.identifier(REF_EXPRESSION_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        createAttributeEvaluationFunction(sourceNode, sourceFile, sourceCode),
      ),
    ])
  }

  function createExpression(
    sourceNode,
    sourceFile,
    sourceCode,
    childNodeIndex,
    parentNode,
  ) {
    switch (true) {
      case isTextNode(sourceNode):
        return createTextExpression(sourceNode, sourceFile, sourceCode, childNodeIndex)
      // progress nodes value attributes will be rendered as attributes
      // see https://github.com/riot/compiler/issues/122
      case isValueAttribute(sourceNode) &&
        hasValueAttribute(parentNode.name) &&
        !isProgressNode(parentNode):
        return createValueExpression(sourceNode, sourceFile, sourceCode)
      case isRefAttribute(sourceNode):
        return createRefExpression(sourceNode, sourceFile, sourceCode)
      case isEventAttribute(sourceNode):
        return createEventExpression(sourceNode, sourceFile, sourceCode)
      default:
        return createAttributeExpression(sourceNode, sourceFile, sourceCode)
    }
  }

  /**
   * Create the attribute expressions
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @returns {Array} array containing all the attribute expressions
   */
  function createAttributeExpressions(sourceNode, sourceFile, sourceCode) {
    return findDynamicAttributes(sourceNode).map((attribute) =>
      createExpression(attribute, sourceFile, sourceCode, 0, sourceNode),
    )
  }

  var acorn$1 = {};

  var acorn = {exports: {}};

  var hasRequiredAcorn$1;

  function requireAcorn$1 () {
  	if (hasRequiredAcorn$1) return acorn.exports;
  	hasRequiredAcorn$1 = 1;
  	(function (module, exports) {
  		(function (global, factory) {
  		  factory(exports) ;
  		})(this, (function (exports) {
  		  // This file was generated. Do not modify manually!
  		  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 80, 3, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 343, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 726, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

  		  // This file was generated. Do not modify manually!
  		  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 2, 60, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 42, 9, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 496, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];

  		  // This file was generated. Do not modify manually!
  		  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0897-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

  		  // This file was generated. Do not modify manually!
  		  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c8a\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7cd\ua7d0\ua7d1\ua7d3\ua7d5-\ua7dc\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

  		  // These are a run-length and offset encoded representation of the
  		  // >0xffff code points that are a valid part of identifiers. The
  		  // offset starts at 0x10000, and each pair of numbers represents an
  		  // offset to the next range, and then a size of the range.

  		  // Reserved word lists for various dialects of the language

  		  var reservedWords = {
  		    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  		    5: "class enum extends super const export import",
  		    6: "enum",
  		    strict: "implements interface let package private protected public static yield",
  		    strictBind: "eval arguments"
  		  };

  		  // And the keywords

  		  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  		  var keywords$1 = {
  		    5: ecma5AndLessKeywords,
  		    "5module": ecma5AndLessKeywords + " export import",
  		    6: ecma5AndLessKeywords + " const class extends export import super"
  		  };

  		  var keywordRelationalOperator = /^in(stanceof)?$/;

  		  // ## Character categories

  		  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  		  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  		  // This has a complexity linear to the value of the code. The
  		  // assumption is that looking up astral identifier characters is
  		  // rare.
  		  function isInAstralSet(code, set) {
  		    var pos = 0x10000;
  		    for (var i = 0; i < set.length; i += 2) {
  		      pos += set[i];
  		      if (pos > code) { return false }
  		      pos += set[i + 1];
  		      if (pos >= code) { return true }
  		    }
  		    return false
  		  }

  		  // Test whether a given character code starts an identifier.

  		  function isIdentifierStart(code, astral) {
  		    if (code < 65) { return code === 36 }
  		    if (code < 91) { return true }
  		    if (code < 97) { return code === 95 }
  		    if (code < 123) { return true }
  		    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  		    if (astral === false) { return false }
  		    return isInAstralSet(code, astralIdentifierStartCodes)
  		  }

  		  // Test whether a given character is part of an identifier.

  		  function isIdentifierChar(code, astral) {
  		    if (code < 48) { return code === 36 }
  		    if (code < 58) { return true }
  		    if (code < 65) { return false }
  		    if (code < 91) { return true }
  		    if (code < 97) { return code === 95 }
  		    if (code < 123) { return true }
  		    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  		    if (astral === false) { return false }
  		    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  		  }

  		  // ## Token types

  		  // The assignment of fine-grained, information-carrying type objects
  		  // allows the tokenizer to store the information it has about a
  		  // token in a way that is very cheap for the parser to look up.

  		  // All token type variables start with an underscore, to make them
  		  // easy to recognize.

  		  // The `beforeExpr` property is used to disambiguate between regular
  		  // expressions and divisions. It is set on all token types that can
  		  // be followed by an expression (thus, a slash after them would be a
  		  // regular expression).
  		  //
  		  // The `startsExpr` property is used to check if the token ends a
  		  // `yield` expression. It is set on all token types that either can
  		  // directly start an expression (like a quotation mark) or can
  		  // continue an expression (like the body of a string).
  		  //
  		  // `isLoop` marks a keyword as starting a loop, which is important
  		  // to know when parsing a label, in order to allow or disallow
  		  // continue jumps to that label.

  		  var TokenType = function TokenType(label, conf) {
  		    if ( conf === void 0 ) conf = {};

  		    this.label = label;
  		    this.keyword = conf.keyword;
  		    this.beforeExpr = !!conf.beforeExpr;
  		    this.startsExpr = !!conf.startsExpr;
  		    this.isLoop = !!conf.isLoop;
  		    this.isAssign = !!conf.isAssign;
  		    this.prefix = !!conf.prefix;
  		    this.postfix = !!conf.postfix;
  		    this.binop = conf.binop || null;
  		    this.updateContext = null;
  		  };

  		  function binop(name, prec) {
  		    return new TokenType(name, {beforeExpr: true, binop: prec})
  		  }
  		  var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  		  // Map keyword names to token types.

  		  var keywords = {};

  		  // Succinct definitions of keyword token types
  		  function kw(name, options) {
  		    if ( options === void 0 ) options = {};

  		    options.keyword = name;
  		    return keywords[name] = new TokenType(name, options)
  		  }

  		  var types$1 = {
  		    num: new TokenType("num", startsExpr),
  		    regexp: new TokenType("regexp", startsExpr),
  		    string: new TokenType("string", startsExpr),
  		    name: new TokenType("name", startsExpr),
  		    privateId: new TokenType("privateId", startsExpr),
  		    eof: new TokenType("eof"),

  		    // Punctuation token types.
  		    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  		    bracketR: new TokenType("]"),
  		    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  		    braceR: new TokenType("}"),
  		    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  		    parenR: new TokenType(")"),
  		    comma: new TokenType(",", beforeExpr),
  		    semi: new TokenType(";", beforeExpr),
  		    colon: new TokenType(":", beforeExpr),
  		    dot: new TokenType("."),
  		    question: new TokenType("?", beforeExpr),
  		    questionDot: new TokenType("?."),
  		    arrow: new TokenType("=>", beforeExpr),
  		    template: new TokenType("template"),
  		    invalidTemplate: new TokenType("invalidTemplate"),
  		    ellipsis: new TokenType("...", beforeExpr),
  		    backQuote: new TokenType("`", startsExpr),
  		    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  		    // Operators. These carry several kinds of properties to help the
  		    // parser use them properly (the presence of these properties is
  		    // what categorizes them as operators).
  		    //
  		    // `binop`, when present, specifies that this operator is a binary
  		    // operator, and will refer to its precedence.
  		    //
  		    // `prefix` and `postfix` mark the operator as a prefix or postfix
  		    // unary operator.
  		    //
  		    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  		    // binary operators with a very low precedence, that should result
  		    // in AssignmentExpression nodes.

  		    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  		    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  		    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  		    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  		    logicalOR: binop("||", 1),
  		    logicalAND: binop("&&", 2),
  		    bitwiseOR: binop("|", 3),
  		    bitwiseXOR: binop("^", 4),
  		    bitwiseAND: binop("&", 5),
  		    equality: binop("==/!=/===/!==", 6),
  		    relational: binop("</>/<=/>=", 7),
  		    bitShift: binop("<</>>/>>>", 8),
  		    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  		    modulo: binop("%", 10),
  		    star: binop("*", 10),
  		    slash: binop("/", 10),
  		    starstar: new TokenType("**", {beforeExpr: true}),
  		    coalesce: binop("??", 1),

  		    // Keyword token types.
  		    _break: kw("break"),
  		    _case: kw("case", beforeExpr),
  		    _catch: kw("catch"),
  		    _continue: kw("continue"),
  		    _debugger: kw("debugger"),
  		    _default: kw("default", beforeExpr),
  		    _do: kw("do", {isLoop: true, beforeExpr: true}),
  		    _else: kw("else", beforeExpr),
  		    _finally: kw("finally"),
  		    _for: kw("for", {isLoop: true}),
  		    _function: kw("function", startsExpr),
  		    _if: kw("if"),
  		    _return: kw("return", beforeExpr),
  		    _switch: kw("switch"),
  		    _throw: kw("throw", beforeExpr),
  		    _try: kw("try"),
  		    _var: kw("var"),
  		    _const: kw("const"),
  		    _while: kw("while", {isLoop: true}),
  		    _with: kw("with"),
  		    _new: kw("new", {beforeExpr: true, startsExpr: true}),
  		    _this: kw("this", startsExpr),
  		    _super: kw("super", startsExpr),
  		    _class: kw("class", startsExpr),
  		    _extends: kw("extends", beforeExpr),
  		    _export: kw("export"),
  		    _import: kw("import", startsExpr),
  		    _null: kw("null", startsExpr),
  		    _true: kw("true", startsExpr),
  		    _false: kw("false", startsExpr),
  		    _in: kw("in", {beforeExpr: true, binop: 7}),
  		    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  		    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  		    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  		    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  		  };

  		  // Matches a whole line break (where CRLF is considered a single
  		  // line break). Used to count lines.

  		  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  		  var lineBreakG = new RegExp(lineBreak.source, "g");

  		  function isNewLine(code) {
  		    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
  		  }

  		  function nextLineBreak(code, from, end) {
  		    if ( end === void 0 ) end = code.length;

  		    for (var i = from; i < end; i++) {
  		      var next = code.charCodeAt(i);
  		      if (isNewLine(next))
  		        { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
  		    }
  		    return -1
  		  }

  		  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  		  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  		  var ref = Object.prototype;
  		  var hasOwnProperty = ref.hasOwnProperty;
  		  var toString = ref.toString;

  		  var hasOwn = Object.hasOwn || (function (obj, propName) { return (
  		    hasOwnProperty.call(obj, propName)
  		  ); });

  		  var isArray = Array.isArray || (function (obj) { return (
  		    toString.call(obj) === "[object Array]"
  		  ); });

  		  var regexpCache = Object.create(null);

  		  function wordsRegexp(words) {
  		    return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
  		  }

  		  function codePointToString(code) {
  		    // UTF-16 Decoding
  		    if (code <= 0xFFFF) { return String.fromCharCode(code) }
  		    code -= 0x10000;
  		    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  		  }

  		  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

  		  // These are used when `options.locations` is on, for the
  		  // `startLoc` and `endLoc` properties.

  		  var Position = function Position(line, col) {
  		    this.line = line;
  		    this.column = col;
  		  };

  		  Position.prototype.offset = function offset (n) {
  		    return new Position(this.line, this.column + n)
  		  };

  		  var SourceLocation = function SourceLocation(p, start, end) {
  		    this.start = start;
  		    this.end = end;
  		    if (p.sourceFile !== null) { this.source = p.sourceFile; }
  		  };

  		  // The `getLineInfo` function is mostly useful when the
  		  // `locations` option is off (for performance reasons) and you
  		  // want to find the line/column position for a given character
  		  // offset. `input` should be the code string that the offset refers
  		  // into.

  		  function getLineInfo(input, offset) {
  		    for (var line = 1, cur = 0;;) {
  		      var nextBreak = nextLineBreak(input, cur, offset);
  		      if (nextBreak < 0) { return new Position(line, offset - cur) }
  		      ++line;
  		      cur = nextBreak;
  		    }
  		  }

  		  // A second argument must be given to configure the parser process.
  		  // These options are recognized (only `ecmaVersion` is required):

  		  var defaultOptions = {
  		    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  		    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  		    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  		    // (the latest version the library supports). This influences
  		    // support for strict mode, the set of reserved words, and support
  		    // for new syntax features.
  		    ecmaVersion: null,
  		    // `sourceType` indicates the mode the code should be parsed in.
  		    // Can be either `"script"` or `"module"`. This influences global
  		    // strict mode and parsing of `import` and `export` declarations.
  		    sourceType: "script",
  		    // `onInsertedSemicolon` can be a callback that will be called when
  		    // a semicolon is automatically inserted. It will be passed the
  		    // position of the inserted semicolon as an offset, and if
  		    // `locations` is enabled, it is given the location as a `{line,
  		    // column}` object as second argument.
  		    onInsertedSemicolon: null,
  		    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  		    // trailing commas.
  		    onTrailingComma: null,
  		    // By default, reserved words are only enforced if ecmaVersion >= 5.
  		    // Set `allowReserved` to a boolean value to explicitly turn this on
  		    // an off. When this option has the value "never", reserved words
  		    // and keywords can also not be used as property names.
  		    allowReserved: null,
  		    // When enabled, a return at the top level is not considered an
  		    // error.
  		    allowReturnOutsideFunction: false,
  		    // When enabled, import/export statements are not constrained to
  		    // appearing at the top of the program, and an import.meta expression
  		    // in a script isn't considered an error.
  		    allowImportExportEverywhere: false,
  		    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  		    // When enabled, await identifiers are allowed to appear at the top-level scope,
  		    // but they are still not allowed in non-async functions.
  		    allowAwaitOutsideFunction: null,
  		    // When enabled, super identifiers are not constrained to
  		    // appearing in methods and do not raise an error when they appear elsewhere.
  		    allowSuperOutsideMethod: null,
  		    // When enabled, hashbang directive in the beginning of file is
  		    // allowed and treated as a line comment. Enabled by default when
  		    // `ecmaVersion` >= 2023.
  		    allowHashBang: false,
  		    // By default, the parser will verify that private properties are
  		    // only used in places where they are valid and have been declared.
  		    // Set this to false to turn such checks off.
  		    checkPrivateFields: true,
  		    // When `locations` is on, `loc` properties holding objects with
  		    // `start` and `end` properties in `{line, column}` form (with
  		    // line being 1-based and column 0-based) will be attached to the
  		    // nodes.
  		    locations: false,
  		    // A function can be passed as `onToken` option, which will
  		    // cause Acorn to call that function with object in the same
  		    // format as tokens returned from `tokenizer().getToken()`. Note
  		    // that you are not allowed to call the parser from the
  		    // callback—that will corrupt its internal state.
  		    onToken: null,
  		    // A function can be passed as `onComment` option, which will
  		    // cause Acorn to call that function with `(block, text, start,
  		    // end)` parameters whenever a comment is skipped. `block` is a
  		    // boolean indicating whether this is a block (`/* */`) comment,
  		    // `text` is the content of the comment, and `start` and `end` are
  		    // character offsets that denote the start and end of the comment.
  		    // When the `locations` option is on, two more parameters are
  		    // passed, the full `{line, column}` locations of the start and
  		    // end of the comments. Note that you are not allowed to call the
  		    // parser from the callback—that will corrupt its internal state.
  		    // When this option has an array as value, objects representing the
  		    // comments are pushed to it.
  		    onComment: null,
  		    // Nodes have their start and end characters offsets recorded in
  		    // `start` and `end` properties (directly on the node, rather than
  		    // the `loc` object, which holds line/column data. To also add a
  		    // [semi-standardized][range] `range` property holding a `[start,
  		    // end]` array with the same numbers, set the `ranges` option to
  		    // `true`.
  		    //
  		    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  		    ranges: false,
  		    // It is possible to parse multiple files into a single AST by
  		    // passing the tree produced by parsing the first file as
  		    // `program` option in subsequent parses. This will add the
  		    // toplevel forms of the parsed file to the `Program` (top) node
  		    // of an existing parse tree.
  		    program: null,
  		    // When `locations` is on, you can pass this to record the source
  		    // file in every node's `loc` object.
  		    sourceFile: null,
  		    // This value, if given, is stored in every node, whether
  		    // `locations` is on or off.
  		    directSourceFile: null,
  		    // When enabled, parenthesized expressions are represented by
  		    // (non-standard) ParenthesizedExpression nodes
  		    preserveParens: false
  		  };

  		  // Interpret and default an options object

  		  var warnedAboutEcmaVersion = false;

  		  function getOptions(opts) {
  		    var options = {};

  		    for (var opt in defaultOptions)
  		      { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  		    if (options.ecmaVersion === "latest") {
  		      options.ecmaVersion = 1e8;
  		    } else if (options.ecmaVersion == null) {
  		      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
  		        warnedAboutEcmaVersion = true;
  		        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
  		      }
  		      options.ecmaVersion = 11;
  		    } else if (options.ecmaVersion >= 2015) {
  		      options.ecmaVersion -= 2009;
  		    }

  		    if (options.allowReserved == null)
  		      { options.allowReserved = options.ecmaVersion < 5; }

  		    if (!opts || opts.allowHashBang == null)
  		      { options.allowHashBang = options.ecmaVersion >= 14; }

  		    if (isArray(options.onToken)) {
  		      var tokens = options.onToken;
  		      options.onToken = function (token) { return tokens.push(token); };
  		    }
  		    if (isArray(options.onComment))
  		      { options.onComment = pushComment(options, options.onComment); }

  		    return options
  		  }

  		  function pushComment(options, array) {
  		    return function(block, text, start, end, startLoc, endLoc) {
  		      var comment = {
  		        type: block ? "Block" : "Line",
  		        value: text,
  		        start: start,
  		        end: end
  		      };
  		      if (options.locations)
  		        { comment.loc = new SourceLocation(this, startLoc, endLoc); }
  		      if (options.ranges)
  		        { comment.range = [start, end]; }
  		      array.push(comment);
  		    }
  		  }

  		  // Each scope gets a bitset that may contain these flags
  		  var
  		      SCOPE_TOP = 1,
  		      SCOPE_FUNCTION = 2,
  		      SCOPE_ASYNC = 4,
  		      SCOPE_GENERATOR = 8,
  		      SCOPE_ARROW = 16,
  		      SCOPE_SIMPLE_CATCH = 32,
  		      SCOPE_SUPER = 64,
  		      SCOPE_DIRECT_SUPER = 128,
  		      SCOPE_CLASS_STATIC_BLOCK = 256,
  		      SCOPE_CLASS_FIELD_INIT = 512,
  		      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

  		  function functionFlags(async, generator) {
  		    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
  		  }

  		  // Used in checkLVal* and declareName to determine the type of a binding
  		  var
  		      BIND_NONE = 0, // Not a binding
  		      BIND_VAR = 1, // Var-style binding
  		      BIND_LEXICAL = 2, // Let- or const-style binding
  		      BIND_FUNCTION = 3, // Function declaration
  		      BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
  		      BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

  		  var Parser = function Parser(options, input, startPos) {
  		    this.options = options = getOptions(options);
  		    this.sourceFile = options.sourceFile;
  		    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  		    var reserved = "";
  		    if (options.allowReserved !== true) {
  		      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
  		      if (options.sourceType === "module") { reserved += " await"; }
  		    }
  		    this.reservedWords = wordsRegexp(reserved);
  		    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  		    this.reservedWordsStrict = wordsRegexp(reservedStrict);
  		    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  		    this.input = String(input);

  		    // Used to signal to callers of `readWord1` whether the word
  		    // contained any escape sequences. This is needed because words with
  		    // escape sequences must not be interpreted as keywords.
  		    this.containsEsc = false;

  		    // Set up token state

  		    // The current position of the tokenizer in the input.
  		    if (startPos) {
  		      this.pos = startPos;
  		      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
  		      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  		    } else {
  		      this.pos = this.lineStart = 0;
  		      this.curLine = 1;
  		    }

  		    // Properties of the current token:
  		    // Its type
  		    this.type = types$1.eof;
  		    // For tokens that include more information than their type, the value
  		    this.value = null;
  		    // Its start and end offset
  		    this.start = this.end = this.pos;
  		    // And, if locations are used, the {line, column} object
  		    // corresponding to those offsets
  		    this.startLoc = this.endLoc = this.curPosition();

  		    // Position information for the previous token
  		    this.lastTokEndLoc = this.lastTokStartLoc = null;
  		    this.lastTokStart = this.lastTokEnd = this.pos;

  		    // The context stack is used to superficially track syntactic
  		    // context to predict whether a regular expression is allowed in a
  		    // given position.
  		    this.context = this.initialContext();
  		    this.exprAllowed = true;

  		    // Figure out if it's a module code.
  		    this.inModule = options.sourceType === "module";
  		    this.strict = this.inModule || this.strictDirective(this.pos);

  		    // Used to signify the start of a potential arrow function
  		    this.potentialArrowAt = -1;
  		    this.potentialArrowInForAwait = false;

  		    // Positions to delayed-check that yield/await does not exist in default parameters.
  		    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  		    // Labels in scope.
  		    this.labels = [];
  		    // Thus-far undefined exports.
  		    this.undefinedExports = Object.create(null);

  		    // If enabled, skip leading hashbang line.
  		    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
  		      { this.skipLineComment(2); }

  		    // Scope tracking for duplicate variable names (see scope.js)
  		    this.scopeStack = [];
  		    this.enterScope(SCOPE_TOP);

  		    // For RegExp validation
  		    this.regexpState = null;

  		    // The stack of private names.
  		    // Each element has two properties: 'declared' and 'used'.
  		    // When it exited from the outermost class definition, all used private names must be declared.
  		    this.privateNameStack = [];
  		  };

  		  var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

  		  Parser.prototype.parse = function parse () {
  		    var node = this.options.program || this.startNode();
  		    this.nextToken();
  		    return this.parseTopLevel(node)
  		  };

  		  prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

  		  prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 };

  		  prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 };

  		  prototypeAccessors.canAwait.get = function () {
  		    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
  		      var ref = this.scopeStack[i];
  		        var flags = ref.flags;
  		      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) { return false }
  		      if (flags & SCOPE_FUNCTION) { return (flags & SCOPE_ASYNC) > 0 }
  		    }
  		    return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
  		  };

  		  prototypeAccessors.allowSuper.get = function () {
  		    var ref = this.currentThisScope();
  		      var flags = ref.flags;
  		    return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod
  		  };

  		  prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

  		  prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

  		  prototypeAccessors.allowNewDotTarget.get = function () {
  		    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
  		      var ref = this.scopeStack[i];
  		        var flags = ref.flags;
  		      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) ||
  		          ((flags & SCOPE_FUNCTION) && !(flags & SCOPE_ARROW))) { return true }
  		    }
  		    return false
  		  };

  		  prototypeAccessors.inClassStaticBlock.get = function () {
  		    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
  		  };

  		  Parser.extend = function extend () {
  		      var plugins = [], len = arguments.length;
  		      while ( len-- ) plugins[ len ] = arguments[ len ];

  		    var cls = this;
  		    for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
  		    return cls
  		  };

  		  Parser.parse = function parse (input, options) {
  		    return new this(options, input).parse()
  		  };

  		  Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
  		    var parser = new this(options, input, pos);
  		    parser.nextToken();
  		    return parser.parseExpression()
  		  };

  		  Parser.tokenizer = function tokenizer (input, options) {
  		    return new this(options, input)
  		  };

  		  Object.defineProperties( Parser.prototype, prototypeAccessors );

  		  var pp$9 = Parser.prototype;

  		  // ## Parser utilities

  		  var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  		  pp$9.strictDirective = function(start) {
  		    if (this.options.ecmaVersion < 5) { return false }
  		    for (;;) {
  		      // Try to find string literal.
  		      skipWhiteSpace.lastIndex = start;
  		      start += skipWhiteSpace.exec(this.input)[0].length;
  		      var match = literal.exec(this.input.slice(start));
  		      if (!match) { return false }
  		      if ((match[1] || match[2]) === "use strict") {
  		        skipWhiteSpace.lastIndex = start + match[0].length;
  		        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
  		        var next = this.input.charAt(end);
  		        return next === ";" || next === "}" ||
  		          (lineBreak.test(spaceAfter[0]) &&
  		           !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
  		      }
  		      start += match[0].length;

  		      // Skip semicolon, if any.
  		      skipWhiteSpace.lastIndex = start;
  		      start += skipWhiteSpace.exec(this.input)[0].length;
  		      if (this.input[start] === ";")
  		        { start++; }
  		    }
  		  };

  		  // Predicate that tests whether the next token is of the given
  		  // type, and if yes, consumes it as a side effect.

  		  pp$9.eat = function(type) {
  		    if (this.type === type) {
  		      this.next();
  		      return true
  		    } else {
  		      return false
  		    }
  		  };

  		  // Tests whether parsed token is a contextual keyword.

  		  pp$9.isContextual = function(name) {
  		    return this.type === types$1.name && this.value === name && !this.containsEsc
  		  };

  		  // Consumes contextual keyword if possible.

  		  pp$9.eatContextual = function(name) {
  		    if (!this.isContextual(name)) { return false }
  		    this.next();
  		    return true
  		  };

  		  // Asserts that following token is given contextual keyword.

  		  pp$9.expectContextual = function(name) {
  		    if (!this.eatContextual(name)) { this.unexpected(); }
  		  };

  		  // Test whether a semicolon can be inserted at the current position.

  		  pp$9.canInsertSemicolon = function() {
  		    return this.type === types$1.eof ||
  		      this.type === types$1.braceR ||
  		      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  		  };

  		  pp$9.insertSemicolon = function() {
  		    if (this.canInsertSemicolon()) {
  		      if (this.options.onInsertedSemicolon)
  		        { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
  		      return true
  		    }
  		  };

  		  // Consume a semicolon, or, failing that, see if we are allowed to
  		  // pretend that there is a semicolon at this position.

  		  pp$9.semicolon = function() {
  		    if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
  		  };

  		  pp$9.afterTrailingComma = function(tokType, notNext) {
  		    if (this.type === tokType) {
  		      if (this.options.onTrailingComma)
  		        { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
  		      if (!notNext)
  		        { this.next(); }
  		      return true
  		    }
  		  };

  		  // Expect a token of a given type. If found, consume it, otherwise,
  		  // raise an unexpected token error.

  		  pp$9.expect = function(type) {
  		    this.eat(type) || this.unexpected();
  		  };

  		  // Raise an unexpected token error.

  		  pp$9.unexpected = function(pos) {
  		    this.raise(pos != null ? pos : this.start, "Unexpected token");
  		  };

  		  var DestructuringErrors = function DestructuringErrors() {
  		    this.shorthandAssign =
  		    this.trailingComma =
  		    this.parenthesizedAssign =
  		    this.parenthesizedBind =
  		    this.doubleProto =
  		      -1;
  		  };

  		  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  		    if (!refDestructuringErrors) { return }
  		    if (refDestructuringErrors.trailingComma > -1)
  		      { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  		    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  		    if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
  		  };

  		  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  		    if (!refDestructuringErrors) { return false }
  		    var shorthandAssign = refDestructuringErrors.shorthandAssign;
  		    var doubleProto = refDestructuringErrors.doubleProto;
  		    if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  		    if (shorthandAssign >= 0)
  		      { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  		    if (doubleProto >= 0)
  		      { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
  		  };

  		  pp$9.checkYieldAwaitInDefaultParams = function() {
  		    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
  		      { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  		    if (this.awaitPos)
  		      { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
  		  };

  		  pp$9.isSimpleAssignTarget = function(expr) {
  		    if (expr.type === "ParenthesizedExpression")
  		      { return this.isSimpleAssignTarget(expr.expression) }
  		    return expr.type === "Identifier" || expr.type === "MemberExpression"
  		  };

  		  var pp$8 = Parser.prototype;

  		  // ### Statement parsing

  		  // Parse a program. Initializes the parser, reads any number of
  		  // statements, and wraps them in a Program node.  Optionally takes a
  		  // `program` argument.  If present, the statements will be appended
  		  // to its body instead of creating a new node.

  		  pp$8.parseTopLevel = function(node) {
  		    var exports = Object.create(null);
  		    if (!node.body) { node.body = []; }
  		    while (this.type !== types$1.eof) {
  		      var stmt = this.parseStatement(null, true, exports);
  		      node.body.push(stmt);
  		    }
  		    if (this.inModule)
  		      { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
  		        {
  		          var name = list[i];

  		          this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
  		        } }
  		    this.adaptDirectivePrologue(node.body);
  		    this.next();
  		    node.sourceType = this.options.sourceType;
  		    return this.finishNode(node, "Program")
  		  };

  		  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  		  pp$8.isLet = function(context) {
  		    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  		    skipWhiteSpace.lastIndex = this.pos;
  		    var skip = skipWhiteSpace.exec(this.input);
  		    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  		    // For ambiguous cases, determine if a LexicalDeclaration (or only a
  		    // Statement) is allowed here. If context is not empty then only a Statement
  		    // is allowed. However, `let [` is an explicit negative lookahead for
  		    // ExpressionStatement, so special-case it first.
  		    if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
  		    if (context) { return false }

  		    if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
  		    if (isIdentifierStart(nextCh, true)) {
  		      var pos = next + 1;
  		      while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
  		      if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
  		      var ident = this.input.slice(next, pos);
  		      if (!keywordRelationalOperator.test(ident)) { return true }
  		    }
  		    return false
  		  };

  		  // check 'async [no LineTerminator here] function'
  		  // - 'async /*foo*/ function' is OK.
  		  // - 'async /*\n*/ function' is invalid.
  		  pp$8.isAsyncFunction = function() {
  		    if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
  		      { return false }

  		    skipWhiteSpace.lastIndex = this.pos;
  		    var skip = skipWhiteSpace.exec(this.input);
  		    var next = this.pos + skip[0].length, after;
  		    return !lineBreak.test(this.input.slice(this.pos, next)) &&
  		      this.input.slice(next, next + 8) === "function" &&
  		      (next + 8 === this.input.length ||
  		       !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
  		  };

  		  pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
  		    if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using"))
  		      { return false }

  		    skipWhiteSpace.lastIndex = this.pos;
  		    var skip = skipWhiteSpace.exec(this.input);
  		    var next = this.pos + skip[0].length;

  		    if (lineBreak.test(this.input.slice(this.pos, next))) { return false }

  		    if (isAwaitUsing) {
  		      var awaitEndPos = next + 5 /* await */, after;
  		      if (this.input.slice(next, awaitEndPos) !== "using" ||
  		        awaitEndPos === this.input.length ||
  		        isIdentifierChar(after = this.input.charCodeAt(awaitEndPos)) ||
  		        (after > 0xd7ff && after < 0xdc00)
  		      ) { return false }

  		      skipWhiteSpace.lastIndex = awaitEndPos;
  		      var skipAfterUsing = skipWhiteSpace.exec(this.input);
  		      if (skipAfterUsing && lineBreak.test(this.input.slice(awaitEndPos, awaitEndPos + skipAfterUsing[0].length))) { return false }
  		    }

  		    if (isFor) {
  		      var ofEndPos = next + 2 /* of */, after$1;
  		      if (this.input.slice(next, ofEndPos) === "of") {
  		        if (ofEndPos === this.input.length ||
  		          (!isIdentifierChar(after$1 = this.input.charCodeAt(ofEndPos)) && !(after$1 > 0xd7ff && after$1 < 0xdc00))) { return false }
  		      }
  		    }

  		    var ch = this.input.charCodeAt(next);
  		    return isIdentifierStart(ch, true) || ch === 92 // '\'
  		  };

  		  pp$8.isAwaitUsing = function(isFor) {
  		    return this.isUsingKeyword(true, isFor)
  		  };

  		  pp$8.isUsing = function(isFor) {
  		    return this.isUsingKeyword(false, isFor)
  		  };

  		  // Parse a single statement.
  		  //
  		  // If expecting a statement and finding a slash operator, parse a
  		  // regular expression literal. This is to handle cases like
  		  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  		  // does not help.

  		  pp$8.parseStatement = function(context, topLevel, exports) {
  		    var starttype = this.type, node = this.startNode(), kind;

  		    if (this.isLet(context)) {
  		      starttype = types$1._var;
  		      kind = "let";
  		    }

  		    // Most types of statements are recognized by the keyword they
  		    // start with. Many are trivial to parse, some require a bit of
  		    // complexity.

  		    switch (starttype) {
  		    case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  		    case types$1._debugger: return this.parseDebuggerStatement(node)
  		    case types$1._do: return this.parseDoStatement(node)
  		    case types$1._for: return this.parseForStatement(node)
  		    case types$1._function:
  		      // Function as sole body of either an if statement or a labeled statement
  		      // works, but not when it is part of a labeled statement that is the sole
  		      // body of an if statement.
  		      if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
  		      return this.parseFunctionStatement(node, false, !context)
  		    case types$1._class:
  		      if (context) { this.unexpected(); }
  		      return this.parseClass(node, true)
  		    case types$1._if: return this.parseIfStatement(node)
  		    case types$1._return: return this.parseReturnStatement(node)
  		    case types$1._switch: return this.parseSwitchStatement(node)
  		    case types$1._throw: return this.parseThrowStatement(node)
  		    case types$1._try: return this.parseTryStatement(node)
  		    case types$1._const: case types$1._var:
  		      kind = kind || this.value;
  		      if (context && kind !== "var") { this.unexpected(); }
  		      return this.parseVarStatement(node, kind)
  		    case types$1._while: return this.parseWhileStatement(node)
  		    case types$1._with: return this.parseWithStatement(node)
  		    case types$1.braceL: return this.parseBlock(true, node)
  		    case types$1.semi: return this.parseEmptyStatement(node)
  		    case types$1._export:
  		    case types$1._import:
  		      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
  		        skipWhiteSpace.lastIndex = this.pos;
  		        var skip = skipWhiteSpace.exec(this.input);
  		        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  		        if (nextCh === 40 || nextCh === 46) // '(' or '.'
  		          { return this.parseExpressionStatement(node, this.parseExpression()) }
  		      }

  		      if (!this.options.allowImportExportEverywhere) {
  		        if (!topLevel)
  		          { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
  		        if (!this.inModule)
  		          { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
  		      }
  		      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

  		      // If the statement does not start with a statement keyword or a
  		      // brace, it's an ExpressionStatement or LabeledStatement. We
  		      // simply start parsing an expression, and afterwards, if the
  		      // next token is a colon and the expression was a simple
  		      // Identifier node, we switch to interpreting it as a label.
  		    default:
  		      if (this.isAsyncFunction()) {
  		        if (context) { this.unexpected(); }
  		        this.next();
  		        return this.parseFunctionStatement(node, true, !context)
  		      }

  		      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
  		      if (usingKind) {
  		        if (topLevel && this.options.sourceType === "script") {
  		          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script`");
  		        }
  		        if (usingKind === "await using") {
  		          if (!this.canAwait) {
  		            this.raise(this.start, "Await using cannot appear outside of async function");
  		          }
  		          this.next();
  		        }
  		        this.next();
  		        this.parseVar(node, false, usingKind);
  		        this.semicolon();
  		        return this.finishNode(node, "VariableDeclaration")
  		      }

  		      var maybeName = this.value, expr = this.parseExpression();
  		      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
  		        { return this.parseLabeledStatement(node, maybeName, expr, context) }
  		      else { return this.parseExpressionStatement(node, expr) }
  		    }
  		  };

  		  pp$8.parseBreakContinueStatement = function(node, keyword) {
  		    var isBreak = keyword === "break";
  		    this.next();
  		    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
  		    else if (this.type !== types$1.name) { this.unexpected(); }
  		    else {
  		      node.label = this.parseIdent();
  		      this.semicolon();
  		    }

  		    // Verify that there is an actual destination to break or
  		    // continue to.
  		    var i = 0;
  		    for (; i < this.labels.length; ++i) {
  		      var lab = this.labels[i];
  		      if (node.label == null || lab.name === node.label.name) {
  		        if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
  		        if (node.label && isBreak) { break }
  		      }
  		    }
  		    if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  		    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  		  };

  		  pp$8.parseDebuggerStatement = function(node) {
  		    this.next();
  		    this.semicolon();
  		    return this.finishNode(node, "DebuggerStatement")
  		  };

  		  pp$8.parseDoStatement = function(node) {
  		    this.next();
  		    this.labels.push(loopLabel);
  		    node.body = this.parseStatement("do");
  		    this.labels.pop();
  		    this.expect(types$1._while);
  		    node.test = this.parseParenExpression();
  		    if (this.options.ecmaVersion >= 6)
  		      { this.eat(types$1.semi); }
  		    else
  		      { this.semicolon(); }
  		    return this.finishNode(node, "DoWhileStatement")
  		  };

  		  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  		  // loop is non-trivial. Basically, we have to parse the init `var`
  		  // statement or expression, disallowing the `in` operator (see
  		  // the second parameter to `parseExpression`), and then check
  		  // whether the next token is `in` or `of`. When there is no init
  		  // part (semicolon immediately after the opening parenthesis), it
  		  // is a regular `for` loop.

  		  pp$8.parseForStatement = function(node) {
  		    this.next();
  		    var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
  		    this.labels.push(loopLabel);
  		    this.enterScope(0);
  		    this.expect(types$1.parenL);
  		    if (this.type === types$1.semi) {
  		      if (awaitAt > -1) { this.unexpected(awaitAt); }
  		      return this.parseFor(node, null)
  		    }
  		    var isLet = this.isLet();
  		    if (this.type === types$1._var || this.type === types$1._const || isLet) {
  		      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
  		      this.next();
  		      this.parseVar(init$1, true, kind);
  		      this.finishNode(init$1, "VariableDeclaration");
  		      return this.parseForAfterInit(node, init$1, awaitAt)
  		    }
  		    var startsWithLet = this.isContextual("let"), isForOf = false;

  		    var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
  		    if (usingKind) {
  		      var init$2 = this.startNode();
  		      this.next();
  		      if (usingKind === "await using") { this.next(); }
  		      this.parseVar(init$2, true, usingKind);
  		      this.finishNode(init$2, "VariableDeclaration");
  		      return this.parseForAfterInit(node, init$2, awaitAt)
  		    }
  		    var containsEsc = this.containsEsc;
  		    var refDestructuringErrors = new DestructuringErrors;
  		    var initPos = this.start;
  		    var init = awaitAt > -1
  		      ? this.parseExprSubscripts(refDestructuringErrors, "await")
  		      : this.parseExpression(true, refDestructuringErrors);
  		    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
  		      if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
  		        if (this.type === types$1._in) { this.unexpected(awaitAt); }
  		        node.await = true;
  		      } else if (isForOf && this.options.ecmaVersion >= 8) {
  		        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
  		        else if (this.options.ecmaVersion >= 9) { node.await = false; }
  		      }
  		      if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
  		      this.toAssignable(init, false, refDestructuringErrors);
  		      this.checkLValPattern(init);
  		      return this.parseForIn(node, init)
  		    } else {
  		      this.checkExpressionErrors(refDestructuringErrors, true);
  		    }
  		    if (awaitAt > -1) { this.unexpected(awaitAt); }
  		    return this.parseFor(node, init)
  		  };

  		  // Helper method to parse for loop after variable initialization
  		  pp$8.parseForAfterInit = function(node, init, awaitAt) {
  		    if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init.declarations.length === 1) {
  		      if (this.options.ecmaVersion >= 9) {
  		        if (this.type === types$1._in) {
  		          if (awaitAt > -1) { this.unexpected(awaitAt); }
  		        } else { node.await = awaitAt > -1; }
  		      }
  		      return this.parseForIn(node, init)
  		    }
  		    if (awaitAt > -1) { this.unexpected(awaitAt); }
  		    return this.parseFor(node, init)
  		  };

  		  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  		    this.next();
  		    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
  		  };

  		  pp$8.parseIfStatement = function(node) {
  		    this.next();
  		    node.test = this.parseParenExpression();
  		    // allow function declarations in branches, but only in non-strict mode
  		    node.consequent = this.parseStatement("if");
  		    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  		    return this.finishNode(node, "IfStatement")
  		  };

  		  pp$8.parseReturnStatement = function(node) {
  		    if (!this.inFunction && !this.options.allowReturnOutsideFunction)
  		      { this.raise(this.start, "'return' outside of function"); }
  		    this.next();

  		    // In `return` (and `break`/`continue`), the keywords with
  		    // optional arguments, we eagerly look for a semicolon or the
  		    // possibility to insert one.

  		    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
  		    else { node.argument = this.parseExpression(); this.semicolon(); }
  		    return this.finishNode(node, "ReturnStatement")
  		  };

  		  pp$8.parseSwitchStatement = function(node) {
  		    this.next();
  		    node.discriminant = this.parseParenExpression();
  		    node.cases = [];
  		    this.expect(types$1.braceL);
  		    this.labels.push(switchLabel);
  		    this.enterScope(0);

  		    // Statements under must be grouped (by label) in SwitchCase
  		    // nodes. `cur` is used to keep the node that we are currently
  		    // adding statements to.

  		    var cur;
  		    for (var sawDefault = false; this.type !== types$1.braceR;) {
  		      if (this.type === types$1._case || this.type === types$1._default) {
  		        var isCase = this.type === types$1._case;
  		        if (cur) { this.finishNode(cur, "SwitchCase"); }
  		        node.cases.push(cur = this.startNode());
  		        cur.consequent = [];
  		        this.next();
  		        if (isCase) {
  		          cur.test = this.parseExpression();
  		        } else {
  		          if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
  		          sawDefault = true;
  		          cur.test = null;
  		        }
  		        this.expect(types$1.colon);
  		      } else {
  		        if (!cur) { this.unexpected(); }
  		        cur.consequent.push(this.parseStatement(null));
  		      }
  		    }
  		    this.exitScope();
  		    if (cur) { this.finishNode(cur, "SwitchCase"); }
  		    this.next(); // Closing brace
  		    this.labels.pop();
  		    return this.finishNode(node, "SwitchStatement")
  		  };

  		  pp$8.parseThrowStatement = function(node) {
  		    this.next();
  		    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
  		      { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  		    node.argument = this.parseExpression();
  		    this.semicolon();
  		    return this.finishNode(node, "ThrowStatement")
  		  };

  		  // Reused empty array added for node fields that are always empty.

  		  var empty$1 = [];

  		  pp$8.parseCatchClauseParam = function() {
  		    var param = this.parseBindingAtom();
  		    var simple = param.type === "Identifier";
  		    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  		    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  		    this.expect(types$1.parenR);

  		    return param
  		  };

  		  pp$8.parseTryStatement = function(node) {
  		    this.next();
  		    node.block = this.parseBlock();
  		    node.handler = null;
  		    if (this.type === types$1._catch) {
  		      var clause = this.startNode();
  		      this.next();
  		      if (this.eat(types$1.parenL)) {
  		        clause.param = this.parseCatchClauseParam();
  		      } else {
  		        if (this.options.ecmaVersion < 10) { this.unexpected(); }
  		        clause.param = null;
  		        this.enterScope(0);
  		      }
  		      clause.body = this.parseBlock(false);
  		      this.exitScope();
  		      node.handler = this.finishNode(clause, "CatchClause");
  		    }
  		    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  		    if (!node.handler && !node.finalizer)
  		      { this.raise(node.start, "Missing catch or finally clause"); }
  		    return this.finishNode(node, "TryStatement")
  		  };

  		  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  		    this.next();
  		    this.parseVar(node, false, kind, allowMissingInitializer);
  		    this.semicolon();
  		    return this.finishNode(node, "VariableDeclaration")
  		  };

  		  pp$8.parseWhileStatement = function(node) {
  		    this.next();
  		    node.test = this.parseParenExpression();
  		    this.labels.push(loopLabel);
  		    node.body = this.parseStatement("while");
  		    this.labels.pop();
  		    return this.finishNode(node, "WhileStatement")
  		  };

  		  pp$8.parseWithStatement = function(node) {
  		    if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  		    this.next();
  		    node.object = this.parseParenExpression();
  		    node.body = this.parseStatement("with");
  		    return this.finishNode(node, "WithStatement")
  		  };

  		  pp$8.parseEmptyStatement = function(node) {
  		    this.next();
  		    return this.finishNode(node, "EmptyStatement")
  		  };

  		  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  		    for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
  		      {
  		      var label = list[i$1];

  		      if (label.name === maybeName)
  		        { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  		    } }
  		    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  		    for (var i = this.labels.length - 1; i >= 0; i--) {
  		      var label$1 = this.labels[i];
  		      if (label$1.statementStart === node.start) {
  		        // Update information about previous labels on this node
  		        label$1.statementStart = this.start;
  		        label$1.kind = kind;
  		      } else { break }
  		    }
  		    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  		    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  		    this.labels.pop();
  		    node.label = expr;
  		    return this.finishNode(node, "LabeledStatement")
  		  };

  		  pp$8.parseExpressionStatement = function(node, expr) {
  		    node.expression = expr;
  		    this.semicolon();
  		    return this.finishNode(node, "ExpressionStatement")
  		  };

  		  // Parse a semicolon-enclosed block of statements, handling `"use
  		  // strict"` declarations when `allowStrict` is true (used for
  		  // function bodies).

  		  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  		    if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
  		    if ( node === void 0 ) node = this.startNode();

  		    node.body = [];
  		    this.expect(types$1.braceL);
  		    if (createNewLexicalScope) { this.enterScope(0); }
  		    while (this.type !== types$1.braceR) {
  		      var stmt = this.parseStatement(null);
  		      node.body.push(stmt);
  		    }
  		    if (exitStrict) { this.strict = false; }
  		    this.next();
  		    if (createNewLexicalScope) { this.exitScope(); }
  		    return this.finishNode(node, "BlockStatement")
  		  };

  		  // Parse a regular `for` loop. The disambiguation code in
  		  // `parseStatement` will already have parsed the init statement or
  		  // expression.

  		  pp$8.parseFor = function(node, init) {
  		    node.init = init;
  		    this.expect(types$1.semi);
  		    node.test = this.type === types$1.semi ? null : this.parseExpression();
  		    this.expect(types$1.semi);
  		    node.update = this.type === types$1.parenR ? null : this.parseExpression();
  		    this.expect(types$1.parenR);
  		    node.body = this.parseStatement("for");
  		    this.exitScope();
  		    this.labels.pop();
  		    return this.finishNode(node, "ForStatement")
  		  };

  		  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  		  // same from parser's perspective.

  		  pp$8.parseForIn = function(node, init) {
  		    var isForIn = this.type === types$1._in;
  		    this.next();

  		    if (
  		      init.type === "VariableDeclaration" &&
  		      init.declarations[0].init != null &&
  		      (
  		        !isForIn ||
  		        this.options.ecmaVersion < 8 ||
  		        this.strict ||
  		        init.kind !== "var" ||
  		        init.declarations[0].id.type !== "Identifier"
  		      )
  		    ) {
  		      this.raise(
  		        init.start,
  		        ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
  		      );
  		    }
  		    node.left = init;
  		    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  		    this.expect(types$1.parenR);
  		    node.body = this.parseStatement("for");
  		    this.exitScope();
  		    this.labels.pop();
  		    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
  		  };

  		  // Parse a list of variable declarations.

  		  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  		    node.declarations = [];
  		    node.kind = kind;
  		    for (;;) {
  		      var decl = this.startNode();
  		      this.parseVarId(decl, kind);
  		      if (this.eat(types$1.eq)) {
  		        decl.init = this.parseMaybeAssign(isFor);
  		      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
  		        this.unexpected();
  		      } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
  		        this.raise(this.lastTokEnd, ("Missing initializer in " + kind + " declaration"));
  		      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
  		        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
  		      } else {
  		        decl.init = null;
  		      }
  		      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
  		      if (!this.eat(types$1.comma)) { break }
  		    }
  		    return node
  		  };

  		  pp$8.parseVarId = function(decl, kind) {
  		    decl.id = kind === "using" || kind === "await using"
  		      ? this.parseIdent()
  		      : this.parseBindingAtom();

  		    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  		  };

  		  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

  		  // Parse a function declaration or literal (depending on the
  		  // `statement & FUNC_STATEMENT`).

  		  // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
  		  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  		    this.initFunction(node);
  		    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
  		      if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
  		        { this.unexpected(); }
  		      node.generator = this.eat(types$1.star);
  		    }
  		    if (this.options.ecmaVersion >= 8)
  		      { node.async = !!isAsync; }

  		    if (statement & FUNC_STATEMENT) {
  		      node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
  		      if (node.id && !(statement & FUNC_HANGING_STATEMENT))
  		        // If it is a regular function declaration in sloppy mode, then it is
  		        // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
  		        // mode depends on properties of the current scope (see
  		        // treatFunctionsAsVar).
  		        { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
  		    }

  		    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  		    this.yieldPos = 0;
  		    this.awaitPos = 0;
  		    this.awaitIdentPos = 0;
  		    this.enterScope(functionFlags(node.async, node.generator));

  		    if (!(statement & FUNC_STATEMENT))
  		      { node.id = this.type === types$1.name ? this.parseIdent() : null; }

  		    this.parseFunctionParams(node);
  		    this.parseFunctionBody(node, allowExpressionBody, false, forInit);

  		    this.yieldPos = oldYieldPos;
  		    this.awaitPos = oldAwaitPos;
  		    this.awaitIdentPos = oldAwaitIdentPos;
  		    return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
  		  };

  		  pp$8.parseFunctionParams = function(node) {
  		    this.expect(types$1.parenL);
  		    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  		    this.checkYieldAwaitInDefaultParams();
  		  };

  		  // Parse a class declaration or literal (depending on the
  		  // `isStatement` parameter).

  		  pp$8.parseClass = function(node, isStatement) {
  		    this.next();

  		    // ecma-262 14.6 Class Definitions
  		    // A class definition is always strict mode code.
  		    var oldStrict = this.strict;
  		    this.strict = true;

  		    this.parseClassId(node, isStatement);
  		    this.parseClassSuper(node);
  		    var privateNameMap = this.enterClassBody();
  		    var classBody = this.startNode();
  		    var hadConstructor = false;
  		    classBody.body = [];
  		    this.expect(types$1.braceL);
  		    while (this.type !== types$1.braceR) {
  		      var element = this.parseClassElement(node.superClass !== null);
  		      if (element) {
  		        classBody.body.push(element);
  		        if (element.type === "MethodDefinition" && element.kind === "constructor") {
  		          if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
  		          hadConstructor = true;
  		        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
  		          this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
  		        }
  		      }
  		    }
  		    this.strict = oldStrict;
  		    this.next();
  		    node.body = this.finishNode(classBody, "ClassBody");
  		    this.exitClassBody();
  		    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  		  };

  		  pp$8.parseClassElement = function(constructorAllowsSuper) {
  		    if (this.eat(types$1.semi)) { return null }

  		    var ecmaVersion = this.options.ecmaVersion;
  		    var node = this.startNode();
  		    var keyName = "";
  		    var isGenerator = false;
  		    var isAsync = false;
  		    var kind = "method";
  		    var isStatic = false;

  		    if (this.eatContextual("static")) {
  		      // Parse static init block
  		      if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
  		        this.parseClassStaticBlock(node);
  		        return node
  		      }
  		      if (this.isClassElementNameStart() || this.type === types$1.star) {
  		        isStatic = true;
  		      } else {
  		        keyName = "static";
  		      }
  		    }
  		    node.static = isStatic;
  		    if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
  		      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
  		        isAsync = true;
  		      } else {
  		        keyName = "async";
  		      }
  		    }
  		    if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
  		      isGenerator = true;
  		    }
  		    if (!keyName && !isAsync && !isGenerator) {
  		      var lastValue = this.value;
  		      if (this.eatContextual("get") || this.eatContextual("set")) {
  		        if (this.isClassElementNameStart()) {
  		          kind = lastValue;
  		        } else {
  		          keyName = lastValue;
  		        }
  		      }
  		    }

  		    // Parse element name
  		    if (keyName) {
  		      // 'async', 'get', 'set', or 'static' were not a keyword contextually.
  		      // The last token is any of those. Make it the element name.
  		      node.computed = false;
  		      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
  		      node.key.name = keyName;
  		      this.finishNode(node.key, "Identifier");
  		    } else {
  		      this.parseClassElementName(node);
  		    }

  		    // Parse element value
  		    if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
  		      var isConstructor = !node.static && checkKeyName(node, "constructor");
  		      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
  		      // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
  		      if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
  		      node.kind = isConstructor ? "constructor" : kind;
  		      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  		    } else {
  		      this.parseClassField(node);
  		    }

  		    return node
  		  };

  		  pp$8.isClassElementNameStart = function() {
  		    return (
  		      this.type === types$1.name ||
  		      this.type === types$1.privateId ||
  		      this.type === types$1.num ||
  		      this.type === types$1.string ||
  		      this.type === types$1.bracketL ||
  		      this.type.keyword
  		    )
  		  };

  		  pp$8.parseClassElementName = function(element) {
  		    if (this.type === types$1.privateId) {
  		      if (this.value === "constructor") {
  		        this.raise(this.start, "Classes can't have an element named '#constructor'");
  		      }
  		      element.computed = false;
  		      element.key = this.parsePrivateIdent();
  		    } else {
  		      this.parsePropertyName(element);
  		    }
  		  };

  		  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  		    // Check key and flags
  		    var key = method.key;
  		    if (method.kind === "constructor") {
  		      if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
  		      if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
  		    } else if (method.static && checkKeyName(method, "prototype")) {
  		      this.raise(key.start, "Classes may not have a static property named prototype");
  		    }

  		    // Parse value
  		    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

  		    // Check value
  		    if (method.kind === "get" && value.params.length !== 0)
  		      { this.raiseRecoverable(value.start, "getter should have no params"); }
  		    if (method.kind === "set" && value.params.length !== 1)
  		      { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
  		    if (method.kind === "set" && value.params[0].type === "RestElement")
  		      { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

  		    return this.finishNode(method, "MethodDefinition")
  		  };

  		  pp$8.parseClassField = function(field) {
  		    if (checkKeyName(field, "constructor")) {
  		      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  		    } else if (field.static && checkKeyName(field, "prototype")) {
  		      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  		    }

  		    if (this.eat(types$1.eq)) {
  		      // To raise SyntaxError if 'arguments' exists in the initializer.
  		      this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
  		      field.value = this.parseMaybeAssign();
  		      this.exitScope();
  		    } else {
  		      field.value = null;
  		    }
  		    this.semicolon();

  		    return this.finishNode(field, "PropertyDefinition")
  		  };

  		  pp$8.parseClassStaticBlock = function(node) {
  		    node.body = [];

  		    var oldLabels = this.labels;
  		    this.labels = [];
  		    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  		    while (this.type !== types$1.braceR) {
  		      var stmt = this.parseStatement(null);
  		      node.body.push(stmt);
  		    }
  		    this.next();
  		    this.exitScope();
  		    this.labels = oldLabels;

  		    return this.finishNode(node, "StaticBlock")
  		  };

  		  pp$8.parseClassId = function(node, isStatement) {
  		    if (this.type === types$1.name) {
  		      node.id = this.parseIdent();
  		      if (isStatement)
  		        { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
  		    } else {
  		      if (isStatement === true)
  		        { this.unexpected(); }
  		      node.id = null;
  		    }
  		  };

  		  pp$8.parseClassSuper = function(node) {
  		    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  		  };

  		  pp$8.enterClassBody = function() {
  		    var element = {declared: Object.create(null), used: []};
  		    this.privateNameStack.push(element);
  		    return element.declared
  		  };

  		  pp$8.exitClassBody = function() {
  		    var ref = this.privateNameStack.pop();
  		    var declared = ref.declared;
  		    var used = ref.used;
  		    if (!this.options.checkPrivateFields) { return }
  		    var len = this.privateNameStack.length;
  		    var parent = len === 0 ? null : this.privateNameStack[len - 1];
  		    for (var i = 0; i < used.length; ++i) {
  		      var id = used[i];
  		      if (!hasOwn(declared, id.name)) {
  		        if (parent) {
  		          parent.used.push(id);
  		        } else {
  		          this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
  		        }
  		      }
  		    }
  		  };

  		  function isPrivateNameConflicted(privateNameMap, element) {
  		    var name = element.key.name;
  		    var curr = privateNameMap[name];

  		    var next = "true";
  		    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
  		      next = (element.static ? "s" : "i") + element.kind;
  		    }

  		    // `class { get #a(){}; static set #a(_){} }` is also conflict.
  		    if (
  		      curr === "iget" && next === "iset" ||
  		      curr === "iset" && next === "iget" ||
  		      curr === "sget" && next === "sset" ||
  		      curr === "sset" && next === "sget"
  		    ) {
  		      privateNameMap[name] = "true";
  		      return false
  		    } else if (!curr) {
  		      privateNameMap[name] = next;
  		      return false
  		    } else {
  		      return true
  		    }
  		  }

  		  function checkKeyName(node, name) {
  		    var computed = node.computed;
  		    var key = node.key;
  		    return !computed && (
  		      key.type === "Identifier" && key.name === name ||
  		      key.type === "Literal" && key.value === name
  		    )
  		  }

  		  // Parses module export declaration.

  		  pp$8.parseExportAllDeclaration = function(node, exports) {
  		    if (this.options.ecmaVersion >= 11) {
  		      if (this.eatContextual("as")) {
  		        node.exported = this.parseModuleExportName();
  		        this.checkExport(exports, node.exported, this.lastTokStart);
  		      } else {
  		        node.exported = null;
  		      }
  		    }
  		    this.expectContextual("from");
  		    if (this.type !== types$1.string) { this.unexpected(); }
  		    node.source = this.parseExprAtom();
  		    if (this.options.ecmaVersion >= 16)
  		      { node.attributes = this.parseWithClause(); }
  		    this.semicolon();
  		    return this.finishNode(node, "ExportAllDeclaration")
  		  };

  		  pp$8.parseExport = function(node, exports) {
  		    this.next();
  		    // export * from '...'
  		    if (this.eat(types$1.star)) {
  		      return this.parseExportAllDeclaration(node, exports)
  		    }
  		    if (this.eat(types$1._default)) { // export default ...
  		      this.checkExport(exports, "default", this.lastTokStart);
  		      node.declaration = this.parseExportDefaultDeclaration();
  		      return this.finishNode(node, "ExportDefaultDeclaration")
  		    }
  		    // export var|const|let|function|class ...
  		    if (this.shouldParseExportStatement()) {
  		      node.declaration = this.parseExportDeclaration(node);
  		      if (node.declaration.type === "VariableDeclaration")
  		        { this.checkVariableExport(exports, node.declaration.declarations); }
  		      else
  		        { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
  		      node.specifiers = [];
  		      node.source = null;
  		      if (this.options.ecmaVersion >= 16)
  		        { node.attributes = []; }
  		    } else { // export { x, y as z } [from '...']
  		      node.declaration = null;
  		      node.specifiers = this.parseExportSpecifiers(exports);
  		      if (this.eatContextual("from")) {
  		        if (this.type !== types$1.string) { this.unexpected(); }
  		        node.source = this.parseExprAtom();
  		        if (this.options.ecmaVersion >= 16)
  		          { node.attributes = this.parseWithClause(); }
  		      } else {
  		        for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
  		          // check for keywords used as local names
  		          var spec = list[i];

  		          this.checkUnreserved(spec.local);
  		          // check if export is defined
  		          this.checkLocalExport(spec.local);

  		          if (spec.local.type === "Literal") {
  		            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
  		          }
  		        }

  		        node.source = null;
  		        if (this.options.ecmaVersion >= 16)
  		          { node.attributes = []; }
  		      }
  		      this.semicolon();
  		    }
  		    return this.finishNode(node, "ExportNamedDeclaration")
  		  };

  		  pp$8.parseExportDeclaration = function(node) {
  		    return this.parseStatement(null)
  		  };

  		  pp$8.parseExportDefaultDeclaration = function() {
  		    var isAsync;
  		    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
  		      var fNode = this.startNode();
  		      this.next();
  		      if (isAsync) { this.next(); }
  		      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
  		    } else if (this.type === types$1._class) {
  		      var cNode = this.startNode();
  		      return this.parseClass(cNode, "nullableID")
  		    } else {
  		      var declaration = this.parseMaybeAssign();
  		      this.semicolon();
  		      return declaration
  		    }
  		  };

  		  pp$8.checkExport = function(exports, name, pos) {
  		    if (!exports) { return }
  		    if (typeof name !== "string")
  		      { name = name.type === "Identifier" ? name.name : name.value; }
  		    if (hasOwn(exports, name))
  		      { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  		    exports[name] = true;
  		  };

  		  pp$8.checkPatternExport = function(exports, pat) {
  		    var type = pat.type;
  		    if (type === "Identifier")
  		      { this.checkExport(exports, pat, pat.start); }
  		    else if (type === "ObjectPattern")
  		      { for (var i = 0, list = pat.properties; i < list.length; i += 1)
  		        {
  		          var prop = list[i];

  		          this.checkPatternExport(exports, prop);
  		        } }
  		    else if (type === "ArrayPattern")
  		      { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
  		        var elt = list$1[i$1];

  		          if (elt) { this.checkPatternExport(exports, elt); }
  		      } }
  		    else if (type === "Property")
  		      { this.checkPatternExport(exports, pat.value); }
  		    else if (type === "AssignmentPattern")
  		      { this.checkPatternExport(exports, pat.left); }
  		    else if (type === "RestElement")
  		      { this.checkPatternExport(exports, pat.argument); }
  		  };

  		  pp$8.checkVariableExport = function(exports, decls) {
  		    if (!exports) { return }
  		    for (var i = 0, list = decls; i < list.length; i += 1)
  		      {
  		      var decl = list[i];

  		      this.checkPatternExport(exports, decl.id);
  		    }
  		  };

  		  pp$8.shouldParseExportStatement = function() {
  		    return this.type.keyword === "var" ||
  		      this.type.keyword === "const" ||
  		      this.type.keyword === "class" ||
  		      this.type.keyword === "function" ||
  		      this.isLet() ||
  		      this.isAsyncFunction()
  		  };

  		  // Parses a comma-separated list of module exports.

  		  pp$8.parseExportSpecifier = function(exports) {
  		    var node = this.startNode();
  		    node.local = this.parseModuleExportName();

  		    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  		    this.checkExport(
  		      exports,
  		      node.exported,
  		      node.exported.start
  		    );

  		    return this.finishNode(node, "ExportSpecifier")
  		  };

  		  pp$8.parseExportSpecifiers = function(exports) {
  		    var nodes = [], first = true;
  		    // export { x, y as z } [from '...']
  		    this.expect(types$1.braceL);
  		    while (!this.eat(types$1.braceR)) {
  		      if (!first) {
  		        this.expect(types$1.comma);
  		        if (this.afterTrailingComma(types$1.braceR)) { break }
  		      } else { first = false; }

  		      nodes.push(this.parseExportSpecifier(exports));
  		    }
  		    return nodes
  		  };

  		  // Parses import declaration.

  		  pp$8.parseImport = function(node) {
  		    this.next();

  		    // import '...'
  		    if (this.type === types$1.string) {
  		      node.specifiers = empty$1;
  		      node.source = this.parseExprAtom();
  		    } else {
  		      node.specifiers = this.parseImportSpecifiers();
  		      this.expectContextual("from");
  		      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  		    }
  		    if (this.options.ecmaVersion >= 16)
  		      { node.attributes = this.parseWithClause(); }
  		    this.semicolon();
  		    return this.finishNode(node, "ImportDeclaration")
  		  };

  		  // Parses a comma-separated list of module imports.

  		  pp$8.parseImportSpecifier = function() {
  		    var node = this.startNode();
  		    node.imported = this.parseModuleExportName();

  		    if (this.eatContextual("as")) {
  		      node.local = this.parseIdent();
  		    } else {
  		      this.checkUnreserved(node.imported);
  		      node.local = node.imported;
  		    }
  		    this.checkLValSimple(node.local, BIND_LEXICAL);

  		    return this.finishNode(node, "ImportSpecifier")
  		  };

  		  pp$8.parseImportDefaultSpecifier = function() {
  		    // import defaultObj, { x, y as z } from '...'
  		    var node = this.startNode();
  		    node.local = this.parseIdent();
  		    this.checkLValSimple(node.local, BIND_LEXICAL);
  		    return this.finishNode(node, "ImportDefaultSpecifier")
  		  };

  		  pp$8.parseImportNamespaceSpecifier = function() {
  		    var node = this.startNode();
  		    this.next();
  		    this.expectContextual("as");
  		    node.local = this.parseIdent();
  		    this.checkLValSimple(node.local, BIND_LEXICAL);
  		    return this.finishNode(node, "ImportNamespaceSpecifier")
  		  };

  		  pp$8.parseImportSpecifiers = function() {
  		    var nodes = [], first = true;
  		    if (this.type === types$1.name) {
  		      nodes.push(this.parseImportDefaultSpecifier());
  		      if (!this.eat(types$1.comma)) { return nodes }
  		    }
  		    if (this.type === types$1.star) {
  		      nodes.push(this.parseImportNamespaceSpecifier());
  		      return nodes
  		    }
  		    this.expect(types$1.braceL);
  		    while (!this.eat(types$1.braceR)) {
  		      if (!first) {
  		        this.expect(types$1.comma);
  		        if (this.afterTrailingComma(types$1.braceR)) { break }
  		      } else { first = false; }

  		      nodes.push(this.parseImportSpecifier());
  		    }
  		    return nodes
  		  };

  		  pp$8.parseWithClause = function() {
  		    var nodes = [];
  		    if (!this.eat(types$1._with)) {
  		      return nodes
  		    }
  		    this.expect(types$1.braceL);
  		    var attributeKeys = {};
  		    var first = true;
  		    while (!this.eat(types$1.braceR)) {
  		      if (!first) {
  		        this.expect(types$1.comma);
  		        if (this.afterTrailingComma(types$1.braceR)) { break }
  		      } else { first = false; }

  		      var attr = this.parseImportAttribute();
  		      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
  		      if (hasOwn(attributeKeys, keyName))
  		        { this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'"); }
  		      attributeKeys[keyName] = true;
  		      nodes.push(attr);
  		    }
  		    return nodes
  		  };

  		  pp$8.parseImportAttribute = function() {
  		    var node = this.startNode();
  		    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  		    this.expect(types$1.colon);
  		    if (this.type !== types$1.string) {
  		      this.unexpected();
  		    }
  		    node.value = this.parseExprAtom();
  		    return this.finishNode(node, "ImportAttribute")
  		  };

  		  pp$8.parseModuleExportName = function() {
  		    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
  		      var stringLiteral = this.parseLiteral(this.value);
  		      if (loneSurrogate.test(stringLiteral.value)) {
  		        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
  		      }
  		      return stringLiteral
  		    }
  		    return this.parseIdent(true)
  		  };

  		  // Set `ExpressionStatement#directive` property for directive prologues.
  		  pp$8.adaptDirectivePrologue = function(statements) {
  		    for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
  		      statements[i].directive = statements[i].expression.raw.slice(1, -1);
  		    }
  		  };
  		  pp$8.isDirectiveCandidate = function(statement) {
  		    return (
  		      this.options.ecmaVersion >= 5 &&
  		      statement.type === "ExpressionStatement" &&
  		      statement.expression.type === "Literal" &&
  		      typeof statement.expression.value === "string" &&
  		      // Reject parenthesized strings.
  		      (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  		    )
  		  };

  		  var pp$7 = Parser.prototype;

  		  // Convert existing expression atom to assignable pattern
  		  // if possible.

  		  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  		    if (this.options.ecmaVersion >= 6 && node) {
  		      switch (node.type) {
  		      case "Identifier":
  		        if (this.inAsync && node.name === "await")
  		          { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
  		        break

  		      case "ObjectPattern":
  		      case "ArrayPattern":
  		      case "AssignmentPattern":
  		      case "RestElement":
  		        break

  		      case "ObjectExpression":
  		        node.type = "ObjectPattern";
  		        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  		        for (var i = 0, list = node.properties; i < list.length; i += 1) {
  		          var prop = list[i];

  		        this.toAssignable(prop, isBinding);
  		          // Early error:
  		          //   AssignmentRestProperty[Yield, Await] :
  		          //     `...` DestructuringAssignmentTarget[Yield, Await]
  		          //
  		          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
  		          if (
  		            prop.type === "RestElement" &&
  		            (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
  		          ) {
  		            this.raise(prop.argument.start, "Unexpected token");
  		          }
  		        }
  		        break

  		      case "Property":
  		        // AssignmentProperty has type === "Property"
  		        if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
  		        this.toAssignable(node.value, isBinding);
  		        break

  		      case "ArrayExpression":
  		        node.type = "ArrayPattern";
  		        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  		        this.toAssignableList(node.elements, isBinding);
  		        break

  		      case "SpreadElement":
  		        node.type = "RestElement";
  		        this.toAssignable(node.argument, isBinding);
  		        if (node.argument.type === "AssignmentPattern")
  		          { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
  		        break

  		      case "AssignmentExpression":
  		        if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
  		        node.type = "AssignmentPattern";
  		        delete node.operator;
  		        this.toAssignable(node.left, isBinding);
  		        break

  		      case "ParenthesizedExpression":
  		        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
  		        break

  		      case "ChainExpression":
  		        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
  		        break

  		      case "MemberExpression":
  		        if (!isBinding) { break }

  		      default:
  		        this.raise(node.start, "Assigning to rvalue");
  		      }
  		    } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  		    return node
  		  };

  		  // Convert list of expression atoms to binding list.

  		  pp$7.toAssignableList = function(exprList, isBinding) {
  		    var end = exprList.length;
  		    for (var i = 0; i < end; i++) {
  		      var elt = exprList[i];
  		      if (elt) { this.toAssignable(elt, isBinding); }
  		    }
  		    if (end) {
  		      var last = exprList[end - 1];
  		      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
  		        { this.unexpected(last.argument.start); }
  		    }
  		    return exprList
  		  };

  		  // Parses spread element.

  		  pp$7.parseSpread = function(refDestructuringErrors) {
  		    var node = this.startNode();
  		    this.next();
  		    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  		    return this.finishNode(node, "SpreadElement")
  		  };

  		  pp$7.parseRestBinding = function() {
  		    var node = this.startNode();
  		    this.next();

  		    // RestElement inside of a function parameter must be an identifier
  		    if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
  		      { this.unexpected(); }

  		    node.argument = this.parseBindingAtom();

  		    return this.finishNode(node, "RestElement")
  		  };

  		  // Parses lvalue (assignable) atom.

  		  pp$7.parseBindingAtom = function() {
  		    if (this.options.ecmaVersion >= 6) {
  		      switch (this.type) {
  		      case types$1.bracketL:
  		        var node = this.startNode();
  		        this.next();
  		        node.elements = this.parseBindingList(types$1.bracketR, true, true);
  		        return this.finishNode(node, "ArrayPattern")

  		      case types$1.braceL:
  		        return this.parseObj(true)
  		      }
  		    }
  		    return this.parseIdent()
  		  };

  		  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  		    var elts = [], first = true;
  		    while (!this.eat(close)) {
  		      if (first) { first = false; }
  		      else { this.expect(types$1.comma); }
  		      if (allowEmpty && this.type === types$1.comma) {
  		        elts.push(null);
  		      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
  		        break
  		      } else if (this.type === types$1.ellipsis) {
  		        var rest = this.parseRestBinding();
  		        this.parseBindingListItem(rest);
  		        elts.push(rest);
  		        if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
  		        this.expect(close);
  		        break
  		      } else {
  		        elts.push(this.parseAssignableListItem(allowModifiers));
  		      }
  		    }
  		    return elts
  		  };

  		  pp$7.parseAssignableListItem = function(allowModifiers) {
  		    var elem = this.parseMaybeDefault(this.start, this.startLoc);
  		    this.parseBindingListItem(elem);
  		    return elem
  		  };

  		  pp$7.parseBindingListItem = function(param) {
  		    return param
  		  };

  		  // Parses assignment pattern around given atom if possible.

  		  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  		    left = left || this.parseBindingAtom();
  		    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
  		    var node = this.startNodeAt(startPos, startLoc);
  		    node.left = left;
  		    node.right = this.parseMaybeAssign();
  		    return this.finishNode(node, "AssignmentPattern")
  		  };

  		  // The following three functions all verify that a node is an lvalue —
  		  // something that can be bound, or assigned to. In order to do so, they perform
  		  // a variety of checks:
  		  //
  		  // - Check that none of the bound/assigned-to identifiers are reserved words.
  		  // - Record name declarations for bindings in the appropriate scope.
  		  // - Check duplicate argument names, if checkClashes is set.
  		  //
  		  // If a complex binding pattern is encountered (e.g., object and array
  		  // destructuring), the entire pattern is recursively checked.
  		  //
  		  // There are three versions of checkLVal*() appropriate for different
  		  // circumstances:
  		  //
  		  // - checkLValSimple() shall be used if the syntactic construct supports
  		  //   nothing other than identifiers and member expressions. Parenthesized
  		  //   expressions are also correctly handled. This is generally appropriate for
  		  //   constructs for which the spec says
  		  //
  		  //   > It is a Syntax Error if AssignmentTargetType of [the production] is not
  		  //   > simple.
  		  //
  		  //   It is also appropriate for checking if an identifier is valid and not
  		  //   defined elsewhere, like import declarations or function/class identifiers.
  		  //
  		  //   Examples where this is used include:
  		  //     a += …;
  		  //     import a from '…';
  		  //   where a is the node to be checked.
  		  //
  		  // - checkLValPattern() shall be used if the syntactic construct supports
  		  //   anything checkLValSimple() supports, as well as object and array
  		  //   destructuring patterns. This is generally appropriate for constructs for
  		  //   which the spec says
  		  //
  		  //   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
  		  //   > an ArrayLiteral and AssignmentTargetType of [the production] is not
  		  //   > simple.
  		  //
  		  //   Examples where this is used include:
  		  //     (a = …);
  		  //     const a = …;
  		  //     try { … } catch (a) { … }
  		  //   where a is the node to be checked.
  		  //
  		  // - checkLValInnerPattern() shall be used if the syntactic construct supports
  		  //   anything checkLValPattern() supports, as well as default assignment
  		  //   patterns, rest elements, and other constructs that may appear within an
  		  //   object or array destructuring pattern.
  		  //
  		  //   As a special case, function parameters also use checkLValInnerPattern(),
  		  //   as they also support defaults and rest constructs.
  		  //
  		  // These functions deliberately support both assignment and binding constructs,
  		  // as the logic for both is exceedingly similar. If the node is the target of
  		  // an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
  		  // should be set to the appropriate BIND_* constant, like BIND_VAR or
  		  // BIND_LEXICAL.
  		  //
  		  // If the function is called with a non-BIND_NONE bindingType, then
  		  // additionally a checkClashes object may be specified to allow checking for
  		  // duplicate argument names. checkClashes is ignored if the provided construct
  		  // is an assignment (i.e., bindingType is BIND_NONE).

  		  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  		    if ( bindingType === void 0 ) bindingType = BIND_NONE;

  		    var isBind = bindingType !== BIND_NONE;

  		    switch (expr.type) {
  		    case "Identifier":
  		      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
  		        { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
  		      if (isBind) {
  		        if (bindingType === BIND_LEXICAL && expr.name === "let")
  		          { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
  		        if (checkClashes) {
  		          if (hasOwn(checkClashes, expr.name))
  		            { this.raiseRecoverable(expr.start, "Argument name clash"); }
  		          checkClashes[expr.name] = true;
  		        }
  		        if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
  		      }
  		      break

  		    case "ChainExpression":
  		      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
  		      break

  		    case "MemberExpression":
  		      if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
  		      break

  		    case "ParenthesizedExpression":
  		      if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
  		      return this.checkLValSimple(expr.expression, bindingType, checkClashes)

  		    default:
  		      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  		    }
  		  };

  		  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  		    if ( bindingType === void 0 ) bindingType = BIND_NONE;

  		    switch (expr.type) {
  		    case "ObjectPattern":
  		      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
  		        var prop = list[i];

  		      this.checkLValInnerPattern(prop, bindingType, checkClashes);
  		      }
  		      break

  		    case "ArrayPattern":
  		      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
  		        var elem = list$1[i$1];

  		      if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
  		      }
  		      break

  		    default:
  		      this.checkLValSimple(expr, bindingType, checkClashes);
  		    }
  		  };

  		  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  		    if ( bindingType === void 0 ) bindingType = BIND_NONE;

  		    switch (expr.type) {
  		    case "Property":
  		      // AssignmentProperty has type === "Property"
  		      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
  		      break

  		    case "AssignmentPattern":
  		      this.checkLValPattern(expr.left, bindingType, checkClashes);
  		      break

  		    case "RestElement":
  		      this.checkLValPattern(expr.argument, bindingType, checkClashes);
  		      break

  		    default:
  		      this.checkLValPattern(expr, bindingType, checkClashes);
  		    }
  		  };

  		  // The algorithm used to determine whether a regexp can appear at a
  		  // given point in the program is loosely based on sweet.js' approach.
  		  // See https://github.com/mozilla/sweet.js/wiki/design


  		  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  		    this.token = token;
  		    this.isExpr = !!isExpr;
  		    this.preserveSpace = !!preserveSpace;
  		    this.override = override;
  		    this.generator = !!generator;
  		  };

  		  var types = {
  		    b_stat: new TokContext("{", false),
  		    b_expr: new TokContext("{", true),
  		    b_tmpl: new TokContext("${", false),
  		    p_stat: new TokContext("(", false),
  		    p_expr: new TokContext("(", true),
  		    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  		    f_stat: new TokContext("function", false),
  		    f_expr: new TokContext("function", true),
  		    f_expr_gen: new TokContext("function", true, false, null, true),
  		    f_gen: new TokContext("function", false, false, null, true)
  		  };

  		  var pp$6 = Parser.prototype;

  		  pp$6.initialContext = function() {
  		    return [types.b_stat]
  		  };

  		  pp$6.curContext = function() {
  		    return this.context[this.context.length - 1]
  		  };

  		  pp$6.braceIsBlock = function(prevType) {
  		    var parent = this.curContext();
  		    if (parent === types.f_expr || parent === types.f_stat)
  		      { return true }
  		    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
  		      { return !parent.isExpr }

  		    // The check for `tt.name && exprAllowed` detects whether we are
  		    // after a `yield` or `of` construct. See the `updateContext` for
  		    // `tt.name`.
  		    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
  		      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  		    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
  		      { return true }
  		    if (prevType === types$1.braceL)
  		      { return parent === types.b_stat }
  		    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
  		      { return false }
  		    return !this.exprAllowed
  		  };

  		  pp$6.inGeneratorContext = function() {
  		    for (var i = this.context.length - 1; i >= 1; i--) {
  		      var context = this.context[i];
  		      if (context.token === "function")
  		        { return context.generator }
  		    }
  		    return false
  		  };

  		  pp$6.updateContext = function(prevType) {
  		    var update, type = this.type;
  		    if (type.keyword && prevType === types$1.dot)
  		      { this.exprAllowed = false; }
  		    else if (update = type.updateContext)
  		      { update.call(this, prevType); }
  		    else
  		      { this.exprAllowed = type.beforeExpr; }
  		  };

  		  // Used to handle edge cases when token context could not be inferred correctly during tokenization phase

  		  pp$6.overrideContext = function(tokenCtx) {
  		    if (this.curContext() !== tokenCtx) {
  		      this.context[this.context.length - 1] = tokenCtx;
  		    }
  		  };

  		  // Token-specific context update code

  		  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  		    if (this.context.length === 1) {
  		      this.exprAllowed = true;
  		      return
  		    }
  		    var out = this.context.pop();
  		    if (out === types.b_stat && this.curContext().token === "function") {
  		      out = this.context.pop();
  		    }
  		    this.exprAllowed = !out.isExpr;
  		  };

  		  types$1.braceL.updateContext = function(prevType) {
  		    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  		    this.exprAllowed = true;
  		  };

  		  types$1.dollarBraceL.updateContext = function() {
  		    this.context.push(types.b_tmpl);
  		    this.exprAllowed = true;
  		  };

  		  types$1.parenL.updateContext = function(prevType) {
  		    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  		    this.context.push(statementParens ? types.p_stat : types.p_expr);
  		    this.exprAllowed = true;
  		  };

  		  types$1.incDec.updateContext = function() {
  		    // tokExprAllowed stays unchanged
  		  };

  		  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  		    if (prevType.beforeExpr && prevType !== types$1._else &&
  		        !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
  		        !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
  		        !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
  		      { this.context.push(types.f_expr); }
  		    else
  		      { this.context.push(types.f_stat); }
  		    this.exprAllowed = false;
  		  };

  		  types$1.colon.updateContext = function() {
  		    if (this.curContext().token === "function") { this.context.pop(); }
  		    this.exprAllowed = true;
  		  };

  		  types$1.backQuote.updateContext = function() {
  		    if (this.curContext() === types.q_tmpl)
  		      { this.context.pop(); }
  		    else
  		      { this.context.push(types.q_tmpl); }
  		    this.exprAllowed = false;
  		  };

  		  types$1.star.updateContext = function(prevType) {
  		    if (prevType === types$1._function) {
  		      var index = this.context.length - 1;
  		      if (this.context[index] === types.f_expr)
  		        { this.context[index] = types.f_expr_gen; }
  		      else
  		        { this.context[index] = types.f_gen; }
  		    }
  		    this.exprAllowed = true;
  		  };

  		  types$1.name.updateContext = function(prevType) {
  		    var allowed = false;
  		    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
  		      if (this.value === "of" && !this.exprAllowed ||
  		          this.value === "yield" && this.inGeneratorContext())
  		        { allowed = true; }
  		    }
  		    this.exprAllowed = allowed;
  		  };

  		  // A recursive descent parser operates by defining functions for all
  		  // syntactic elements, and recursively calling those, each function
  		  // advancing the input stream and returning an AST node. Precedence
  		  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  		  // instead of `(!x)[1]` is handled by the fact that the parser
  		  // function that parses unary prefix operators is called first, and
  		  // in turn calls the function that parses `[]` subscripts — that
  		  // way, it'll receive the node for `x[1]` already parsed, and wraps
  		  // *that* in the unary operator node.
  		  //
  		  // Acorn uses an [operator precedence parser][opp] to handle binary
  		  // operator precedence, because it is much more compact than using
  		  // the technique outlined above, which uses different, nesting
  		  // functions to specify precedence, for all of the ten binary
  		  // precedence levels that JavaScript defines.
  		  //
  		  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


  		  var pp$5 = Parser.prototype;

  		  // Check if property name clashes with already added.
  		  // Object/class getters and setters are not allowed to clash —
  		  // either with each other or with an init property — and in
  		  // strict mode, init properties are also not allowed to be repeated.

  		  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  		    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
  		      { return }
  		    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
  		      { return }
  		    var key = prop.key;
  		    var name;
  		    switch (key.type) {
  		    case "Identifier": name = key.name; break
  		    case "Literal": name = String(key.value); break
  		    default: return
  		    }
  		    var kind = prop.kind;
  		    if (this.options.ecmaVersion >= 6) {
  		      if (name === "__proto__" && kind === "init") {
  		        if (propHash.proto) {
  		          if (refDestructuringErrors) {
  		            if (refDestructuringErrors.doubleProto < 0) {
  		              refDestructuringErrors.doubleProto = key.start;
  		            }
  		          } else {
  		            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
  		          }
  		        }
  		        propHash.proto = true;
  		      }
  		      return
  		    }
  		    name = "$" + name;
  		    var other = propHash[name];
  		    if (other) {
  		      var redefinition;
  		      if (kind === "init") {
  		        redefinition = this.strict && other.init || other.get || other.set;
  		      } else {
  		        redefinition = other.init || other[kind];
  		      }
  		      if (redefinition)
  		        { this.raiseRecoverable(key.start, "Redefinition of property"); }
  		    } else {
  		      other = propHash[name] = {
  		        init: false,
  		        get: false,
  		        set: false
  		      };
  		    }
  		    other[kind] = true;
  		  };

  		  // ### Expression parsing

  		  // These nest, from the most general expression type at the top to
  		  // 'atomic', nondivisible expression types at the bottom. Most of
  		  // the functions will simply let the function(s) below them parse,
  		  // and, *if* the syntactic construct they handle is present, wrap
  		  // the AST node that the inner parser gave them in another node.

  		  // Parse a full expression. The optional arguments are used to
  		  // forbid the `in` operator (in for loops initalization expressions)
  		  // and provide reference for storing '=' operator inside shorthand
  		  // property assignment in contexts where both object expression
  		  // and object pattern might appear (so it's possible to raise
  		  // delayed syntax error at correct position).

  		  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  		    var startPos = this.start, startLoc = this.startLoc;
  		    var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
  		    if (this.type === types$1.comma) {
  		      var node = this.startNodeAt(startPos, startLoc);
  		      node.expressions = [expr];
  		      while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
  		      return this.finishNode(node, "SequenceExpression")
  		    }
  		    return expr
  		  };

  		  // Parse an assignment expression. This includes applications of
  		  // operators like `+=`.

  		  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  		    if (this.isContextual("yield")) {
  		      if (this.inGenerator) { return this.parseYield(forInit) }
  		      // The tokenizer will assume an expression is allowed after
  		      // `yield`, but this isn't that kind of yield
  		      else { this.exprAllowed = false; }
  		    }

  		    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  		    if (refDestructuringErrors) {
  		      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
  		      oldTrailingComma = refDestructuringErrors.trailingComma;
  		      oldDoubleProto = refDestructuringErrors.doubleProto;
  		      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  		    } else {
  		      refDestructuringErrors = new DestructuringErrors;
  		      ownDestructuringErrors = true;
  		    }

  		    var startPos = this.start, startLoc = this.startLoc;
  		    if (this.type === types$1.parenL || this.type === types$1.name) {
  		      this.potentialArrowAt = this.start;
  		      this.potentialArrowInForAwait = forInit === "await";
  		    }
  		    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  		    if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  		    if (this.type.isAssign) {
  		      var node = this.startNodeAt(startPos, startLoc);
  		      node.operator = this.value;
  		      if (this.type === types$1.eq)
  		        { left = this.toAssignable(left, false, refDestructuringErrors); }
  		      if (!ownDestructuringErrors) {
  		        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
  		      }
  		      if (refDestructuringErrors.shorthandAssign >= left.start)
  		        { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
  		      if (this.type === types$1.eq)
  		        { this.checkLValPattern(left); }
  		      else
  		        { this.checkLValSimple(left); }
  		      node.left = left;
  		      this.next();
  		      node.right = this.parseMaybeAssign(forInit);
  		      if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
  		      return this.finishNode(node, "AssignmentExpression")
  		    } else {
  		      if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  		    }
  		    if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  		    if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  		    return left
  		  };

  		  // Parse a ternary conditional (`?:`) operator.

  		  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  		    var startPos = this.start, startLoc = this.startLoc;
  		    var expr = this.parseExprOps(forInit, refDestructuringErrors);
  		    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  		    if (this.eat(types$1.question)) {
  		      var node = this.startNodeAt(startPos, startLoc);
  		      node.test = expr;
  		      node.consequent = this.parseMaybeAssign();
  		      this.expect(types$1.colon);
  		      node.alternate = this.parseMaybeAssign(forInit);
  		      return this.finishNode(node, "ConditionalExpression")
  		    }
  		    return expr
  		  };

  		  // Start the precedence parser.

  		  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  		    var startPos = this.start, startLoc = this.startLoc;
  		    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  		    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  		    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
  		  };

  		  // Parse binary operators with the operator precedence parsing
  		  // algorithm. `left` is the left-hand side of the operator.
  		  // `minPrec` provides context that allows the function to stop and
  		  // defer further parser to one of its callers when it encounters an
  		  // operator that has a lower precedence than the set it is parsing.

  		  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  		    var prec = this.type.binop;
  		    if (prec != null && (!forInit || this.type !== types$1._in)) {
  		      if (prec > minPrec) {
  		        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
  		        var coalesce = this.type === types$1.coalesce;
  		        if (coalesce) {
  		          // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
  		          // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
  		          prec = types$1.logicalAND.binop;
  		        }
  		        var op = this.value;
  		        this.next();
  		        var startPos = this.start, startLoc = this.startLoc;
  		        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
  		        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
  		        if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
  		          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
  		        }
  		        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
  		      }
  		    }
  		    return left
  		  };

  		  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  		    if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
  		    var node = this.startNodeAt(startPos, startLoc);
  		    node.left = left;
  		    node.operator = op;
  		    node.right = right;
  		    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  		  };

  		  // Parse unary operators, both prefix and postfix.

  		  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  		    var startPos = this.start, startLoc = this.startLoc, expr;
  		    if (this.isContextual("await") && this.canAwait) {
  		      expr = this.parseAwait(forInit);
  		      sawUnary = true;
  		    } else if (this.type.prefix) {
  		      var node = this.startNode(), update = this.type === types$1.incDec;
  		      node.operator = this.value;
  		      node.prefix = true;
  		      this.next();
  		      node.argument = this.parseMaybeUnary(null, true, update, forInit);
  		      this.checkExpressionErrors(refDestructuringErrors, true);
  		      if (update) { this.checkLValSimple(node.argument); }
  		      else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
  		        { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
  		      else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
  		        { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
  		      else { sawUnary = true; }
  		      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  		    } else if (!sawUnary && this.type === types$1.privateId) {
  		      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
  		      expr = this.parsePrivateIdent();
  		      // only could be private fields in 'in', such as #x in obj
  		      if (this.type !== types$1._in) { this.unexpected(); }
  		    } else {
  		      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
  		      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  		      while (this.type.postfix && !this.canInsertSemicolon()) {
  		        var node$1 = this.startNodeAt(startPos, startLoc);
  		        node$1.operator = this.value;
  		        node$1.prefix = false;
  		        node$1.argument = expr;
  		        this.checkLValSimple(expr);
  		        this.next();
  		        expr = this.finishNode(node$1, "UpdateExpression");
  		      }
  		    }

  		    if (!incDec && this.eat(types$1.starstar)) {
  		      if (sawUnary)
  		        { this.unexpected(this.lastTokStart); }
  		      else
  		        { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
  		    } else {
  		      return expr
  		    }
  		  };

  		  function isLocalVariableAccess(node) {
  		    return (
  		      node.type === "Identifier" ||
  		      node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
  		    )
  		  }

  		  function isPrivateFieldAccess(node) {
  		    return (
  		      node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
  		      node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
  		      node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
  		    )
  		  }

  		  // Parse call, dot, and `[]`-subscript expressions.

  		  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  		    var startPos = this.start, startLoc = this.startLoc;
  		    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  		    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
  		      { return expr }
  		    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  		    if (refDestructuringErrors && result.type === "MemberExpression") {
  		      if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
  		      if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
  		      if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
  		    }
  		    return result
  		  };

  		  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  		    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
  		        this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
  		        this.potentialArrowAt === base.start;
  		    var optionalChained = false;

  		    while (true) {
  		      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

  		      if (element.optional) { optionalChained = true; }
  		      if (element === base || element.type === "ArrowFunctionExpression") {
  		        if (optionalChained) {
  		          var chainNode = this.startNodeAt(startPos, startLoc);
  		          chainNode.expression = element;
  		          element = this.finishNode(chainNode, "ChainExpression");
  		        }
  		        return element
  		      }

  		      base = element;
  		    }
  		  };

  		  pp$5.shouldParseAsyncArrow = function() {
  		    return !this.canInsertSemicolon() && this.eat(types$1.arrow)
  		  };

  		  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  		    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
  		  };

  		  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  		    var optionalSupported = this.options.ecmaVersion >= 11;
  		    var optional = optionalSupported && this.eat(types$1.questionDot);
  		    if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

  		    var computed = this.eat(types$1.bracketL);
  		    if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
  		      var node = this.startNodeAt(startPos, startLoc);
  		      node.object = base;
  		      if (computed) {
  		        node.property = this.parseExpression();
  		        this.expect(types$1.bracketR);
  		      } else if (this.type === types$1.privateId && base.type !== "Super") {
  		        node.property = this.parsePrivateIdent();
  		      } else {
  		        node.property = this.parseIdent(this.options.allowReserved !== "never");
  		      }
  		      node.computed = !!computed;
  		      if (optionalSupported) {
  		        node.optional = optional;
  		      }
  		      base = this.finishNode(node, "MemberExpression");
  		    } else if (!noCalls && this.eat(types$1.parenL)) {
  		      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  		      this.yieldPos = 0;
  		      this.awaitPos = 0;
  		      this.awaitIdentPos = 0;
  		      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
  		      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
  		        this.checkPatternErrors(refDestructuringErrors, false);
  		        this.checkYieldAwaitInDefaultParams();
  		        if (this.awaitIdentPos > 0)
  		          { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
  		        this.yieldPos = oldYieldPos;
  		        this.awaitPos = oldAwaitPos;
  		        this.awaitIdentPos = oldAwaitIdentPos;
  		        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
  		      }
  		      this.checkExpressionErrors(refDestructuringErrors, true);
  		      this.yieldPos = oldYieldPos || this.yieldPos;
  		      this.awaitPos = oldAwaitPos || this.awaitPos;
  		      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
  		      var node$1 = this.startNodeAt(startPos, startLoc);
  		      node$1.callee = base;
  		      node$1.arguments = exprList;
  		      if (optionalSupported) {
  		        node$1.optional = optional;
  		      }
  		      base = this.finishNode(node$1, "CallExpression");
  		    } else if (this.type === types$1.backQuote) {
  		      if (optional || optionalChained) {
  		        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
  		      }
  		      var node$2 = this.startNodeAt(startPos, startLoc);
  		      node$2.tag = base;
  		      node$2.quasi = this.parseTemplate({isTagged: true});
  		      base = this.finishNode(node$2, "TaggedTemplateExpression");
  		    }
  		    return base
  		  };

  		  // Parse an atomic expression — either a single token that is an
  		  // expression, an expression started by a keyword like `function` or
  		  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  		  // or `{}`.

  		  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  		    // If a division operator appears in an expression position, the
  		    // tokenizer got confused, and we force it to read a regexp instead.
  		    if (this.type === types$1.slash) { this.readRegexp(); }

  		    var node, canBeArrow = this.potentialArrowAt === this.start;
  		    switch (this.type) {
  		    case types$1._super:
  		      if (!this.allowSuper)
  		        { this.raise(this.start, "'super' keyword outside a method"); }
  		      node = this.startNode();
  		      this.next();
  		      if (this.type === types$1.parenL && !this.allowDirectSuper)
  		        { this.raise(node.start, "super() call outside constructor of a subclass"); }
  		      // The `super` keyword can appear at below:
  		      // SuperProperty:
  		      //     super [ Expression ]
  		      //     super . IdentifierName
  		      // SuperCall:
  		      //     super ( Arguments )
  		      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
  		        { this.unexpected(); }
  		      return this.finishNode(node, "Super")

  		    case types$1._this:
  		      node = this.startNode();
  		      this.next();
  		      return this.finishNode(node, "ThisExpression")

  		    case types$1.name:
  		      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
  		      var id = this.parseIdent(false);
  		      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
  		        this.overrideContext(types.f_expr);
  		        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
  		      }
  		      if (canBeArrow && !this.canInsertSemicolon()) {
  		        if (this.eat(types$1.arrow))
  		          { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
  		        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
  		            (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
  		          id = this.parseIdent(false);
  		          if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
  		            { this.unexpected(); }
  		          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
  		        }
  		      }
  		      return id

  		    case types$1.regexp:
  		      var value = this.value;
  		      node = this.parseLiteral(value.value);
  		      node.regex = {pattern: value.pattern, flags: value.flags};
  		      return node

  		    case types$1.num: case types$1.string:
  		      return this.parseLiteral(this.value)

  		    case types$1._null: case types$1._true: case types$1._false:
  		      node = this.startNode();
  		      node.value = this.type === types$1._null ? null : this.type === types$1._true;
  		      node.raw = this.type.keyword;
  		      this.next();
  		      return this.finishNode(node, "Literal")

  		    case types$1.parenL:
  		      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
  		      if (refDestructuringErrors) {
  		        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
  		          { refDestructuringErrors.parenthesizedAssign = start; }
  		        if (refDestructuringErrors.parenthesizedBind < 0)
  		          { refDestructuringErrors.parenthesizedBind = start; }
  		      }
  		      return expr

  		    case types$1.bracketL:
  		      node = this.startNode();
  		      this.next();
  		      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
  		      return this.finishNode(node, "ArrayExpression")

  		    case types$1.braceL:
  		      this.overrideContext(types.b_expr);
  		      return this.parseObj(false, refDestructuringErrors)

  		    case types$1._function:
  		      node = this.startNode();
  		      this.next();
  		      return this.parseFunction(node, 0)

  		    case types$1._class:
  		      return this.parseClass(this.startNode(), false)

  		    case types$1._new:
  		      return this.parseNew()

  		    case types$1.backQuote:
  		      return this.parseTemplate()

  		    case types$1._import:
  		      if (this.options.ecmaVersion >= 11) {
  		        return this.parseExprImport(forNew)
  		      } else {
  		        return this.unexpected()
  		      }

  		    default:
  		      return this.parseExprAtomDefault()
  		    }
  		  };

  		  pp$5.parseExprAtomDefault = function() {
  		    this.unexpected();
  		  };

  		  pp$5.parseExprImport = function(forNew) {
  		    var node = this.startNode();

  		    // Consume `import` as an identifier for `import.meta`.
  		    // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
  		    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
  		    this.next();

  		    if (this.type === types$1.parenL && !forNew) {
  		      return this.parseDynamicImport(node)
  		    } else if (this.type === types$1.dot) {
  		      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
  		      meta.name = "import";
  		      node.meta = this.finishNode(meta, "Identifier");
  		      return this.parseImportMeta(node)
  		    } else {
  		      this.unexpected();
  		    }
  		  };

  		  pp$5.parseDynamicImport = function(node) {
  		    this.next(); // skip `(`

  		    // Parse node.source.
  		    node.source = this.parseMaybeAssign();

  		    if (this.options.ecmaVersion >= 16) {
  		      if (!this.eat(types$1.parenR)) {
  		        this.expect(types$1.comma);
  		        if (!this.afterTrailingComma(types$1.parenR)) {
  		          node.options = this.parseMaybeAssign();
  		          if (!this.eat(types$1.parenR)) {
  		            this.expect(types$1.comma);
  		            if (!this.afterTrailingComma(types$1.parenR)) {
  		              this.unexpected();
  		            }
  		          }
  		        } else {
  		          node.options = null;
  		        }
  		      } else {
  		        node.options = null;
  		      }
  		    } else {
  		      // Verify ending.
  		      if (!this.eat(types$1.parenR)) {
  		        var errorPos = this.start;
  		        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
  		          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
  		        } else {
  		          this.unexpected(errorPos);
  		        }
  		      }
  		    }

  		    return this.finishNode(node, "ImportExpression")
  		  };

  		  pp$5.parseImportMeta = function(node) {
  		    this.next(); // skip `.`

  		    var containsEsc = this.containsEsc;
  		    node.property = this.parseIdent(true);

  		    if (node.property.name !== "meta")
  		      { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
  		    if (containsEsc)
  		      { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
  		    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
  		      { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

  		    return this.finishNode(node, "MetaProperty")
  		  };

  		  pp$5.parseLiteral = function(value) {
  		    var node = this.startNode();
  		    node.value = value;
  		    node.raw = this.input.slice(this.start, this.end);
  		    if (node.raw.charCodeAt(node.raw.length - 1) === 110)
  		      { node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, ""); }
  		    this.next();
  		    return this.finishNode(node, "Literal")
  		  };

  		  pp$5.parseParenExpression = function() {
  		    this.expect(types$1.parenL);
  		    var val = this.parseExpression();
  		    this.expect(types$1.parenR);
  		    return val
  		  };

  		  pp$5.shouldParseArrow = function(exprList) {
  		    return !this.canInsertSemicolon()
  		  };

  		  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  		    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  		    if (this.options.ecmaVersion >= 6) {
  		      this.next();

  		      var innerStartPos = this.start, innerStartLoc = this.startLoc;
  		      var exprList = [], first = true, lastIsComma = false;
  		      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
  		      this.yieldPos = 0;
  		      this.awaitPos = 0;
  		      // Do not save awaitIdentPos to allow checking awaits nested in parameters
  		      while (this.type !== types$1.parenR) {
  		        first ? first = false : this.expect(types$1.comma);
  		        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
  		          lastIsComma = true;
  		          break
  		        } else if (this.type === types$1.ellipsis) {
  		          spreadStart = this.start;
  		          exprList.push(this.parseParenItem(this.parseRestBinding()));
  		          if (this.type === types$1.comma) {
  		            this.raiseRecoverable(
  		              this.start,
  		              "Comma is not permitted after the rest element"
  		            );
  		          }
  		          break
  		        } else {
  		          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
  		        }
  		      }
  		      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
  		      this.expect(types$1.parenR);

  		      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
  		        this.checkPatternErrors(refDestructuringErrors, false);
  		        this.checkYieldAwaitInDefaultParams();
  		        this.yieldPos = oldYieldPos;
  		        this.awaitPos = oldAwaitPos;
  		        return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
  		      }

  		      if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
  		      if (spreadStart) { this.unexpected(spreadStart); }
  		      this.checkExpressionErrors(refDestructuringErrors, true);
  		      this.yieldPos = oldYieldPos || this.yieldPos;
  		      this.awaitPos = oldAwaitPos || this.awaitPos;

  		      if (exprList.length > 1) {
  		        val = this.startNodeAt(innerStartPos, innerStartLoc);
  		        val.expressions = exprList;
  		        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
  		      } else {
  		        val = exprList[0];
  		      }
  		    } else {
  		      val = this.parseParenExpression();
  		    }

  		    if (this.options.preserveParens) {
  		      var par = this.startNodeAt(startPos, startLoc);
  		      par.expression = val;
  		      return this.finishNode(par, "ParenthesizedExpression")
  		    } else {
  		      return val
  		    }
  		  };

  		  pp$5.parseParenItem = function(item) {
  		    return item
  		  };

  		  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  		    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
  		  };

  		  // New's precedence is slightly tricky. It must allow its argument to
  		  // be a `[]` or dot subscript expression, but not a call — at least,
  		  // not without wrapping it in parentheses. Thus, it uses the noCalls
  		  // argument to parseSubscripts to prevent it from consuming the
  		  // argument list.

  		  var empty = [];

  		  pp$5.parseNew = function() {
  		    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
  		    var node = this.startNode();
  		    this.next();
  		    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
  		      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
  		      meta.name = "new";
  		      node.meta = this.finishNode(meta, "Identifier");
  		      this.next();
  		      var containsEsc = this.containsEsc;
  		      node.property = this.parseIdent(true);
  		      if (node.property.name !== "target")
  		        { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
  		      if (containsEsc)
  		        { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
  		      if (!this.allowNewDotTarget)
  		        { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
  		      return this.finishNode(node, "MetaProperty")
  		    }
  		    var startPos = this.start, startLoc = this.startLoc;
  		    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  		    if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
  		    else { node.arguments = empty; }
  		    return this.finishNode(node, "NewExpression")
  		  };

  		  // Parse template expression.

  		  pp$5.parseTemplateElement = function(ref) {
  		    var isTagged = ref.isTagged;

  		    var elem = this.startNode();
  		    if (this.type === types$1.invalidTemplate) {
  		      if (!isTagged) {
  		        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
  		      }
  		      elem.value = {
  		        raw: this.value.replace(/\r\n?/g, "\n"),
  		        cooked: null
  		      };
  		    } else {
  		      elem.value = {
  		        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
  		        cooked: this.value
  		      };
  		    }
  		    this.next();
  		    elem.tail = this.type === types$1.backQuote;
  		    return this.finishNode(elem, "TemplateElement")
  		  };

  		  pp$5.parseTemplate = function(ref) {
  		    if ( ref === void 0 ) ref = {};
  		    var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  		    var node = this.startNode();
  		    this.next();
  		    node.expressions = [];
  		    var curElt = this.parseTemplateElement({isTagged: isTagged});
  		    node.quasis = [curElt];
  		    while (!curElt.tail) {
  		      if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
  		      this.expect(types$1.dollarBraceL);
  		      node.expressions.push(this.parseExpression());
  		      this.expect(types$1.braceR);
  		      node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
  		    }
  		    this.next();
  		    return this.finishNode(node, "TemplateLiteral")
  		  };

  		  pp$5.isAsyncProp = function(prop) {
  		    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
  		      (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
  		      !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  		  };

  		  // Parse an object literal or binding pattern.

  		  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  		    var node = this.startNode(), first = true, propHash = {};
  		    node.properties = [];
  		    this.next();
  		    while (!this.eat(types$1.braceR)) {
  		      if (!first) {
  		        this.expect(types$1.comma);
  		        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
  		      } else { first = false; }

  		      var prop = this.parseProperty(isPattern, refDestructuringErrors);
  		      if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
  		      node.properties.push(prop);
  		    }
  		    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  		  };

  		  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  		    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  		    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
  		      if (isPattern) {
  		        prop.argument = this.parseIdent(false);
  		        if (this.type === types$1.comma) {
  		          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
  		        }
  		        return this.finishNode(prop, "RestElement")
  		      }
  		      // Parse argument.
  		      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  		      // To disallow trailing comma via `this.toAssignable()`.
  		      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
  		        refDestructuringErrors.trailingComma = this.start;
  		      }
  		      // Finish
  		      return this.finishNode(prop, "SpreadElement")
  		    }
  		    if (this.options.ecmaVersion >= 6) {
  		      prop.method = false;
  		      prop.shorthand = false;
  		      if (isPattern || refDestructuringErrors) {
  		        startPos = this.start;
  		        startLoc = this.startLoc;
  		      }
  		      if (!isPattern)
  		        { isGenerator = this.eat(types$1.star); }
  		    }
  		    var containsEsc = this.containsEsc;
  		    this.parsePropertyName(prop);
  		    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
  		      isAsync = true;
  		      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
  		      this.parsePropertyName(prop);
  		    } else {
  		      isAsync = false;
  		    }
  		    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  		    return this.finishNode(prop, "Property")
  		  };

  		  pp$5.parseGetterSetter = function(prop) {
  		    var kind = prop.key.name;
  		    this.parsePropertyName(prop);
  		    prop.value = this.parseMethod(false);
  		    prop.kind = kind;
  		    var paramCount = prop.kind === "get" ? 0 : 1;
  		    if (prop.value.params.length !== paramCount) {
  		      var start = prop.value.start;
  		      if (prop.kind === "get")
  		        { this.raiseRecoverable(start, "getter should have no params"); }
  		      else
  		        { this.raiseRecoverable(start, "setter should have exactly one param"); }
  		    } else {
  		      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
  		        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
  		    }
  		  };

  		  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  		    if ((isGenerator || isAsync) && this.type === types$1.colon)
  		      { this.unexpected(); }

  		    if (this.eat(types$1.colon)) {
  		      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
  		      prop.kind = "init";
  		    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
  		      if (isPattern) { this.unexpected(); }
  		      prop.method = true;
  		      prop.value = this.parseMethod(isGenerator, isAsync);
  		      prop.kind = "init";
  		    } else if (!isPattern && !containsEsc &&
  		               this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
  		               (prop.key.name === "get" || prop.key.name === "set") &&
  		               (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
  		      if (isGenerator || isAsync) { this.unexpected(); }
  		      this.parseGetterSetter(prop);
  		    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
  		      if (isGenerator || isAsync) { this.unexpected(); }
  		      this.checkUnreserved(prop.key);
  		      if (prop.key.name === "await" && !this.awaitIdentPos)
  		        { this.awaitIdentPos = startPos; }
  		      if (isPattern) {
  		        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
  		      } else if (this.type === types$1.eq && refDestructuringErrors) {
  		        if (refDestructuringErrors.shorthandAssign < 0)
  		          { refDestructuringErrors.shorthandAssign = this.start; }
  		        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
  		      } else {
  		        prop.value = this.copyNode(prop.key);
  		      }
  		      prop.kind = "init";
  		      prop.shorthand = true;
  		    } else { this.unexpected(); }
  		  };

  		  pp$5.parsePropertyName = function(prop) {
  		    if (this.options.ecmaVersion >= 6) {
  		      if (this.eat(types$1.bracketL)) {
  		        prop.computed = true;
  		        prop.key = this.parseMaybeAssign();
  		        this.expect(types$1.bracketR);
  		        return prop.key
  		      } else {
  		        prop.computed = false;
  		      }
  		    }
  		    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
  		  };

  		  // Initialize empty function node.

  		  pp$5.initFunction = function(node) {
  		    node.id = null;
  		    if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
  		    if (this.options.ecmaVersion >= 8) { node.async = false; }
  		  };

  		  // Parse object or class method.

  		  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  		    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  		    this.initFunction(node);
  		    if (this.options.ecmaVersion >= 6)
  		      { node.generator = isGenerator; }
  		    if (this.options.ecmaVersion >= 8)
  		      { node.async = !!isAsync; }

  		    this.yieldPos = 0;
  		    this.awaitPos = 0;
  		    this.awaitIdentPos = 0;
  		    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

  		    this.expect(types$1.parenL);
  		    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  		    this.checkYieldAwaitInDefaultParams();
  		    this.parseFunctionBody(node, false, true, false);

  		    this.yieldPos = oldYieldPos;
  		    this.awaitPos = oldAwaitPos;
  		    this.awaitIdentPos = oldAwaitIdentPos;
  		    return this.finishNode(node, "FunctionExpression")
  		  };

  		  // Parse arrow function expression with given parameters.

  		  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  		    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  		    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  		    this.initFunction(node);
  		    if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

  		    this.yieldPos = 0;
  		    this.awaitPos = 0;
  		    this.awaitIdentPos = 0;

  		    node.params = this.toAssignableList(params, true);
  		    this.parseFunctionBody(node, true, false, forInit);

  		    this.yieldPos = oldYieldPos;
  		    this.awaitPos = oldAwaitPos;
  		    this.awaitIdentPos = oldAwaitIdentPos;
  		    return this.finishNode(node, "ArrowFunctionExpression")
  		  };

  		  // Parse function body and check parameters.

  		  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  		    var isExpression = isArrowFunction && this.type !== types$1.braceL;
  		    var oldStrict = this.strict, useStrict = false;

  		    if (isExpression) {
  		      node.body = this.parseMaybeAssign(forInit);
  		      node.expression = true;
  		      this.checkParams(node, false);
  		    } else {
  		      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
  		      if (!oldStrict || nonSimple) {
  		        useStrict = this.strictDirective(this.end);
  		        // If this is a strict mode function, verify that argument names
  		        // are not repeated, and it does not try to bind the words `eval`
  		        // or `arguments`.
  		        if (useStrict && nonSimple)
  		          { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
  		      }
  		      // Start a new scope with regard to labels and the `inFunction`
  		      // flag (restore them to their old value afterwards).
  		      var oldLabels = this.labels;
  		      this.labels = [];
  		      if (useStrict) { this.strict = true; }

  		      // Add the params to varDeclaredNames to ensure that an error is thrown
  		      // if a let/const declaration in the function clashes with one of the params.
  		      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
  		      // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
  		      if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
  		      node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
  		      node.expression = false;
  		      this.adaptDirectivePrologue(node.body.body);
  		      this.labels = oldLabels;
  		    }
  		    this.exitScope();
  		  };

  		  pp$5.isSimpleParamList = function(params) {
  		    for (var i = 0, list = params; i < list.length; i += 1)
  		      {
  		      var param = list[i];

  		      if (param.type !== "Identifier") { return false
  		    } }
  		    return true
  		  };

  		  // Checks function params for various disallowed patterns such as using "eval"
  		  // or "arguments" and duplicate parameters.

  		  pp$5.checkParams = function(node, allowDuplicates) {
  		    var nameHash = Object.create(null);
  		    for (var i = 0, list = node.params; i < list.length; i += 1)
  		      {
  		      var param = list[i];

  		      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  		    }
  		  };

  		  // Parses a comma-separated list of expressions, and returns them as
  		  // an array. `close` is the token type that ends the list, and
  		  // `allowEmpty` can be turned on to allow subsequent commas with
  		  // nothing in between them to be parsed as `null` (which is needed
  		  // for array literals).

  		  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  		    var elts = [], first = true;
  		    while (!this.eat(close)) {
  		      if (!first) {
  		        this.expect(types$1.comma);
  		        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
  		      } else { first = false; }

  		      var elt = (void 0);
  		      if (allowEmpty && this.type === types$1.comma)
  		        { elt = null; }
  		      else if (this.type === types$1.ellipsis) {
  		        elt = this.parseSpread(refDestructuringErrors);
  		        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
  		          { refDestructuringErrors.trailingComma = this.start; }
  		      } else {
  		        elt = this.parseMaybeAssign(false, refDestructuringErrors);
  		      }
  		      elts.push(elt);
  		    }
  		    return elts
  		  };

  		  pp$5.checkUnreserved = function(ref) {
  		    var start = ref.start;
  		    var end = ref.end;
  		    var name = ref.name;

  		    if (this.inGenerator && name === "yield")
  		      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
  		    if (this.inAsync && name === "await")
  		      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
  		    if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments")
  		      { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
  		    if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
  		      { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
  		    if (this.keywords.test(name))
  		      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  		    if (this.options.ecmaVersion < 6 &&
  		      this.input.slice(start, end).indexOf("\\") !== -1) { return }
  		    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  		    if (re.test(name)) {
  		      if (!this.inAsync && name === "await")
  		        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
  		      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  		    }
  		  };

  		  // Parse the next token as an identifier. If `liberal` is true (used
  		  // when parsing properties), it will also convert keywords into
  		  // identifiers.

  		  pp$5.parseIdent = function(liberal) {
  		    var node = this.parseIdentNode();
  		    this.next(!!liberal);
  		    this.finishNode(node, "Identifier");
  		    if (!liberal) {
  		      this.checkUnreserved(node);
  		      if (node.name === "await" && !this.awaitIdentPos)
  		        { this.awaitIdentPos = node.start; }
  		    }
  		    return node
  		  };

  		  pp$5.parseIdentNode = function() {
  		    var node = this.startNode();
  		    if (this.type === types$1.name) {
  		      node.name = this.value;
  		    } else if (this.type.keyword) {
  		      node.name = this.type.keyword;

  		      // To fix https://github.com/acornjs/acorn/issues/575
  		      // `class` and `function` keywords push new context into this.context.
  		      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
  		      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
  		      if ((node.name === "class" || node.name === "function") &&
  		        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
  		        this.context.pop();
  		      }
  		      this.type = types$1.name;
  		    } else {
  		      this.unexpected();
  		    }
  		    return node
  		  };

  		  pp$5.parsePrivateIdent = function() {
  		    var node = this.startNode();
  		    if (this.type === types$1.privateId) {
  		      node.name = this.value;
  		    } else {
  		      this.unexpected();
  		    }
  		    this.next();
  		    this.finishNode(node, "PrivateIdentifier");

  		    // For validating existence
  		    if (this.options.checkPrivateFields) {
  		      if (this.privateNameStack.length === 0) {
  		        this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
  		      } else {
  		        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
  		      }
  		    }

  		    return node
  		  };

  		  // Parses yield expression inside generator.

  		  pp$5.parseYield = function(forInit) {
  		    if (!this.yieldPos) { this.yieldPos = this.start; }

  		    var node = this.startNode();
  		    this.next();
  		    if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
  		      node.delegate = false;
  		      node.argument = null;
  		    } else {
  		      node.delegate = this.eat(types$1.star);
  		      node.argument = this.parseMaybeAssign(forInit);
  		    }
  		    return this.finishNode(node, "YieldExpression")
  		  };

  		  pp$5.parseAwait = function(forInit) {
  		    if (!this.awaitPos) { this.awaitPos = this.start; }

  		    var node = this.startNode();
  		    this.next();
  		    node.argument = this.parseMaybeUnary(null, true, false, forInit);
  		    return this.finishNode(node, "AwaitExpression")
  		  };

  		  var pp$4 = Parser.prototype;

  		  // This function is used to raise exceptions on parse errors. It
  		  // takes an offset integer (into the current `input`) to indicate
  		  // the location of the error, attaches the position to the end
  		  // of the error message, and then raises a `SyntaxError` with that
  		  // message.

  		  pp$4.raise = function(pos, message) {
  		    var loc = getLineInfo(this.input, pos);
  		    message += " (" + loc.line + ":" + loc.column + ")";
  		    if (this.sourceFile) {
  		      message += " in " + this.sourceFile;
  		    }
  		    var err = new SyntaxError(message);
  		    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  		    throw err
  		  };

  		  pp$4.raiseRecoverable = pp$4.raise;

  		  pp$4.curPosition = function() {
  		    if (this.options.locations) {
  		      return new Position(this.curLine, this.pos - this.lineStart)
  		    }
  		  };

  		  var pp$3 = Parser.prototype;

  		  var Scope = function Scope(flags) {
  		    this.flags = flags;
  		    // A list of var-declared names in the current lexical scope
  		    this.var = [];
  		    // A list of lexically-declared names in the current lexical scope
  		    this.lexical = [];
  		    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
  		    this.functions = [];
  		  };

  		  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  		  pp$3.enterScope = function(flags) {
  		    this.scopeStack.push(new Scope(flags));
  		  };

  		  pp$3.exitScope = function() {
  		    this.scopeStack.pop();
  		  };

  		  // The spec says:
  		  // > At the top level of a function, or script, function declarations are
  		  // > treated like var declarations rather than like lexical declarations.
  		  pp$3.treatFunctionsAsVarInScope = function(scope) {
  		    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  		  };

  		  pp$3.declareName = function(name, bindingType, pos) {
  		    var redeclared = false;
  		    if (bindingType === BIND_LEXICAL) {
  		      var scope = this.currentScope();
  		      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
  		      scope.lexical.push(name);
  		      if (this.inModule && (scope.flags & SCOPE_TOP))
  		        { delete this.undefinedExports[name]; }
  		    } else if (bindingType === BIND_SIMPLE_CATCH) {
  		      var scope$1 = this.currentScope();
  		      scope$1.lexical.push(name);
  		    } else if (bindingType === BIND_FUNCTION) {
  		      var scope$2 = this.currentScope();
  		      if (this.treatFunctionsAsVar)
  		        { redeclared = scope$2.lexical.indexOf(name) > -1; }
  		      else
  		        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
  		      scope$2.functions.push(name);
  		    } else {
  		      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
  		        var scope$3 = this.scopeStack[i];
  		        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
  		            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
  		          redeclared = true;
  		          break
  		        }
  		        scope$3.var.push(name);
  		        if (this.inModule && (scope$3.flags & SCOPE_TOP))
  		          { delete this.undefinedExports[name]; }
  		        if (scope$3.flags & SCOPE_VAR) { break }
  		      }
  		    }
  		    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  		  };

  		  pp$3.checkLocalExport = function(id) {
  		    // scope.functions must be empty as Module code is always strict.
  		    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
  		        this.scopeStack[0].var.indexOf(id.name) === -1) {
  		      this.undefinedExports[id.name] = id;
  		    }
  		  };

  		  pp$3.currentScope = function() {
  		    return this.scopeStack[this.scopeStack.length - 1]
  		  };

  		  pp$3.currentVarScope = function() {
  		    for (var i = this.scopeStack.length - 1;; i--) {
  		      var scope = this.scopeStack[i];
  		      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) { return scope }
  		    }
  		  };

  		  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  		  pp$3.currentThisScope = function() {
  		    for (var i = this.scopeStack.length - 1;; i--) {
  		      var scope = this.scopeStack[i];
  		      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) &&
  		          !(scope.flags & SCOPE_ARROW)) { return scope }
  		    }
  		  };

  		  var Node = function Node(parser, pos, loc) {
  		    this.type = "";
  		    this.start = pos;
  		    this.end = 0;
  		    if (parser.options.locations)
  		      { this.loc = new SourceLocation(parser, loc); }
  		    if (parser.options.directSourceFile)
  		      { this.sourceFile = parser.options.directSourceFile; }
  		    if (parser.options.ranges)
  		      { this.range = [pos, 0]; }
  		  };

  		  // Start an AST node, attaching a start offset.

  		  var pp$2 = Parser.prototype;

  		  pp$2.startNode = function() {
  		    return new Node(this, this.start, this.startLoc)
  		  };

  		  pp$2.startNodeAt = function(pos, loc) {
  		    return new Node(this, pos, loc)
  		  };

  		  // Finish an AST node, adding `type` and `end` properties.

  		  function finishNodeAt(node, type, pos, loc) {
  		    node.type = type;
  		    node.end = pos;
  		    if (this.options.locations)
  		      { node.loc.end = loc; }
  		    if (this.options.ranges)
  		      { node.range[1] = pos; }
  		    return node
  		  }

  		  pp$2.finishNode = function(node, type) {
  		    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  		  };

  		  // Finish node at given position

  		  pp$2.finishNodeAt = function(node, type, pos, loc) {
  		    return finishNodeAt.call(this, node, type, pos, loc)
  		  };

  		  pp$2.copyNode = function(node) {
  		    var newNode = new Node(this, node.start, this.startLoc);
  		    for (var prop in node) { newNode[prop] = node[prop]; }
  		    return newNode
  		  };

  		  // This file was generated by "bin/generate-unicode-script-values.js". Do not modify manually!
  		  var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";

  		  // This file contains Unicode properties extracted from the ECMAScript specification.
  		  // The lists are extracted like so:
  		  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  		  // #table-binary-unicode-properties
  		  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  		  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  		  var ecma11BinaryProperties = ecma10BinaryProperties;
  		  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  		  var ecma13BinaryProperties = ecma12BinaryProperties;
  		  var ecma14BinaryProperties = ecma13BinaryProperties;

  		  var unicodeBinaryProperties = {
  		    9: ecma9BinaryProperties,
  		    10: ecma10BinaryProperties,
  		    11: ecma11BinaryProperties,
  		    12: ecma12BinaryProperties,
  		    13: ecma13BinaryProperties,
  		    14: ecma14BinaryProperties
  		  };

  		  // #table-binary-unicode-properties-of-strings
  		  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

  		  var unicodeBinaryPropertiesOfStrings = {
  		    9: "",
  		    10: "",
  		    11: "",
  		    12: "",
  		    13: "",
  		    14: ecma14BinaryPropertiesOfStrings
  		  };

  		  // #table-unicode-general-category-values
  		  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  		  // #table-unicode-script-values
  		  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  		  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  		  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  		  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  		  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  		  var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;

  		  var unicodeScriptValues = {
  		    9: ecma9ScriptValues,
  		    10: ecma10ScriptValues,
  		    11: ecma11ScriptValues,
  		    12: ecma12ScriptValues,
  		    13: ecma13ScriptValues,
  		    14: ecma14ScriptValues
  		  };

  		  var data = {};
  		  function buildUnicodeData(ecmaVersion) {
  		    var d = data[ecmaVersion] = {
  		      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
  		      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
  		      nonBinary: {
  		        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
  		        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
  		      }
  		    };
  		    d.nonBinary.Script_Extensions = d.nonBinary.Script;

  		    d.nonBinary.gc = d.nonBinary.General_Category;
  		    d.nonBinary.sc = d.nonBinary.Script;
  		    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  		  }

  		  for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  		    var ecmaVersion = list[i];

  		    buildUnicodeData(ecmaVersion);
  		  }

  		  var pp$1 = Parser.prototype;

  		  // Track disjunction structure to determine whether a duplicate
  		  // capture group name is allowed because it is in a separate branch.
  		  var BranchID = function BranchID(parent, base) {
  		    // Parent disjunction branch
  		    this.parent = parent;
  		    // Identifies this set of sibling branches
  		    this.base = base || this;
  		  };

  		  BranchID.prototype.separatedFrom = function separatedFrom (alt) {
  		    // A branch is separate from another branch if they or any of
  		    // their parents are siblings in a given disjunction
  		    for (var self = this; self; self = self.parent) {
  		      for (var other = alt; other; other = other.parent) {
  		        if (self.base === other.base && self !== other) { return true }
  		      }
  		    }
  		    return false
  		  };

  		  BranchID.prototype.sibling = function sibling () {
  		    return new BranchID(this.parent, this.base)
  		  };

  		  var RegExpValidationState = function RegExpValidationState(parser) {
  		    this.parser = parser;
  		    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  		    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  		    this.source = "";
  		    this.flags = "";
  		    this.start = 0;
  		    this.switchU = false;
  		    this.switchV = false;
  		    this.switchN = false;
  		    this.pos = 0;
  		    this.lastIntValue = 0;
  		    this.lastStringValue = "";
  		    this.lastAssertionIsQuantifiable = false;
  		    this.numCapturingParens = 0;
  		    this.maxBackReference = 0;
  		    this.groupNames = Object.create(null);
  		    this.backReferenceNames = [];
  		    this.branchID = null;
  		  };

  		  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
  		    var unicodeSets = flags.indexOf("v") !== -1;
  		    var unicode = flags.indexOf("u") !== -1;
  		    this.start = start | 0;
  		    this.source = pattern + "";
  		    this.flags = flags;
  		    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
  		      this.switchU = true;
  		      this.switchV = true;
  		      this.switchN = true;
  		    } else {
  		      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
  		      this.switchV = false;
  		      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  		    }
  		  };

  		  RegExpValidationState.prototype.raise = function raise (message) {
  		    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  		  };

  		  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  		  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  		  RegExpValidationState.prototype.at = function at (i, forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    var s = this.source;
  		    var l = s.length;
  		    if (i >= l) {
  		      return -1
  		    }
  		    var c = s.charCodeAt(i);
  		    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
  		      return c
  		    }
  		    var next = s.charCodeAt(i + 1);
  		    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  		  };

  		  RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    var s = this.source;
  		    var l = s.length;
  		    if (i >= l) {
  		      return l
  		    }
  		    var c = s.charCodeAt(i), next;
  		    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
  		        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
  		      return i + 1
  		    }
  		    return i + 2
  		  };

  		  RegExpValidationState.prototype.current = function current (forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    return this.at(this.pos, forceU)
  		  };

  		  RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    return this.at(this.nextIndex(this.pos, forceU), forceU)
  		  };

  		  RegExpValidationState.prototype.advance = function advance (forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    this.pos = this.nextIndex(this.pos, forceU);
  		  };

  		  RegExpValidationState.prototype.eat = function eat (ch, forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    if (this.current(forceU) === ch) {
  		      this.advance(forceU);
  		      return true
  		    }
  		    return false
  		  };

  		  RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
  		      if ( forceU === void 0 ) forceU = false;

  		    var pos = this.pos;
  		    for (var i = 0, list = chs; i < list.length; i += 1) {
  		      var ch = list[i];

  		        var current = this.at(pos, forceU);
  		      if (current === -1 || current !== ch) {
  		        return false
  		      }
  		      pos = this.nextIndex(pos, forceU);
  		    }
  		    this.pos = pos;
  		    return true
  		  };

  		  /**
  		   * Validate the flags part of a given RegExpLiteral.
  		   *
  		   * @param {RegExpValidationState} state The state to validate RegExp.
  		   * @returns {void}
  		   */
  		  pp$1.validateRegExpFlags = function(state) {
  		    var validFlags = state.validFlags;
  		    var flags = state.flags;

  		    var u = false;
  		    var v = false;

  		    for (var i = 0; i < flags.length; i++) {
  		      var flag = flags.charAt(i);
  		      if (validFlags.indexOf(flag) === -1) {
  		        this.raise(state.start, "Invalid regular expression flag");
  		      }
  		      if (flags.indexOf(flag, i + 1) > -1) {
  		        this.raise(state.start, "Duplicate regular expression flag");
  		      }
  		      if (flag === "u") { u = true; }
  		      if (flag === "v") { v = true; }
  		    }
  		    if (this.options.ecmaVersion >= 15 && u && v) {
  		      this.raise(state.start, "Invalid regular expression flag");
  		    }
  		  };

  		  function hasProp(obj) {
  		    for (var _ in obj) { return true }
  		    return false
  		  }

  		  /**
  		   * Validate the pattern part of a given RegExpLiteral.
  		   *
  		   * @param {RegExpValidationState} state The state to validate RegExp.
  		   * @returns {void}
  		   */
  		  pp$1.validateRegExpPattern = function(state) {
  		    this.regexp_pattern(state);

  		    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
  		    // parsing contains a |GroupName|, reparse with the goal symbol
  		    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
  		    // exception if _P_ did not conform to the grammar, if any elements of _P_
  		    // were not matched by the parse, or if any Early Error conditions exist.
  		    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
  		      state.switchN = true;
  		      this.regexp_pattern(state);
  		    }
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  		  pp$1.regexp_pattern = function(state) {
  		    state.pos = 0;
  		    state.lastIntValue = 0;
  		    state.lastStringValue = "";
  		    state.lastAssertionIsQuantifiable = false;
  		    state.numCapturingParens = 0;
  		    state.maxBackReference = 0;
  		    state.groupNames = Object.create(null);
  		    state.backReferenceNames.length = 0;
  		    state.branchID = null;

  		    this.regexp_disjunction(state);

  		    if (state.pos !== state.source.length) {
  		      // Make the same messages as V8.
  		      if (state.eat(0x29 /* ) */)) {
  		        state.raise("Unmatched ')'");
  		      }
  		      if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
  		        state.raise("Lone quantifier brackets");
  		      }
  		    }
  		    if (state.maxBackReference > state.numCapturingParens) {
  		      state.raise("Invalid escape");
  		    }
  		    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
  		      var name = list[i];

  		      if (!state.groupNames[name]) {
  		        state.raise("Invalid named capture referenced");
  		      }
  		    }
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  		  pp$1.regexp_disjunction = function(state) {
  		    var trackDisjunction = this.options.ecmaVersion >= 16;
  		    if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
  		    this.regexp_alternative(state);
  		    while (state.eat(0x7C /* | */)) {
  		      if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
  		      this.regexp_alternative(state);
  		    }
  		    if (trackDisjunction) { state.branchID = state.branchID.parent; }

  		    // Make the same message as V8.
  		    if (this.regexp_eatQuantifier(state, true)) {
  		      state.raise("Nothing to repeat");
  		    }
  		    if (state.eat(0x7B /* { */)) {
  		      state.raise("Lone quantifier brackets");
  		    }
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  		  pp$1.regexp_alternative = function(state) {
  		    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  		  pp$1.regexp_eatTerm = function(state) {
  		    if (this.regexp_eatAssertion(state)) {
  		      // Handle `QuantifiableAssertion Quantifier` alternative.
  		      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
  		      // is a QuantifiableAssertion.
  		      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
  		        // Make the same message as V8.
  		        if (state.switchU) {
  		          state.raise("Invalid quantifier");
  		        }
  		      }
  		      return true
  		    }

  		    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
  		      this.regexp_eatQuantifier(state);
  		      return true
  		    }

  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  		  pp$1.regexp_eatAssertion = function(state) {
  		    var start = state.pos;
  		    state.lastAssertionIsQuantifiable = false;

  		    // ^, $
  		    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
  		      return true
  		    }

  		    // \b \B
  		    if (state.eat(0x5C /* \ */)) {
  		      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
  		        return true
  		      }
  		      state.pos = start;
  		    }

  		    // Lookahead / Lookbehind
  		    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
  		      var lookbehind = false;
  		      if (this.options.ecmaVersion >= 9) {
  		        lookbehind = state.eat(0x3C /* < */);
  		      }
  		      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
  		        this.regexp_disjunction(state);
  		        if (!state.eat(0x29 /* ) */)) {
  		          state.raise("Unterminated group");
  		        }
  		        state.lastAssertionIsQuantifiable = !lookbehind;
  		        return true
  		      }
  		    }

  		    state.pos = start;
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  		  pp$1.regexp_eatQuantifier = function(state, noError) {
  		    if ( noError === void 0 ) noError = false;

  		    if (this.regexp_eatQuantifierPrefix(state, noError)) {
  		      state.eat(0x3F /* ? */);
  		      return true
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  		  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  		    return (
  		      state.eat(0x2A /* * */) ||
  		      state.eat(0x2B /* + */) ||
  		      state.eat(0x3F /* ? */) ||
  		      this.regexp_eatBracedQuantifier(state, noError)
  		    )
  		  };
  		  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  		    var start = state.pos;
  		    if (state.eat(0x7B /* { */)) {
  		      var min = 0, max = -1;
  		      if (this.regexp_eatDecimalDigits(state)) {
  		        min = state.lastIntValue;
  		        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
  		          max = state.lastIntValue;
  		        }
  		        if (state.eat(0x7D /* } */)) {
  		          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
  		          if (max !== -1 && max < min && !noError) {
  		            state.raise("numbers out of order in {} quantifier");
  		          }
  		          return true
  		        }
  		      }
  		      if (state.switchU && !noError) {
  		        state.raise("Incomplete quantifier");
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  		  pp$1.regexp_eatAtom = function(state) {
  		    return (
  		      this.regexp_eatPatternCharacters(state) ||
  		      state.eat(0x2E /* . */) ||
  		      this.regexp_eatReverseSolidusAtomEscape(state) ||
  		      this.regexp_eatCharacterClass(state) ||
  		      this.regexp_eatUncapturingGroup(state) ||
  		      this.regexp_eatCapturingGroup(state)
  		    )
  		  };
  		  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  		    var start = state.pos;
  		    if (state.eat(0x5C /* \ */)) {
  		      if (this.regexp_eatAtomEscape(state)) {
  		        return true
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };
  		  pp$1.regexp_eatUncapturingGroup = function(state) {
  		    var start = state.pos;
  		    if (state.eat(0x28 /* ( */)) {
  		      if (state.eat(0x3F /* ? */)) {
  		        if (this.options.ecmaVersion >= 16) {
  		          var addModifiers = this.regexp_eatModifiers(state);
  		          var hasHyphen = state.eat(0x2D /* - */);
  		          if (addModifiers || hasHyphen) {
  		            for (var i = 0; i < addModifiers.length; i++) {
  		              var modifier = addModifiers.charAt(i);
  		              if (addModifiers.indexOf(modifier, i + 1) > -1) {
  		                state.raise("Duplicate regular expression modifiers");
  		              }
  		            }
  		            if (hasHyphen) {
  		              var removeModifiers = this.regexp_eatModifiers(state);
  		              if (!addModifiers && !removeModifiers && state.current() === 0x3A /* : */) {
  		                state.raise("Invalid regular expression modifiers");
  		              }
  		              for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
  		                var modifier$1 = removeModifiers.charAt(i$1);
  		                if (
  		                  removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 ||
  		                  addModifiers.indexOf(modifier$1) > -1
  		                ) {
  		                  state.raise("Duplicate regular expression modifiers");
  		                }
  		              }
  		            }
  		          }
  		        }
  		        if (state.eat(0x3A /* : */)) {
  		          this.regexp_disjunction(state);
  		          if (state.eat(0x29 /* ) */)) {
  		            return true
  		          }
  		          state.raise("Unterminated group");
  		        }
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };
  		  pp$1.regexp_eatCapturingGroup = function(state) {
  		    if (state.eat(0x28 /* ( */)) {
  		      if (this.options.ecmaVersion >= 9) {
  		        this.regexp_groupSpecifier(state);
  		      } else if (state.current() === 0x3F /* ? */) {
  		        state.raise("Invalid group");
  		      }
  		      this.regexp_disjunction(state);
  		      if (state.eat(0x29 /* ) */)) {
  		        state.numCapturingParens += 1;
  		        return true
  		      }
  		      state.raise("Unterminated group");
  		    }
  		    return false
  		  };
  		  // RegularExpressionModifiers ::
  		  //   [empty]
  		  //   RegularExpressionModifiers RegularExpressionModifier
  		  pp$1.regexp_eatModifiers = function(state) {
  		    var modifiers = "";
  		    var ch = 0;
  		    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
  		      modifiers += codePointToString(ch);
  		      state.advance();
  		    }
  		    return modifiers
  		  };
  		  // RegularExpressionModifier :: one of
  		  //   `i` `m` `s`
  		  function isRegularExpressionModifier(ch) {
  		    return ch === 0x69 /* i */ || ch === 0x6d /* m */ || ch === 0x73 /* s */
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  		  pp$1.regexp_eatExtendedAtom = function(state) {
  		    return (
  		      state.eat(0x2E /* . */) ||
  		      this.regexp_eatReverseSolidusAtomEscape(state) ||
  		      this.regexp_eatCharacterClass(state) ||
  		      this.regexp_eatUncapturingGroup(state) ||
  		      this.regexp_eatCapturingGroup(state) ||
  		      this.regexp_eatInvalidBracedQuantifier(state) ||
  		      this.regexp_eatExtendedPatternCharacter(state)
  		    )
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  		  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  		    if (this.regexp_eatBracedQuantifier(state, true)) {
  		      state.raise("Nothing to repeat");
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  		  pp$1.regexp_eatSyntaxCharacter = function(state) {
  		    var ch = state.current();
  		    if (isSyntaxCharacter(ch)) {
  		      state.lastIntValue = ch;
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };
  		  function isSyntaxCharacter(ch) {
  		    return (
  		      ch === 0x24 /* $ */ ||
  		      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
  		      ch === 0x2E /* . */ ||
  		      ch === 0x3F /* ? */ ||
  		      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
  		      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  		    )
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  		  // But eat eager.
  		  pp$1.regexp_eatPatternCharacters = function(state) {
  		    var start = state.pos;
  		    var ch = 0;
  		    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
  		      state.advance();
  		    }
  		    return state.pos !== start
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  		  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  		    var ch = state.current();
  		    if (
  		      ch !== -1 &&
  		      ch !== 0x24 /* $ */ &&
  		      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
  		      ch !== 0x2E /* . */ &&
  		      ch !== 0x3F /* ? */ &&
  		      ch !== 0x5B /* [ */ &&
  		      ch !== 0x5E /* ^ */ &&
  		      ch !== 0x7C /* | */
  		    ) {
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };

  		  // GroupSpecifier ::
  		  //   [empty]
  		  //   `?` GroupName
  		  pp$1.regexp_groupSpecifier = function(state) {
  		    if (state.eat(0x3F /* ? */)) {
  		      if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
  		      var trackDisjunction = this.options.ecmaVersion >= 16;
  		      var known = state.groupNames[state.lastStringValue];
  		      if (known) {
  		        if (trackDisjunction) {
  		          for (var i = 0, list = known; i < list.length; i += 1) {
  		            var altID = list[i];

  		            if (!altID.separatedFrom(state.branchID))
  		              { state.raise("Duplicate capture group name"); }
  		          }
  		        } else {
  		          state.raise("Duplicate capture group name");
  		        }
  		      }
  		      if (trackDisjunction) {
  		        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
  		      } else {
  		        state.groupNames[state.lastStringValue] = true;
  		      }
  		    }
  		  };

  		  // GroupName ::
  		  //   `<` RegExpIdentifierName `>`
  		  // Note: this updates `state.lastStringValue` property with the eaten name.
  		  pp$1.regexp_eatGroupName = function(state) {
  		    state.lastStringValue = "";
  		    if (state.eat(0x3C /* < */)) {
  		      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
  		        return true
  		      }
  		      state.raise("Invalid capture group name");
  		    }
  		    return false
  		  };

  		  // RegExpIdentifierName ::
  		  //   RegExpIdentifierStart
  		  //   RegExpIdentifierName RegExpIdentifierPart
  		  // Note: this updates `state.lastStringValue` property with the eaten name.
  		  pp$1.regexp_eatRegExpIdentifierName = function(state) {
  		    state.lastStringValue = "";
  		    if (this.regexp_eatRegExpIdentifierStart(state)) {
  		      state.lastStringValue += codePointToString(state.lastIntValue);
  		      while (this.regexp_eatRegExpIdentifierPart(state)) {
  		        state.lastStringValue += codePointToString(state.lastIntValue);
  		      }
  		      return true
  		    }
  		    return false
  		  };

  		  // RegExpIdentifierStart ::
  		  //   UnicodeIDStart
  		  //   `$`
  		  //   `_`
  		  //   `\` RegExpUnicodeEscapeSequence[+U]
  		  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  		    var start = state.pos;
  		    var forceU = this.options.ecmaVersion >= 11;
  		    var ch = state.current(forceU);
  		    state.advance(forceU);

  		    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
  		      ch = state.lastIntValue;
  		    }
  		    if (isRegExpIdentifierStart(ch)) {
  		      state.lastIntValue = ch;
  		      return true
  		    }

  		    state.pos = start;
  		    return false
  		  };
  		  function isRegExpIdentifierStart(ch) {
  		    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  		  }

  		  // RegExpIdentifierPart ::
  		  //   UnicodeIDContinue
  		  //   `$`
  		  //   `_`
  		  //   `\` RegExpUnicodeEscapeSequence[+U]
  		  //   <ZWNJ>
  		  //   <ZWJ>
  		  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  		    var start = state.pos;
  		    var forceU = this.options.ecmaVersion >= 11;
  		    var ch = state.current(forceU);
  		    state.advance(forceU);

  		    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
  		      ch = state.lastIntValue;
  		    }
  		    if (isRegExpIdentifierPart(ch)) {
  		      state.lastIntValue = ch;
  		      return true
  		    }

  		    state.pos = start;
  		    return false
  		  };
  		  function isRegExpIdentifierPart(ch) {
  		    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  		  pp$1.regexp_eatAtomEscape = function(state) {
  		    if (
  		      this.regexp_eatBackReference(state) ||
  		      this.regexp_eatCharacterClassEscape(state) ||
  		      this.regexp_eatCharacterEscape(state) ||
  		      (state.switchN && this.regexp_eatKGroupName(state))
  		    ) {
  		      return true
  		    }
  		    if (state.switchU) {
  		      // Make the same message as V8.
  		      if (state.current() === 0x63 /* c */) {
  		        state.raise("Invalid unicode escape");
  		      }
  		      state.raise("Invalid escape");
  		    }
  		    return false
  		  };
  		  pp$1.regexp_eatBackReference = function(state) {
  		    var start = state.pos;
  		    if (this.regexp_eatDecimalEscape(state)) {
  		      var n = state.lastIntValue;
  		      if (state.switchU) {
  		        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
  		        if (n > state.maxBackReference) {
  		          state.maxBackReference = n;
  		        }
  		        return true
  		      }
  		      if (n <= state.numCapturingParens) {
  		        return true
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };
  		  pp$1.regexp_eatKGroupName = function(state) {
  		    if (state.eat(0x6B /* k */)) {
  		      if (this.regexp_eatGroupName(state)) {
  		        state.backReferenceNames.push(state.lastStringValue);
  		        return true
  		      }
  		      state.raise("Invalid named reference");
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  		  pp$1.regexp_eatCharacterEscape = function(state) {
  		    return (
  		      this.regexp_eatControlEscape(state) ||
  		      this.regexp_eatCControlLetter(state) ||
  		      this.regexp_eatZero(state) ||
  		      this.regexp_eatHexEscapeSequence(state) ||
  		      this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
  		      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
  		      this.regexp_eatIdentityEscape(state)
  		    )
  		  };
  		  pp$1.regexp_eatCControlLetter = function(state) {
  		    var start = state.pos;
  		    if (state.eat(0x63 /* c */)) {
  		      if (this.regexp_eatControlLetter(state)) {
  		        return true
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };
  		  pp$1.regexp_eatZero = function(state) {
  		    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
  		      state.lastIntValue = 0;
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  		  pp$1.regexp_eatControlEscape = function(state) {
  		    var ch = state.current();
  		    if (ch === 0x74 /* t */) {
  		      state.lastIntValue = 0x09; /* \t */
  		      state.advance();
  		      return true
  		    }
  		    if (ch === 0x6E /* n */) {
  		      state.lastIntValue = 0x0A; /* \n */
  		      state.advance();
  		      return true
  		    }
  		    if (ch === 0x76 /* v */) {
  		      state.lastIntValue = 0x0B; /* \v */
  		      state.advance();
  		      return true
  		    }
  		    if (ch === 0x66 /* f */) {
  		      state.lastIntValue = 0x0C; /* \f */
  		      state.advance();
  		      return true
  		    }
  		    if (ch === 0x72 /* r */) {
  		      state.lastIntValue = 0x0D; /* \r */
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  		  pp$1.regexp_eatControlLetter = function(state) {
  		    var ch = state.current();
  		    if (isControlLetter(ch)) {
  		      state.lastIntValue = ch % 0x20;
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };
  		  function isControlLetter(ch) {
  		    return (
  		      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
  		      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
  		    )
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  		  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  		    if ( forceU === void 0 ) forceU = false;

  		    var start = state.pos;
  		    var switchU = forceU || state.switchU;

  		    if (state.eat(0x75 /* u */)) {
  		      if (this.regexp_eatFixedHexDigits(state, 4)) {
  		        var lead = state.lastIntValue;
  		        if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
  		          var leadSurrogateEnd = state.pos;
  		          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
  		            var trail = state.lastIntValue;
  		            if (trail >= 0xDC00 && trail <= 0xDFFF) {
  		              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
  		              return true
  		            }
  		          }
  		          state.pos = leadSurrogateEnd;
  		          state.lastIntValue = lead;
  		        }
  		        return true
  		      }
  		      if (
  		        switchU &&
  		        state.eat(0x7B /* { */) &&
  		        this.regexp_eatHexDigits(state) &&
  		        state.eat(0x7D /* } */) &&
  		        isValidUnicode(state.lastIntValue)
  		      ) {
  		        return true
  		      }
  		      if (switchU) {
  		        state.raise("Invalid unicode escape");
  		      }
  		      state.pos = start;
  		    }

  		    return false
  		  };
  		  function isValidUnicode(ch) {
  		    return ch >= 0 && ch <= 0x10FFFF
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  		  pp$1.regexp_eatIdentityEscape = function(state) {
  		    if (state.switchU) {
  		      if (this.regexp_eatSyntaxCharacter(state)) {
  		        return true
  		      }
  		      if (state.eat(0x2F /* / */)) {
  		        state.lastIntValue = 0x2F; /* / */
  		        return true
  		      }
  		      return false
  		    }

  		    var ch = state.current();
  		    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
  		      state.lastIntValue = ch;
  		      state.advance();
  		      return true
  		    }

  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  		  pp$1.regexp_eatDecimalEscape = function(state) {
  		    state.lastIntValue = 0;
  		    var ch = state.current();
  		    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
  		      do {
  		        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
  		        state.advance();
  		      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
  		      return true
  		    }
  		    return false
  		  };

  		  // Return values used by character set parsing methods, needed to
  		  // forbid negation of sets that can match strings.
  		  var CharSetNone = 0; // Nothing parsed
  		  var CharSetOk = 1; // Construct parsed, cannot contain strings
  		  var CharSetString = 2; // Construct parsed, can contain strings

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  		  pp$1.regexp_eatCharacterClassEscape = function(state) {
  		    var ch = state.current();

  		    if (isCharacterClassEscape(ch)) {
  		      state.lastIntValue = -1;
  		      state.advance();
  		      return CharSetOk
  		    }

  		    var negate = false;
  		    if (
  		      state.switchU &&
  		      this.options.ecmaVersion >= 9 &&
  		      ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
  		    ) {
  		      state.lastIntValue = -1;
  		      state.advance();
  		      var result;
  		      if (
  		        state.eat(0x7B /* { */) &&
  		        (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
  		        state.eat(0x7D /* } */)
  		      ) {
  		        if (negate && result === CharSetString) { state.raise("Invalid property name"); }
  		        return result
  		      }
  		      state.raise("Invalid property name");
  		    }

  		    return CharSetNone
  		  };

  		  function isCharacterClassEscape(ch) {
  		    return (
  		      ch === 0x64 /* d */ ||
  		      ch === 0x44 /* D */ ||
  		      ch === 0x73 /* s */ ||
  		      ch === 0x53 /* S */ ||
  		      ch === 0x77 /* w */ ||
  		      ch === 0x57 /* W */
  		    )
  		  }

  		  // UnicodePropertyValueExpression ::
  		  //   UnicodePropertyName `=` UnicodePropertyValue
  		  //   LoneUnicodePropertyNameOrValue
  		  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  		    var start = state.pos;

  		    // UnicodePropertyName `=` UnicodePropertyValue
  		    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
  		      var name = state.lastStringValue;
  		      if (this.regexp_eatUnicodePropertyValue(state)) {
  		        var value = state.lastStringValue;
  		        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
  		        return CharSetOk
  		      }
  		    }
  		    state.pos = start;

  		    // LoneUnicodePropertyNameOrValue
  		    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
  		      var nameOrValue = state.lastStringValue;
  		      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
  		    }
  		    return CharSetNone
  		  };

  		  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  		    if (!hasOwn(state.unicodeProperties.nonBinary, name))
  		      { state.raise("Invalid property name"); }
  		    if (!state.unicodeProperties.nonBinary[name].test(value))
  		      { state.raise("Invalid property value"); }
  		  };

  		  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  		    if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
  		    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
  		    state.raise("Invalid property name");
  		  };

  		  // UnicodePropertyName ::
  		  //   UnicodePropertyNameCharacters
  		  pp$1.regexp_eatUnicodePropertyName = function(state) {
  		    var ch = 0;
  		    state.lastStringValue = "";
  		    while (isUnicodePropertyNameCharacter(ch = state.current())) {
  		      state.lastStringValue += codePointToString(ch);
  		      state.advance();
  		    }
  		    return state.lastStringValue !== ""
  		  };

  		  function isUnicodePropertyNameCharacter(ch) {
  		    return isControlLetter(ch) || ch === 0x5F /* _ */
  		  }

  		  // UnicodePropertyValue ::
  		  //   UnicodePropertyValueCharacters
  		  pp$1.regexp_eatUnicodePropertyValue = function(state) {
  		    var ch = 0;
  		    state.lastStringValue = "";
  		    while (isUnicodePropertyValueCharacter(ch = state.current())) {
  		      state.lastStringValue += codePointToString(ch);
  		      state.advance();
  		    }
  		    return state.lastStringValue !== ""
  		  };
  		  function isUnicodePropertyValueCharacter(ch) {
  		    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  		  }

  		  // LoneUnicodePropertyNameOrValue ::
  		  //   UnicodePropertyValueCharacters
  		  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  		    return this.regexp_eatUnicodePropertyValue(state)
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  		  pp$1.regexp_eatCharacterClass = function(state) {
  		    if (state.eat(0x5B /* [ */)) {
  		      var negate = state.eat(0x5E /* ^ */);
  		      var result = this.regexp_classContents(state);
  		      if (!state.eat(0x5D /* ] */))
  		        { state.raise("Unterminated character class"); }
  		      if (negate && result === CharSetString)
  		        { state.raise("Negated character class may contain strings"); }
  		      return true
  		    }
  		    return false
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassContents
  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  		  pp$1.regexp_classContents = function(state) {
  		    if (state.current() === 0x5D /* ] */) { return CharSetOk }
  		    if (state.switchV) { return this.regexp_classSetExpression(state) }
  		    this.regexp_nonEmptyClassRanges(state);
  		    return CharSetOk
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  		  pp$1.regexp_nonEmptyClassRanges = function(state) {
  		    while (this.regexp_eatClassAtom(state)) {
  		      var left = state.lastIntValue;
  		      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
  		        var right = state.lastIntValue;
  		        if (state.switchU && (left === -1 || right === -1)) {
  		          state.raise("Invalid character class");
  		        }
  		        if (left !== -1 && right !== -1 && left > right) {
  		          state.raise("Range out of order in character class");
  		        }
  		      }
  		    }
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  		  pp$1.regexp_eatClassAtom = function(state) {
  		    var start = state.pos;

  		    if (state.eat(0x5C /* \ */)) {
  		      if (this.regexp_eatClassEscape(state)) {
  		        return true
  		      }
  		      if (state.switchU) {
  		        // Make the same message as V8.
  		        var ch$1 = state.current();
  		        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
  		          state.raise("Invalid class escape");
  		        }
  		        state.raise("Invalid escape");
  		      }
  		      state.pos = start;
  		    }

  		    var ch = state.current();
  		    if (ch !== 0x5D /* ] */) {
  		      state.lastIntValue = ch;
  		      state.advance();
  		      return true
  		    }

  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  		  pp$1.regexp_eatClassEscape = function(state) {
  		    var start = state.pos;

  		    if (state.eat(0x62 /* b */)) {
  		      state.lastIntValue = 0x08; /* <BS> */
  		      return true
  		    }

  		    if (state.switchU && state.eat(0x2D /* - */)) {
  		      state.lastIntValue = 0x2D; /* - */
  		      return true
  		    }

  		    if (!state.switchU && state.eat(0x63 /* c */)) {
  		      if (this.regexp_eatClassControlLetter(state)) {
  		        return true
  		      }
  		      state.pos = start;
  		    }

  		    return (
  		      this.regexp_eatCharacterClassEscape(state) ||
  		      this.regexp_eatCharacterEscape(state)
  		    )
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassSetExpression
  		  // https://tc39.es/ecma262/#prod-ClassUnion
  		  // https://tc39.es/ecma262/#prod-ClassIntersection
  		  // https://tc39.es/ecma262/#prod-ClassSubtraction
  		  pp$1.regexp_classSetExpression = function(state) {
  		    var result = CharSetOk, subResult;
  		    if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
  		      if (subResult === CharSetString) { result = CharSetString; }
  		      // https://tc39.es/ecma262/#prod-ClassIntersection
  		      var start = state.pos;
  		      while (state.eatChars([0x26, 0x26] /* && */)) {
  		        if (
  		          state.current() !== 0x26 /* & */ &&
  		          (subResult = this.regexp_eatClassSetOperand(state))
  		        ) {
  		          if (subResult !== CharSetString) { result = CharSetOk; }
  		          continue
  		        }
  		        state.raise("Invalid character in character class");
  		      }
  		      if (start !== state.pos) { return result }
  		      // https://tc39.es/ecma262/#prod-ClassSubtraction
  		      while (state.eatChars([0x2D, 0x2D] /* -- */)) {
  		        if (this.regexp_eatClassSetOperand(state)) { continue }
  		        state.raise("Invalid character in character class");
  		      }
  		      if (start !== state.pos) { return result }
  		    } else {
  		      state.raise("Invalid character in character class");
  		    }
  		    // https://tc39.es/ecma262/#prod-ClassUnion
  		    for (;;) {
  		      if (this.regexp_eatClassSetRange(state)) { continue }
  		      subResult = this.regexp_eatClassSetOperand(state);
  		      if (!subResult) { return result }
  		      if (subResult === CharSetString) { result = CharSetString; }
  		    }
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassSetRange
  		  pp$1.regexp_eatClassSetRange = function(state) {
  		    var start = state.pos;
  		    if (this.regexp_eatClassSetCharacter(state)) {
  		      var left = state.lastIntValue;
  		      if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
  		        var right = state.lastIntValue;
  		        if (left !== -1 && right !== -1 && left > right) {
  		          state.raise("Range out of order in character class");
  		        }
  		        return true
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassSetOperand
  		  pp$1.regexp_eatClassSetOperand = function(state) {
  		    if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
  		    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
  		  };

  		  // https://tc39.es/ecma262/#prod-NestedClass
  		  pp$1.regexp_eatNestedClass = function(state) {
  		    var start = state.pos;
  		    if (state.eat(0x5B /* [ */)) {
  		      var negate = state.eat(0x5E /* ^ */);
  		      var result = this.regexp_classContents(state);
  		      if (state.eat(0x5D /* ] */)) {
  		        if (negate && result === CharSetString) {
  		          state.raise("Negated character class may contain strings");
  		        }
  		        return result
  		      }
  		      state.pos = start;
  		    }
  		    if (state.eat(0x5C /* \ */)) {
  		      var result$1 = this.regexp_eatCharacterClassEscape(state);
  		      if (result$1) {
  		        return result$1
  		      }
  		      state.pos = start;
  		    }
  		    return null
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassStringDisjunction
  		  pp$1.regexp_eatClassStringDisjunction = function(state) {
  		    var start = state.pos;
  		    if (state.eatChars([0x5C, 0x71] /* \q */)) {
  		      if (state.eat(0x7B /* { */)) {
  		        var result = this.regexp_classStringDisjunctionContents(state);
  		        if (state.eat(0x7D /* } */)) {
  		          return result
  		        }
  		      } else {
  		        // Make the same message as V8.
  		        state.raise("Invalid escape");
  		      }
  		      state.pos = start;
  		    }
  		    return null
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
  		  pp$1.regexp_classStringDisjunctionContents = function(state) {
  		    var result = this.regexp_classString(state);
  		    while (state.eat(0x7C /* | */)) {
  		      if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
  		    }
  		    return result
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassString
  		  // https://tc39.es/ecma262/#prod-NonEmptyClassString
  		  pp$1.regexp_classString = function(state) {
  		    var count = 0;
  		    while (this.regexp_eatClassSetCharacter(state)) { count++; }
  		    return count === 1 ? CharSetOk : CharSetString
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassSetCharacter
  		  pp$1.regexp_eatClassSetCharacter = function(state) {
  		    var start = state.pos;
  		    if (state.eat(0x5C /* \ */)) {
  		      if (
  		        this.regexp_eatCharacterEscape(state) ||
  		        this.regexp_eatClassSetReservedPunctuator(state)
  		      ) {
  		        return true
  		      }
  		      if (state.eat(0x62 /* b */)) {
  		        state.lastIntValue = 0x08; /* <BS> */
  		        return true
  		      }
  		      state.pos = start;
  		      return false
  		    }
  		    var ch = state.current();
  		    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
  		    if (isClassSetSyntaxCharacter(ch)) { return false }
  		    state.advance();
  		    state.lastIntValue = ch;
  		    return true
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
  		  function isClassSetReservedDoublePunctuatorCharacter(ch) {
  		    return (
  		      ch === 0x21 /* ! */ ||
  		      ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
  		      ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
  		      ch === 0x2E /* . */ ||
  		      ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
  		      ch === 0x5E /* ^ */ ||
  		      ch === 0x60 /* ` */ ||
  		      ch === 0x7E /* ~ */
  		    )
  		  }

  		  // https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
  		  function isClassSetSyntaxCharacter(ch) {
  		    return (
  		      ch === 0x28 /* ( */ ||
  		      ch === 0x29 /* ) */ ||
  		      ch === 0x2D /* - */ ||
  		      ch === 0x2F /* / */ ||
  		      ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
  		      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  		    )
  		  }

  		  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  		  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  		    var ch = state.current();
  		    if (isClassSetReservedPunctuator(ch)) {
  		      state.lastIntValue = ch;
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };

  		  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  		  function isClassSetReservedPunctuator(ch) {
  		    return (
  		      ch === 0x21 /* ! */ ||
  		      ch === 0x23 /* # */ ||
  		      ch === 0x25 /* % */ ||
  		      ch === 0x26 /* & */ ||
  		      ch === 0x2C /* , */ ||
  		      ch === 0x2D /* - */ ||
  		      ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
  		      ch === 0x40 /* @ */ ||
  		      ch === 0x60 /* ` */ ||
  		      ch === 0x7E /* ~ */
  		    )
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  		  pp$1.regexp_eatClassControlLetter = function(state) {
  		    var ch = state.current();
  		    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
  		      state.lastIntValue = ch % 0x20;
  		      state.advance();
  		      return true
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  		  pp$1.regexp_eatHexEscapeSequence = function(state) {
  		    var start = state.pos;
  		    if (state.eat(0x78 /* x */)) {
  		      if (this.regexp_eatFixedHexDigits(state, 2)) {
  		        return true
  		      }
  		      if (state.switchU) {
  		        state.raise("Invalid escape");
  		      }
  		      state.pos = start;
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  		  pp$1.regexp_eatDecimalDigits = function(state) {
  		    var start = state.pos;
  		    var ch = 0;
  		    state.lastIntValue = 0;
  		    while (isDecimalDigit(ch = state.current())) {
  		      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
  		      state.advance();
  		    }
  		    return state.pos !== start
  		  };
  		  function isDecimalDigit(ch) {
  		    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  		  pp$1.regexp_eatHexDigits = function(state) {
  		    var start = state.pos;
  		    var ch = 0;
  		    state.lastIntValue = 0;
  		    while (isHexDigit(ch = state.current())) {
  		      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
  		      state.advance();
  		    }
  		    return state.pos !== start
  		  };
  		  function isHexDigit(ch) {
  		    return (
  		      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
  		      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
  		      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
  		    )
  		  }
  		  function hexToInt(ch) {
  		    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
  		      return 10 + (ch - 0x41 /* A */)
  		    }
  		    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
  		      return 10 + (ch - 0x61 /* a */)
  		    }
  		    return ch - 0x30 /* 0 */
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  		  // Allows only 0-377(octal) i.e. 0-255(decimal).
  		  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  		    if (this.regexp_eatOctalDigit(state)) {
  		      var n1 = state.lastIntValue;
  		      if (this.regexp_eatOctalDigit(state)) {
  		        var n2 = state.lastIntValue;
  		        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
  		          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
  		        } else {
  		          state.lastIntValue = n1 * 8 + n2;
  		        }
  		      } else {
  		        state.lastIntValue = n1;
  		      }
  		      return true
  		    }
  		    return false
  		  };

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  		  pp$1.regexp_eatOctalDigit = function(state) {
  		    var ch = state.current();
  		    if (isOctalDigit(ch)) {
  		      state.lastIntValue = ch - 0x30; /* 0 */
  		      state.advance();
  		      return true
  		    }
  		    state.lastIntValue = 0;
  		    return false
  		  };
  		  function isOctalDigit(ch) {
  		    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  		  }

  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  		  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  		  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  		  pp$1.regexp_eatFixedHexDigits = function(state, length) {
  		    var start = state.pos;
  		    state.lastIntValue = 0;
  		    for (var i = 0; i < length; ++i) {
  		      var ch = state.current();
  		      if (!isHexDigit(ch)) {
  		        state.pos = start;
  		        return false
  		      }
  		      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
  		      state.advance();
  		    }
  		    return true
  		  };

  		  // Object type used to represent tokens. Note that normally, tokens
  		  // simply exist as properties on the parser object. This is only
  		  // used for the onToken callback and the external tokenizer.

  		  var Token = function Token(p) {
  		    this.type = p.type;
  		    this.value = p.value;
  		    this.start = p.start;
  		    this.end = p.end;
  		    if (p.options.locations)
  		      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  		    if (p.options.ranges)
  		      { this.range = [p.start, p.end]; }
  		  };

  		  // ## Tokenizer

  		  var pp = Parser.prototype;

  		  // Move to the next token

  		  pp.next = function(ignoreEscapeSequenceInKeyword) {
  		    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
  		      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
  		    if (this.options.onToken)
  		      { this.options.onToken(new Token(this)); }

  		    this.lastTokEnd = this.end;
  		    this.lastTokStart = this.start;
  		    this.lastTokEndLoc = this.endLoc;
  		    this.lastTokStartLoc = this.startLoc;
  		    this.nextToken();
  		  };

  		  pp.getToken = function() {
  		    this.next();
  		    return new Token(this)
  		  };

  		  // If we're in an ES6 environment, make parsers iterable
  		  if (typeof Symbol !== "undefined")
  		    { pp[Symbol.iterator] = function() {
  		      var this$1$1 = this;

  		      return {
  		        next: function () {
  		          var token = this$1$1.getToken();
  		          return {
  		            done: token.type === types$1.eof,
  		            value: token
  		          }
  		        }
  		      }
  		    }; }

  		  // Toggle strict mode. Re-reads the next number or string to please
  		  // pedantic tests (`"use strict"; 010;` should fail).

  		  // Read a single token, updating the parser object's token-related
  		  // properties.

  		  pp.nextToken = function() {
  		    var curContext = this.curContext();
  		    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  		    this.start = this.pos;
  		    if (this.options.locations) { this.startLoc = this.curPosition(); }
  		    if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

  		    if (curContext.override) { return curContext.override(this) }
  		    else { this.readToken(this.fullCharCodeAtPos()); }
  		  };

  		  pp.readToken = function(code) {
  		    // Identifier or keyword. '\uXXXX' sequences are allowed in
  		    // identifiers, so '\' also dispatches to that.
  		    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
  		      { return this.readWord() }

  		    return this.getTokenFromCode(code)
  		  };

  		  pp.fullCharCodeAtPos = function() {
  		    var code = this.input.charCodeAt(this.pos);
  		    if (code <= 0xd7ff || code >= 0xdc00) { return code }
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
  		  };

  		  pp.skipBlockComment = function() {
  		    var startLoc = this.options.onComment && this.curPosition();
  		    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  		    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  		    this.pos = end + 2;
  		    if (this.options.locations) {
  		      for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
  		        ++this.curLine;
  		        pos = this.lineStart = nextBreak;
  		      }
  		    }
  		    if (this.options.onComment)
  		      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
  		                             startLoc, this.curPosition()); }
  		  };

  		  pp.skipLineComment = function(startSkip) {
  		    var start = this.pos;
  		    var startLoc = this.options.onComment && this.curPosition();
  		    var ch = this.input.charCodeAt(this.pos += startSkip);
  		    while (this.pos < this.input.length && !isNewLine(ch)) {
  		      ch = this.input.charCodeAt(++this.pos);
  		    }
  		    if (this.options.onComment)
  		      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
  		                             startLoc, this.curPosition()); }
  		  };

  		  // Called at the start of the parse and after every token. Skips
  		  // whitespace and comments, and.

  		  pp.skipSpace = function() {
  		    loop: while (this.pos < this.input.length) {
  		      var ch = this.input.charCodeAt(this.pos);
  		      switch (ch) {
  		      case 32: case 160: // ' '
  		        ++this.pos;
  		        break
  		      case 13:
  		        if (this.input.charCodeAt(this.pos + 1) === 10) {
  		          ++this.pos;
  		        }
  		      case 10: case 8232: case 8233:
  		        ++this.pos;
  		        if (this.options.locations) {
  		          ++this.curLine;
  		          this.lineStart = this.pos;
  		        }
  		        break
  		      case 47: // '/'
  		        switch (this.input.charCodeAt(this.pos + 1)) {
  		        case 42: // '*'
  		          this.skipBlockComment();
  		          break
  		        case 47:
  		          this.skipLineComment(2);
  		          break
  		        default:
  		          break loop
  		        }
  		        break
  		      default:
  		        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
  		          ++this.pos;
  		        } else {
  		          break loop
  		        }
  		      }
  		    }
  		  };

  		  // Called at the end of every token. Sets `end`, `val`, and
  		  // maintains `context` and `exprAllowed`, and skips the space after
  		  // the token, so that the next one's `start` will point at the
  		  // right position.

  		  pp.finishToken = function(type, val) {
  		    this.end = this.pos;
  		    if (this.options.locations) { this.endLoc = this.curPosition(); }
  		    var prevType = this.type;
  		    this.type = type;
  		    this.value = val;

  		    this.updateContext(prevType);
  		  };

  		  // ### Token reading

  		  // This is the function that is called to fetch the next token. It
  		  // is somewhat obscure, because it works in character codes rather
  		  // than characters, and because operator parsing has been inlined
  		  // into it.
  		  //
  		  // All in the name of speed.
  		  //
  		  pp.readToken_dot = function() {
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    if (next >= 48 && next <= 57) { return this.readNumber(true) }
  		    var next2 = this.input.charCodeAt(this.pos + 2);
  		    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
  		      this.pos += 3;
  		      return this.finishToken(types$1.ellipsis)
  		    } else {
  		      ++this.pos;
  		      return this.finishToken(types$1.dot)
  		    }
  		  };

  		  pp.readToken_slash = function() { // '/'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  		    if (next === 61) { return this.finishOp(types$1.assign, 2) }
  		    return this.finishOp(types$1.slash, 1)
  		  };

  		  pp.readToken_mult_modulo_exp = function(code) { // '%*'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    var size = 1;
  		    var tokentype = code === 42 ? types$1.star : types$1.modulo;

  		    // exponentiation operator ** and **=
  		    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
  		      ++size;
  		      tokentype = types$1.starstar;
  		      next = this.input.charCodeAt(this.pos + 2);
  		    }

  		    if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
  		    return this.finishOp(tokentype, size)
  		  };

  		  pp.readToken_pipe_amp = function(code) { // '|&'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    if (next === code) {
  		      if (this.options.ecmaVersion >= 12) {
  		        var next2 = this.input.charCodeAt(this.pos + 2);
  		        if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
  		      }
  		      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
  		    }
  		    if (next === 61) { return this.finishOp(types$1.assign, 2) }
  		    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
  		  };

  		  pp.readToken_caret = function() { // '^'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    if (next === 61) { return this.finishOp(types$1.assign, 2) }
  		    return this.finishOp(types$1.bitwiseXOR, 1)
  		  };

  		  pp.readToken_plus_min = function(code) { // '+-'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    if (next === code) {
  		      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
  		          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
  		        // A `-->` line comment
  		        this.skipLineComment(3);
  		        this.skipSpace();
  		        return this.nextToken()
  		      }
  		      return this.finishOp(types$1.incDec, 2)
  		    }
  		    if (next === 61) { return this.finishOp(types$1.assign, 2) }
  		    return this.finishOp(types$1.plusMin, 1)
  		  };

  		  pp.readToken_lt_gt = function(code) { // '<>'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    var size = 1;
  		    if (next === code) {
  		      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
  		      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
  		      return this.finishOp(types$1.bitShift, size)
  		    }
  		    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
  		        this.input.charCodeAt(this.pos + 3) === 45) {
  		      // `<!--`, an XML-style comment that should be interpreted as a line comment
  		      this.skipLineComment(4);
  		      this.skipSpace();
  		      return this.nextToken()
  		    }
  		    if (next === 61) { size = 2; }
  		    return this.finishOp(types$1.relational, size)
  		  };

  		  pp.readToken_eq_excl = function(code) { // '=!'
  		    var next = this.input.charCodeAt(this.pos + 1);
  		    if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  		    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
  		      this.pos += 2;
  		      return this.finishToken(types$1.arrow)
  		    }
  		    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
  		  };

  		  pp.readToken_question = function() { // '?'
  		    var ecmaVersion = this.options.ecmaVersion;
  		    if (ecmaVersion >= 11) {
  		      var next = this.input.charCodeAt(this.pos + 1);
  		      if (next === 46) {
  		        var next2 = this.input.charCodeAt(this.pos + 2);
  		        if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
  		      }
  		      if (next === 63) {
  		        if (ecmaVersion >= 12) {
  		          var next2$1 = this.input.charCodeAt(this.pos + 2);
  		          if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
  		        }
  		        return this.finishOp(types$1.coalesce, 2)
  		      }
  		    }
  		    return this.finishOp(types$1.question, 1)
  		  };

  		  pp.readToken_numberSign = function() { // '#'
  		    var ecmaVersion = this.options.ecmaVersion;
  		    var code = 35; // '#'
  		    if (ecmaVersion >= 13) {
  		      ++this.pos;
  		      code = this.fullCharCodeAtPos();
  		      if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
  		        return this.finishToken(types$1.privateId, this.readWord1())
  		      }
  		    }

  		    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  		  };

  		  pp.getTokenFromCode = function(code) {
  		    switch (code) {
  		    // The interpretation of a dot depends on whether it is followed
  		    // by a digit or another two dots.
  		    case 46: // '.'
  		      return this.readToken_dot()

  		    // Punctuation tokens.
  		    case 40: ++this.pos; return this.finishToken(types$1.parenL)
  		    case 41: ++this.pos; return this.finishToken(types$1.parenR)
  		    case 59: ++this.pos; return this.finishToken(types$1.semi)
  		    case 44: ++this.pos; return this.finishToken(types$1.comma)
  		    case 91: ++this.pos; return this.finishToken(types$1.bracketL)
  		    case 93: ++this.pos; return this.finishToken(types$1.bracketR)
  		    case 123: ++this.pos; return this.finishToken(types$1.braceL)
  		    case 125: ++this.pos; return this.finishToken(types$1.braceR)
  		    case 58: ++this.pos; return this.finishToken(types$1.colon)

  		    case 96: // '`'
  		      if (this.options.ecmaVersion < 6) { break }
  		      ++this.pos;
  		      return this.finishToken(types$1.backQuote)

  		    case 48: // '0'
  		      var next = this.input.charCodeAt(this.pos + 1);
  		      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
  		      if (this.options.ecmaVersion >= 6) {
  		        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
  		        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
  		      }

  		    // Anything else beginning with a digit is an integer, octal
  		    // number, or float.
  		    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
  		      return this.readNumber(false)

  		    // Quotes produce strings.
  		    case 34: case 39: // '"', "'"
  		      return this.readString(code)

  		    // Operators are parsed inline in tiny state machines. '=' (61) is
  		    // often referred to. `finishOp` simply skips the amount of
  		    // characters it is given as second argument, and returns a token
  		    // of the type given by its first argument.
  		    case 47: // '/'
  		      return this.readToken_slash()

  		    case 37: case 42: // '%*'
  		      return this.readToken_mult_modulo_exp(code)

  		    case 124: case 38: // '|&'
  		      return this.readToken_pipe_amp(code)

  		    case 94: // '^'
  		      return this.readToken_caret()

  		    case 43: case 45: // '+-'
  		      return this.readToken_plus_min(code)

  		    case 60: case 62: // '<>'
  		      return this.readToken_lt_gt(code)

  		    case 61: case 33: // '=!'
  		      return this.readToken_eq_excl(code)

  		    case 63: // '?'
  		      return this.readToken_question()

  		    case 126: // '~'
  		      return this.finishOp(types$1.prefix, 1)

  		    case 35: // '#'
  		      return this.readToken_numberSign()
  		    }

  		    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  		  };

  		  pp.finishOp = function(type, size) {
  		    var str = this.input.slice(this.pos, this.pos + size);
  		    this.pos += size;
  		    return this.finishToken(type, str)
  		  };

  		  pp.readRegexp = function() {
  		    var escaped, inClass, start = this.pos;
  		    for (;;) {
  		      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
  		      var ch = this.input.charAt(this.pos);
  		      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
  		      if (!escaped) {
  		        if (ch === "[") { inClass = true; }
  		        else if (ch === "]" && inClass) { inClass = false; }
  		        else if (ch === "/" && !inClass) { break }
  		        escaped = ch === "\\";
  		      } else { escaped = false; }
  		      ++this.pos;
  		    }
  		    var pattern = this.input.slice(start, this.pos);
  		    ++this.pos;
  		    var flagsStart = this.pos;
  		    var flags = this.readWord1();
  		    if (this.containsEsc) { this.unexpected(flagsStart); }

  		    // Validate pattern
  		    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  		    state.reset(start, pattern, flags);
  		    this.validateRegExpFlags(state);
  		    this.validateRegExpPattern(state);

  		    // Create Literal#value property value.
  		    var value = null;
  		    try {
  		      value = new RegExp(pattern, flags);
  		    } catch (e) {
  		      // ESTree requires null if it failed to instantiate RegExp object.
  		      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  		    }

  		    return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
  		  };

  		  // Read an integer in the given radix. Return null if zero digits
  		  // were read, the integer value otherwise. When `len` is given, this
  		  // will return `null` unless the integer has exactly `len` digits.

  		  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  		    // `len` is used for character escape sequences. In that case, disallow separators.
  		    var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

  		    // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
  		    // and isn't fraction part nor exponent part. In that case, if the first digit
  		    // is zero then disallow separators.
  		    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

  		    var start = this.pos, total = 0, lastCode = 0;
  		    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
  		      var code = this.input.charCodeAt(this.pos), val = (void 0);

  		      if (allowSeparators && code === 95) {
  		        if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
  		        if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
  		        if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
  		        lastCode = code;
  		        continue
  		      }

  		      if (code >= 97) { val = code - 97 + 10; } // a
  		      else if (code >= 65) { val = code - 65 + 10; } // A
  		      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
  		      else { val = Infinity; }
  		      if (val >= radix) { break }
  		      lastCode = code;
  		      total = total * radix + val;
  		    }

  		    if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
  		    if (this.pos === start || len != null && this.pos - start !== len) { return null }

  		    return total
  		  };

  		  function stringToNumber(str, isLegacyOctalNumericLiteral) {
  		    if (isLegacyOctalNumericLiteral) {
  		      return parseInt(str, 8)
  		    }

  		    // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
  		    return parseFloat(str.replace(/_/g, ""))
  		  }

  		  function stringToBigInt(str) {
  		    if (typeof BigInt !== "function") {
  		      return null
  		    }

  		    // `BigInt(value)` throws syntax error if the string contains numeric separators.
  		    return BigInt(str.replace(/_/g, ""))
  		  }

  		  pp.readRadixNumber = function(radix) {
  		    var start = this.pos;
  		    this.pos += 2; // 0x
  		    var val = this.readInt(radix);
  		    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  		    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
  		      val = stringToBigInt(this.input.slice(start, this.pos));
  		      ++this.pos;
  		    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  		    return this.finishToken(types$1.num, val)
  		  };

  		  // Read an integer, octal integer, or floating-point number.

  		  pp.readNumber = function(startsWithDot) {
  		    var start = this.pos;
  		    if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
  		    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  		    if (octal && this.strict) { this.raise(start, "Invalid number"); }
  		    var next = this.input.charCodeAt(this.pos);
  		    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
  		      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
  		      ++this.pos;
  		      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  		      return this.finishToken(types$1.num, val$1)
  		    }
  		    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  		    if (next === 46 && !octal) { // '.'
  		      ++this.pos;
  		      this.readInt(10);
  		      next = this.input.charCodeAt(this.pos);
  		    }
  		    if ((next === 69 || next === 101) && !octal) { // 'eE'
  		      next = this.input.charCodeAt(++this.pos);
  		      if (next === 43 || next === 45) { ++this.pos; } // '+-'
  		      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  		    }
  		    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  		    var val = stringToNumber(this.input.slice(start, this.pos), octal);
  		    return this.finishToken(types$1.num, val)
  		  };

  		  // Read a string value, interpreting backslash-escapes.

  		  pp.readCodePoint = function() {
  		    var ch = this.input.charCodeAt(this.pos), code;

  		    if (ch === 123) { // '{'
  		      if (this.options.ecmaVersion < 6) { this.unexpected(); }
  		      var codePos = ++this.pos;
  		      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
  		      ++this.pos;
  		      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  		    } else {
  		      code = this.readHexChar(4);
  		    }
  		    return code
  		  };

  		  pp.readString = function(quote) {
  		    var out = "", chunkStart = ++this.pos;
  		    for (;;) {
  		      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
  		      var ch = this.input.charCodeAt(this.pos);
  		      if (ch === quote) { break }
  		      if (ch === 92) { // '\'
  		        out += this.input.slice(chunkStart, this.pos);
  		        out += this.readEscapedChar(false);
  		        chunkStart = this.pos;
  		      } else if (ch === 0x2028 || ch === 0x2029) {
  		        if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
  		        ++this.pos;
  		        if (this.options.locations) {
  		          this.curLine++;
  		          this.lineStart = this.pos;
  		        }
  		      } else {
  		        if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
  		        ++this.pos;
  		      }
  		    }
  		    out += this.input.slice(chunkStart, this.pos++);
  		    return this.finishToken(types$1.string, out)
  		  };

  		  // Reads template string tokens.

  		  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  		  pp.tryReadTemplateToken = function() {
  		    this.inTemplateElement = true;
  		    try {
  		      this.readTmplToken();
  		    } catch (err) {
  		      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
  		        this.readInvalidTemplateToken();
  		      } else {
  		        throw err
  		      }
  		    }

  		    this.inTemplateElement = false;
  		  };

  		  pp.invalidStringToken = function(position, message) {
  		    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
  		      throw INVALID_TEMPLATE_ESCAPE_ERROR
  		    } else {
  		      this.raise(position, message);
  		    }
  		  };

  		  pp.readTmplToken = function() {
  		    var out = "", chunkStart = this.pos;
  		    for (;;) {
  		      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
  		      var ch = this.input.charCodeAt(this.pos);
  		      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
  		        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
  		          if (ch === 36) {
  		            this.pos += 2;
  		            return this.finishToken(types$1.dollarBraceL)
  		          } else {
  		            ++this.pos;
  		            return this.finishToken(types$1.backQuote)
  		          }
  		        }
  		        out += this.input.slice(chunkStart, this.pos);
  		        return this.finishToken(types$1.template, out)
  		      }
  		      if (ch === 92) { // '\'
  		        out += this.input.slice(chunkStart, this.pos);
  		        out += this.readEscapedChar(true);
  		        chunkStart = this.pos;
  		      } else if (isNewLine(ch)) {
  		        out += this.input.slice(chunkStart, this.pos);
  		        ++this.pos;
  		        switch (ch) {
  		        case 13:
  		          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
  		        case 10:
  		          out += "\n";
  		          break
  		        default:
  		          out += String.fromCharCode(ch);
  		          break
  		        }
  		        if (this.options.locations) {
  		          ++this.curLine;
  		          this.lineStart = this.pos;
  		        }
  		        chunkStart = this.pos;
  		      } else {
  		        ++this.pos;
  		      }
  		    }
  		  };

  		  // Reads a template token to search for the end, without validating any escape sequences
  		  pp.readInvalidTemplateToken = function() {
  		    for (; this.pos < this.input.length; this.pos++) {
  		      switch (this.input[this.pos]) {
  		      case "\\":
  		        ++this.pos;
  		        break

  		      case "$":
  		        if (this.input[this.pos + 1] !== "{") { break }
  		        // fall through
  		      case "`":
  		        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

  		      case "\r":
  		        if (this.input[this.pos + 1] === "\n") { ++this.pos; }
  		        // fall through
  		      case "\n": case "\u2028": case "\u2029":
  		        ++this.curLine;
  		        this.lineStart = this.pos + 1;
  		        break
  		      }
  		    }
  		    this.raise(this.start, "Unterminated template");
  		  };

  		  // Used to read escaped characters

  		  pp.readEscapedChar = function(inTemplate) {
  		    var ch = this.input.charCodeAt(++this.pos);
  		    ++this.pos;
  		    switch (ch) {
  		    case 110: return "\n" // 'n' -> '\n'
  		    case 114: return "\r" // 'r' -> '\r'
  		    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  		    case 117: return codePointToString(this.readCodePoint()) // 'u'
  		    case 116: return "\t" // 't' -> '\t'
  		    case 98: return "\b" // 'b' -> '\b'
  		    case 118: return "\u000b" // 'v' -> '\u000b'
  		    case 102: return "\f" // 'f' -> '\f'
  		    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  		    case 10: // ' \n'
  		      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
  		      return ""
  		    case 56:
  		    case 57:
  		      if (this.strict) {
  		        this.invalidStringToken(
  		          this.pos - 1,
  		          "Invalid escape sequence"
  		        );
  		      }
  		      if (inTemplate) {
  		        var codePos = this.pos - 1;

  		        this.invalidStringToken(
  		          codePos,
  		          "Invalid escape sequence in template string"
  		        );
  		      }
  		    default:
  		      if (ch >= 48 && ch <= 55) {
  		        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
  		        var octal = parseInt(octalStr, 8);
  		        if (octal > 255) {
  		          octalStr = octalStr.slice(0, -1);
  		          octal = parseInt(octalStr, 8);
  		        }
  		        this.pos += octalStr.length - 1;
  		        ch = this.input.charCodeAt(this.pos);
  		        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
  		          this.invalidStringToken(
  		            this.pos - 1 - octalStr.length,
  		            inTemplate
  		              ? "Octal literal in template string"
  		              : "Octal literal in strict mode"
  		          );
  		        }
  		        return String.fromCharCode(octal)
  		      }
  		      if (isNewLine(ch)) {
  		        // Unicode new line characters after \ get removed from output in both
  		        // template literals and strings
  		        if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
  		        return ""
  		      }
  		      return String.fromCharCode(ch)
  		    }
  		  };

  		  // Used to read character escape sequences ('\x', '\u', '\U').

  		  pp.readHexChar = function(len) {
  		    var codePos = this.pos;
  		    var n = this.readInt(16, len);
  		    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  		    return n
  		  };

  		  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  		  // to whether the word contained a '\u' escape.
  		  //
  		  // Incrementally adds only escaped chars, adding other chunks as-is
  		  // as a micro-optimization.

  		  pp.readWord1 = function() {
  		    this.containsEsc = false;
  		    var word = "", first = true, chunkStart = this.pos;
  		    var astral = this.options.ecmaVersion >= 6;
  		    while (this.pos < this.input.length) {
  		      var ch = this.fullCharCodeAtPos();
  		      if (isIdentifierChar(ch, astral)) {
  		        this.pos += ch <= 0xffff ? 1 : 2;
  		      } else if (ch === 92) { // "\"
  		        this.containsEsc = true;
  		        word += this.input.slice(chunkStart, this.pos);
  		        var escStart = this.pos;
  		        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
  		          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
  		        ++this.pos;
  		        var esc = this.readCodePoint();
  		        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
  		          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
  		        word += codePointToString(esc);
  		        chunkStart = this.pos;
  		      } else {
  		        break
  		      }
  		      first = false;
  		    }
  		    return word + this.input.slice(chunkStart, this.pos)
  		  };

  		  // Read an identifier or keyword token. Will check for reserved
  		  // words when necessary.

  		  pp.readWord = function() {
  		    var word = this.readWord1();
  		    var type = types$1.name;
  		    if (this.keywords.test(word)) {
  		      type = keywords[word];
  		    }
  		    return this.finishToken(type, word)
  		  };

  		  // Acorn is a tiny, fast JavaScript parser written in JavaScript.
  		  //
  		  // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
  		  // various contributors and released under an MIT license.
  		  //
  		  // Git repositories for Acorn are available at
  		  //
  		  //     http://marijnhaverbeke.nl/git/acorn
  		  //     https://github.com/acornjs/acorn.git
  		  //
  		  // Please use the [github bug tracker][ghbt] to report issues.
  		  //
  		  // [ghbt]: https://github.com/acornjs/acorn/issues


  		  var version = "8.15.0";

  		  Parser.acorn = {
  		    Parser: Parser,
  		    version: version,
  		    defaultOptions: defaultOptions,
  		    Position: Position,
  		    SourceLocation: SourceLocation,
  		    getLineInfo: getLineInfo,
  		    Node: Node,
  		    TokenType: TokenType,
  		    tokTypes: types$1,
  		    keywordTypes: keywords,
  		    TokContext: TokContext,
  		    tokContexts: types,
  		    isIdentifierChar: isIdentifierChar,
  		    isIdentifierStart: isIdentifierStart,
  		    Token: Token,
  		    isNewLine: isNewLine,
  		    lineBreak: lineBreak,
  		    lineBreakG: lineBreakG,
  		    nonASCIIwhitespace: nonASCIIwhitespace
  		  };

  		  // The main exported interface (under `self.acorn` when in the
  		  // browser) is a `parse` function that takes a code string and returns
  		  // an abstract syntax tree as specified by the [ESTree spec][estree].
  		  //
  		  // [estree]: https://github.com/estree/estree

  		  function parse(input, options) {
  		    return Parser.parse(input, options)
  		  }

  		  // This function tries to parse a single expression at a given
  		  // offset in a string. Useful for parsing mixed-language formats
  		  // that embed JavaScript expressions.

  		  function parseExpressionAt(input, pos, options) {
  		    return Parser.parseExpressionAt(input, pos, options)
  		  }

  		  // Acorn is organized as a tokenizer and a recursive-descent parser.
  		  // The `tokenizer` export provides an interface to the tokenizer.

  		  function tokenizer(input, options) {
  		    return Parser.tokenizer(input, options)
  		  }

  		  exports.Node = Node;
  		  exports.Parser = Parser;
  		  exports.Position = Position;
  		  exports.SourceLocation = SourceLocation;
  		  exports.TokContext = TokContext;
  		  exports.Token = Token;
  		  exports.TokenType = TokenType;
  		  exports.defaultOptions = defaultOptions;
  		  exports.getLineInfo = getLineInfo;
  		  exports.isIdentifierChar = isIdentifierChar;
  		  exports.isIdentifierStart = isIdentifierStart;
  		  exports.isNewLine = isNewLine;
  		  exports.keywordTypes = keywords;
  		  exports.lineBreak = lineBreak;
  		  exports.lineBreakG = lineBreakG;
  		  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  		  exports.parse = parse;
  		  exports.parseExpressionAt = parseExpressionAt;
  		  exports.tokContexts = types;
  		  exports.tokTypes = types$1;
  		  exports.tokenizer = tokenizer;
  		  exports.version = version;

  		})); 
  	} (acorn, acorn.exports));
  	return acorn.exports;
  }

  var hasRequiredAcorn;

  function requireAcorn () {
  	if (hasRequiredAcorn) return acorn$1;
  	hasRequiredAcorn = 1;
  	Object.defineProperty(acorn$1, "__esModule", { value: true });
  	acorn$1.parse = void 0;
  	// This module is suitable for passing as options.parser when calling
  	// recast.parse to process JavaScript code with Acorn:
  	//
  	//   const ast = recast.parse(source, {
  	//     parser: require("recast/parsers/acorn")
  	//   });
  	//
  	var util_1 = requireUtil();
  	function parse(source, options) {
  	    var comments = [];
  	    var tokens = [];
  	    var ast = requireAcorn$1().parse(source, {
  	        allowHashBang: true,
  	        allowImportExportEverywhere: true,
  	        allowReturnOutsideFunction: true,
  	        ecmaVersion: (0, util_1.getOption)(options, "ecmaVersion", 8),
  	        sourceType: (0, util_1.getOption)(options, "sourceType", "module"),
  	        locations: true,
  	        onComment: comments,
  	        onToken: tokens,
  	    });
  	    if (!ast.comments) {
  	        ast.comments = comments;
  	    }
  	    if (!ast.tokens) {
  	        ast.tokens = tokens;
  	    }
  	    return ast;
  	}
  	acorn$1.parse = parse;
  	return acorn$1;
  }

  var acornExports = requireAcorn();

  /**
   * Parse a js source to generate the AST
   * @param   {string} source - javascript source
   * @param   {object} options - parser options
   * @returns {AST} AST tree
   */
  function generateAST(source, options) {
    return mainExports.parse(source, {
      parser: {
        parse: (source, opts) =>
          acornExports.parse(source, {
            ...opts,
            ecmaVersion: 'latest',
          }),
      },
      ...options,
    })
  }

  const scope = builders.identifier(SCOPE);
  const getName$1 = (node) => (node && node.name ? node.name : node);

  /**
   * Replace the path scope with a member Expression
   * @param   { types.NodePath } path - containing the current node visited
   * @param   { types.Node } property - node we want to prefix with the scope identifier
   * @returns {undefined} this is a void function
   */
  function replacePathScope(path, property) {
    // make sure that for the scope injection the extra parenthesis get removed
    removeExtraParenthesis(property);
    path.replace(builders.memberExpression(scope, property, false));
  }

  /**
   * Change the nodes scope adding the `scope` prefix
   * @param   { types.NodePath } path - containing the current node visited
   * @returns { boolean } return false if we want to stop the tree traversal
   */
  function updateNodeScope(path) {
    if (!isGlobal(path)) {
      replacePathScope(path, path.node);

      return false
    }

    return this.traverse(path)
  }

  /**
   * Change the scope of the member expressions
   * @param   { types.NodePath } path - containing the current node visited
   * @returns { boolean } return always false because we want to check only the first node object
   */
  function visitMemberExpression(path) {
    const traversePathObject = () => this.traverse(path.get('object'));
    const currentObject = path.node.object;

    switch (true) {
      case isGlobal(path):
        if (currentObject.arguments && currentObject.arguments.length) {
          traversePathObject();
        }
        break
      case !path.value.computed && isIdentifier(currentObject):
        replacePathScope(path, path.node);
        break
      default:
        this.traverse(path);
    }

    return false
  }

  /**
   * Objects properties should be handled a bit differently from the Identifier
   * @param   { types.NodePath } path - containing the current node visited
   * @returns { boolean } return false if we want to stop the tree traversal
   */
  function visitObjectProperty(path) {
    const value = path.node.value;
    const isShorthand = path.node.shorthand;

    if (isIdentifier(value) || isMemberExpression(value) || isShorthand) {
      // disable shorthand object properties
      if (isShorthand) path.node.shorthand = false;

      updateNodeScope.call(this, path.get('value'));
    } else {
      this.traverse(path.get('value'));
    }

    return false
  }

  /**
   * The this expressions should be replaced with the scope
   * @param   { types.NodePath } path - containing the current node visited
   * @returns { boolean|undefined } return false if we want to stop the tree traversal
   */
  function visitThisExpression(path) {
    path.replace(scope);
    this.traverse(path);

    return false
  }

  /**
   * Replace the identifiers with the node scope
   * @param   { types.NodePath } path - containing the current node visited
   * @returns { boolean|undefined } return false if we want to stop the tree traversal
   */
  function visitIdentifier(path) {
    const parentValue = path.parent.value;

    if (
      (!isMemberExpression(parentValue) &&
        // Esprima seem to behave differently from the default recast ast parser
        // fix for https://github.com/riot/riot/issues/2983
        parentValue.key !== path.node) ||
      parentValue.computed
    ) {
      updateNodeScope.call(this, path);
    }

    return false
  }

  /**
   * Update the scope of the global nodes
   * @param   {object} ast - ast program
   * @returns {object} the ast program with all the global nodes updated
   */
  function updateNodesScope(ast) {
    const ignorePath = () => false;

    types.visit(ast, {
      visitIdentifier,
      visitMemberExpression,
      visitObjectProperty,
      visitThisExpression,
      visitClassExpression: ignorePath,
    });

    return ast
  }

  /**
   * Convert any expression to an AST tree
   * @param   {object} expression - expression parsed by the riot parser
   * @param   { string } sourceFile - original tag file
   * @param   { string } sourceCode - original tag source code
   * @returns {object} the ast generated
   */
  function createASTFromExpression(expression, sourceFile, sourceCode) {
    const code = sourceFile
      ? addLineOffset(expression.text, sourceCode, expression)
      : expression.text;

    return generateAST(`(${code})`, {
      sourceFileName: sourceFile,
    })
  }

  /**
   * Create the bindings template property
   * @param   {Array} args - arguments to pass to the template function
   * @returns {ASTNode} a binding template key
   */
  function createTemplateProperty(args) {
    return simplePropertyNode(
      BINDING_TEMPLATE_KEY,
      args ? callTemplateFunction(...args) : nullNode(),
    )
  }

  /**
   * Try to get the expression of an attribute node
   * @param   { RiotParser.Node.Attribute } attribute - riot parser attribute node
   * @returns { RiotParser.Node.Expression } attribute expression value
   */
  function getAttributeExpression(attribute) {
    return attribute.expressions
      ? attribute.expressions[0]
      : {
          // if no expression was found try to typecast the attribute value
          ...attribute,
          text: attribute.value,
        }
  }

  /**
   * Wrap the ast generated in a function call providing the scope argument
   * @param   {object} ast - function body
   * @returns {FunctionExpresion} function having the scope argument injected
   */
  function wrapASTInFunctionWithScope(ast) {
    const fn = builders.arrowFunctionExpression([scope], ast);

    // object expressions need to be wrapped in parentheses
    // recast doesn't allow it
    // see also https://github.com/benjamn/recast/issues/985
    if (isObjectExpression(ast)) {
      // doing a small hack here
      // trying to figure out how the recast printer works internally
      ast.extra = {
        parenthesized: true,
      };
    }

    return fn
  }

  /**
   * Convert any parser option to a valid template one
   * @param   { RiotParser.Node.Expression } expression - expression parsed by the riot parser
   * @param   { string } sourceFile - original tag file
   * @param   { string } sourceCode - original tag source code
   * @returns {object} a FunctionExpression object
   * @example
   *  toScopedFunction('foo + bar') // scope.foo + scope.bar
   * @example
   *  toScopedFunction('foo.baz + bar') // scope.foo.baz + scope.bar
   */
  function toScopedFunction(expression, sourceFile, sourceCode) {
    return compose$1(wrapASTInFunctionWithScope, transformExpression)(
      expression,
      sourceFile,
      sourceCode,
    )
  }

  /**
   * Transform an expression node updating its global scope
   * @param   {RiotParser.Node.Expr} expression - riot parser expression node
   * @param   {string} sourceFile - source file
   * @param   {string} sourceCode - source code
   * @returns {ASTExpression} ast expression generated from the riot parser expression node
   */
  function transformExpression(expression, sourceFile, sourceCode) {
    return compose$1(
      removeExtraParenthesis,
      getExpressionAST,
      updateNodesScope,
      createASTFromExpression,
    )(expression, sourceFile, sourceCode)
  }

  /**
   * Remove the extra parents from the compiler generated expressions
   * @param  {AST.Expression} expr - ast expression
   * @returns {AST.Expression} program expression output without parenthesis
   */
  function removeExtraParenthesis(expr) {
    if (expr.extra) expr.extra.parenthesized = false;

    return expr
  }

  /**
   * Get the parsed AST expression of riot expression node
   * @param   {AST.Program} sourceAST - raw node parsed
   * @returns {AST.Expression} program expression output
   */
  function getExpressionAST(sourceAST) {
    const astBody = sourceAST.program.body;

    return astBody[0] ? astBody[0].expression : astBody
  }

  /**
   * Create the template call function
   * @param   {Array|string|Node.Literal} template - template string
   * @param   {Array<AST.Nodes>} bindings - template bindings provided as AST nodes
   * @returns {Node.CallExpression} template call expression
   */
  function callTemplateFunction(template, bindings) {
    return builders.callExpression(builders.identifier(TEMPLATE_FN), [
      template ? builders.literal(template) : nullNode(),
      bindings ? builders.arrayExpression(bindings) : nullNode(),
    ])
  }

  /**
   * Create the template wrapper function injecting the dependencies needed to render the component html
   * @param {Array<AST.Nodes>|AST.BlockStatement} body - function body
   * @returns {AST.Node} arrow function expression
   */
  const createTemplateDependenciesInjectionWrapper = (body) =>
    builders.arrowFunctionExpression(
      [TEMPLATE_FN, EXPRESSION_TYPES, BINDING_TYPES, GET_COMPONENT_FN].map(
        builders.identifier,
      ),
      body,
    );

  /**
   * Convert any DOM attribute into a valid DOM selector useful for the querySelector API
   * @param   { string } attributeName - name of the attribute to query
   * @returns { string } the attribute transformed to a query selector
   */
  const attributeNameToDOMQuerySelector = (attributeName) =>
    `[${attributeName}]`;

  /**
   * Create the properties to query a DOM node
   * @param   { string } attributeName - attribute name needed to identify a DOM node
   * @returns { Array<AST.Node> } array containing the selector properties needed for the binding
   */
  function createSelectorProperties(attributeName) {
    return attributeName
      ? [
          simplePropertyNode(
            BINDING_REDUNDANT_ATTRIBUTE_KEY,
            builders.literal(attributeName),
          ),
          simplePropertyNode(
            BINDING_SELECTOR_KEY,
            compose$1(
              builders.literal,
              attributeNameToDOMQuerySelector,
            )(attributeName),
          ),
        ]
      : []
  }

  /**
   * Clone the node filtering out the selector attribute from the attributes list
   * @param   {RiotParser.Node} node - riot parser node
   * @param   {string} selectorAttribute - name of the selector attribute to filter out
   * @returns {RiotParser.Node} the node with the attribute cleaned up
   */
  function cloneNodeWithoutSelectorAttribute(node, selectorAttribute) {
    return {
      ...node,
      attributes: getAttributesWithoutSelector(
        getNodeAttributes(node),
        selectorAttribute,
      ),
    }
  }

  /**
   * Get the node attributes without the selector one
   * @param   {Array<RiotParser.Attr>} attributes - attributes list
   * @param   {string} selectorAttribute - name of the selector attribute to filter out
   * @returns {Array<RiotParser.Attr>} filtered attributes
   */
  function getAttributesWithoutSelector(attributes, selectorAttribute) {
    if (selectorAttribute)
      return attributes.filter(
        (attribute) => attribute.name !== selectorAttribute,
      )

    return attributes
  }

  /**
   * Clean binding or custom attributes
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {Array<RiotParser.Node.Attr>} only the attributes that are not bindings or directives
   */
  function cleanAttributes(node) {
    return getNodeAttributes(node).filter(
      (attribute) =>
        ![
          IF_DIRECTIVE,
          EACH_DIRECTIVE,
          KEY_ATTRIBUTE,
          SLOT_ATTRIBUTE,
          IS_DIRECTIVE,
        ].includes(attribute.name),
    )
  }

  /**
   * Root node factory function needed for the top root nodes and the nested ones
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {RiotParser.Node} root node
   */
  function rootNodeFactory(node) {
    return {
      nodes: getChildrenNodes(node),
      isRoot: true,
    }
  }

  /**
   * Create a root node proxing only its nodes and attributes
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {RiotParser.Node} root node
   */
  function createRootNode(node) {
    return {
      ...rootNodeFactory(node),
      attributes: compose$1(
        // root nodes should always have attribute expressions
        transformStaticAttributesIntoExpressions,
        // root nodes shouldn't have directives
        cleanAttributes,
      )(node),
    }
  }

  /**
   * Create nested root node. Each and If directives create nested root nodes for example
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {RiotParser.Node} root node
   */
  function createNestedRootNode(node) {
    return {
      ...rootNodeFactory(node),
      isNestedRoot: true,
      attributes: cleanAttributes(node),
    }
  }

  /**
   * Transform the static node attributes into expressions, useful for the root nodes
   * @param   {Array<RiotParser.Node.Attr>} attributes - riot parser node
   * @returns {Array<RiotParser.Node.Attr>} all the attributes received as attribute expressions
   */
  function transformStaticAttributesIntoExpressions(attributes) {
    return attributes.map((attribute) => {
      if (attribute.expressions) return attribute

      return {
        ...attribute,
        expressions: [
          {
            start: attribute.valueStart,
            end: attribute.end,
            text: `'${
            attribute.value
              ? attribute.value
              : // boolean attributes should be treated differently
                attribute[IS_BOOLEAN_ATTRIBUTE]
                ? attribute.name
                : ''
          }'`,
          },
        ],
      }
    })
  }

  /**
   * Get all the child nodes of a RiotParser.Node
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {Array<RiotParser.Node>} all the child nodes found
   */
  function getChildrenNodes(node) {
    return node && node.nodes ? node.nodes : []
  }

  /**
   * Get all the attributes of a riot parser node
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {Array<RiotParser.Node.Attribute>} all the attributes find
   */
  function getNodeAttributes(node) {
    return node.attributes ? node.attributes : []
  }

  /**
   * Create custom tag name function
   * @param   {RiotParser.Node} node - riot parser node
   * @param   {string} sourceFile - original tag file
   * @param   {string} sourceCode - original tag source code
   * @returns {RiotParser.Node.Attr} the node name as expression attribute
   */
  function createCustomNodeNameEvaluationFunction(
    node,
    sourceFile,
    sourceCode,
  ) {
    const isAttribute = findIsAttribute(node);
    const toRawString = (val) => `'${val}'`;

    if (isAttribute) {
      return isAttribute.expressions
        ? wrapASTInFunctionWithScope(
            mergeAttributeExpressions(isAttribute, sourceFile, sourceCode),
          )
        : toScopedFunction(
            {
              ...isAttribute,
              text: toRawString(isAttribute.value),
            },
            sourceFile,
            sourceCode,
          )
    }

    return toScopedFunction(
      { ...node, text: toRawString(getName$1(node)) },
      sourceFile,
      sourceCode,
    )
  }

  /**
   * Convert all the node static attributes to strings
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {string} all the node static concatenated as string
   */
  function staticAttributesToString(node) {
    return findStaticAttributes(node)
      .map((attribute) =>
        attribute[IS_BOOLEAN_ATTRIBUTE] || !attribute.value
          ? attribute.name
          : `${attribute.name}="${unescapeNode(attribute, 'value').value}"`,
      )
      .join(' ')
  }

  /**
   * Make sure that node escaped chars will be unescaped
   * @param   {RiotParser.Node} node - riot parser node
   * @param   {string} key - key property to unescape
   * @returns {RiotParser.Node} node with the text property unescaped
   */
  function unescapeNode(node, key) {
    if (node.unescape) {
      return {
        ...node,
        [key]: unescapeChar(node[key], node.unescape),
      }
    }

    return node
  }

  /**
   * Custom nodes can only render a small subset of their static attributes
   * only the is and the expr attribute can be rendered as static attributes
   * @param {RiotParser.Node} node - a custom element node
   * @param   {string} bindingsSelector - temporary string to identify the current node
   * @returns {Array} list of the attributes that can be statically rendered
   */
  function filterCustomNodeStaticAttributes(node, bindingsSelector) {
    return node.attributes.filter(
      (attribute) =>
        attribute.name === bindingsSelector || attribute.name === IS_DIRECTIVE,
    )
  }

  /**
   * Convert a riot parser opening node into a string
   * @param   {RiotParser.Node} node - riot parser node
   * @param   {string} bindingsSelector - temporary string to identify the current node
   * @returns {string} the node as string
   */
  function nodeToString(node, bindingsSelector) {
    const attributes = staticAttributesToString(
      isCustomNode(node)
        ? { attributes: filterCustomNodeStaticAttributes(node, bindingsSelector) }
        : node,
    );

    switch (true) {
      case isTagNode(node):
        return `<${node.name}${attributes ? ` ${attributes}` : ''}${
        isVoidNode(node) ? '/' : ''
      }>`
      case isTextNode(node):
        return hasExpressions(node)
          ? TEXT_NODE_EXPRESSION_PLACEHOLDER
          : unescapeNode(node, 'text').text
      default:
        return node.text || ''
    }
  }

  /**
   * Close an html node
   * @param   {RiotParser.Node} node - riot parser node
   * @returns {string} the closing tag of the html tag node passed to this function
   */
  function closeTag(node) {
    return node.name ? `</${node.name}>` : ''
  }

  /**
   * Create a strings array with the `join` call to transform it into a string
   * @param   {Array} stringsArray - array containing all the strings to concatenate
   * @returns {AST.CallExpression} array with a `join` call
   */
  function createArrayString(stringsArray) {
    return builders.callExpression(
      builders.memberExpression(
        builders.arrayExpression(stringsArray),
        builders.identifier('join'),
        false,
      ),
      [builders.literal('')],
    )
  }

  /**
   * Simple expression bindings might contain multiple expressions like for example: "class="{foo} red {bar}""
   * This helper aims to merge them into a template literal if it's necessary
   * @param   {RiotParser.Attr} node - riot parser node
   * @param   {string} sourceFile - original tag file
   * @param   {string} sourceCode - original tag source code
   * @returns {object} a template literal expression object
   */
  function mergeAttributeExpressions(node, sourceFile, sourceCode) {
    switch (true) {
      // static attributes don't need to be merged, nor expression transformations are needed
      case !hasExpressions(node) && node.parts.length === 1:
        return builders.literal(node.parts[0])
      // if there are no node parts or there is just one item we just create a simple expression literal
      case !node.parts || node.parts.length === 1:
        return transformExpression(node.expressions[0], sourceFile, sourceCode)
      default:
        // merge the siblings expressions into a single array literal
        return createArrayString(
          [
            // fold the expression parts into a single array
            ...node.parts.reduce((acc, str) => {
              const expression = node.expressions.find(
                (e) => e.text.trim() === str,
              );

              return [
                ...acc,
                expression
                  ? transformExpression(expression, sourceFile, sourceCode)
                  : builders.literal(encodeHTMLEntities(str)),
              ]
            }, []),
            // filter out invalid items that are not literal or have no value
          ].filter((expr) => !isLiteral(expr) || expr.value),
        )
    }
  }

  /**
   * Create a selector that will be used to find the node via dom-bindings
   * @param   {number} id - temporary variable that will be increased anytime this function will be called
   * @returns {string} selector attribute needed to bind a riot expression
   */
  const createBindingSelector = (function createSelector(id = 0) {
    return () => `${BINDING_SELECTOR_PREFIX}${id++}`
  })();

  /**
   * Create the AST array containing the attributes to bind to this node
   * @param   { RiotParser.Node.Tag } sourceNode - the custom tag
   * @param   { string } selectorAttribute - attribute needed to select the target node
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns {AST.ArrayExpression} array containing the slot objects
   */
  function createBindingAttributes(
    sourceNode,
    selectorAttribute,
    sourceFile,
    sourceCode,
  ) {
    return builders.arrayExpression([
      ...compose$1(
        (attributes) =>
          attributes.map((attribute) =>
            createExpression(attribute, sourceFile, sourceCode, 0, sourceNode),
          ),
        (attributes) =>
          getAttributesWithoutSelector(attributes, selectorAttribute),
        cleanAttributes,
      )(sourceNode),
    ])
  }

  /**
   * Create an attribute evaluation function
   * @param   {RiotParser.Attr} sourceNode - riot parser node
   * @param   {string} sourceFile - original tag file
   * @param   {string} sourceCode - original tag source code
   * @returns { AST.Node } an AST function expression to evaluate the attribute value
   */
  function createAttributeEvaluationFunction(
    sourceNode,
    sourceFile,
    sourceCode,
  ) {
    return wrapASTInFunctionWithScope(
      mergeAttributeExpressions(sourceNode, sourceFile, sourceCode),
    )
  }

  /**
   * Return a source map as JSON, it it has not the toJSON method it means it can
   * be used right the way
   * @param   {SourceMapGenerator | object} map - a sourcemap generator or simply an json object
   * @returns {object} the source map as JSON
   */
  function sourcemapAsJSON(map) {
    if (map && map.toJSON) return map.toJSON()
    return map
  }

  var utilExports = requireUtil();

  /**
   * Compose two sourcemaps
   * @param   { SourceMapGenerator } formerMap - original sourcemap
   * @param   { SourceMapGenerator } latterMap - target sourcemap
   * @returns {object} sourcemap json
   */
  function composeSourcemaps(formerMap, latterMap) {
    if (isNode() && formerMap && latterMap && latterMap.mappings) {
      return utilExports.composeSourceMaps(sourcemapAsJSON(formerMap), sourcemapAsJSON(latterMap))
    } else if (isNode() && formerMap) {
      return sourcemapAsJSON(formerMap)
    }

    return {}
  }

  /**
   * Create a new sourcemap generator
   * @param   {object} options - sourcemap options
   * @returns { SourceMapGenerator } SourceMapGenerator instance
   */
  function createSourcemap(options) {
    return new SourceMapGenerator()
  }

  const Output = Object.freeze({
    code: '',
    ast: [],
    meta: {},
    map: null,
  });

  /**
   * Create the right output data result of a parsing
   * @param   {object} data - output data
   * @param   { string } data.code - code generated
   * @param   { AST } data.ast - ast representing the code
   * @param   { SourceMapGenerator } data.map - source map generated along with the code
   * @param   {object} meta - compilation meta infomration
   * @returns { Output } output container object
   */
  function createOutput(data, meta) {
    const output = {
      ...Output,
      ...data,
      meta,
    };

    if (!output.map && meta && meta.options && meta.options.file)
      return {
        ...output,
        map: createSourcemap({ file: meta.options.file }),
      }

    return output
  }

  /**
   * Transform the source code received via a compiler function
   * @param   { Function } compiler - function needed to generate the output code
   * @param   {object} meta - compilation meta information
   * @param   { string } source - source code
   * @returns { Output } output - the result of the compiler
   */
  function transform(compiler, meta, source) {
    const result = compiler ? compiler(source, meta) : { code: source };
    return createOutput(result, meta)
  }

  const postprocessors = new Set();

  /**
   * Register a postprocessor that will be used after the parsing and compilation of the riot tags
   * @param { Function } postprocessor - transformer that will receive the output code ans sourcemap
   * @returns { Set } the postprocessors collection
   */
  function register$1(postprocessor) {
    if (postprocessors.has(postprocessor)) {
      panic$1(
        `This postprocessor "${
        postprocessor.name || postprocessor.toString()
      }" was already registered`,
      );
    }

    postprocessors.add(postprocessor);

    return postprocessors
  }

  /**
   * Exec all the postprocessors in sequence combining the sourcemaps generated
   * @param   { Output } compilerOutput - output generated by the compiler
   * @param   {object} meta - compiling meta information
   * @returns { Output } object containing output code and source map
   */
  function execute$1(compilerOutput, meta) {
    return Array.from(postprocessors).reduce(
      function (acc, postprocessor) {
        const { code, map } = acc;
        const output = postprocessor(code, meta);

        return {
          code: output.code,
          map: composeSourcemaps(map, output.map),
        }
      },
      createOutput(compilerOutput, meta),
    )
  }

  /**
   * Parsers that can be registered by users to preparse components fragments
   * @type {object}
   */
  const preprocessors = Object.freeze({
    javascript: new Map(),
    css: new Map(),
    template: new Map().set('default', (code) => ({ code })),
  });

  // throw a processor type error
  function preprocessorTypeError(type) {
    panic$1(
      `No preprocessor of type "${type}" was found, please make sure to use one of these: 'javascript', 'css' or 'template'`,
    );
  }

  // throw an error if the preprocessor was not registered
  function preprocessorNameNotFoundError(name) {
    panic$1(
      `No preprocessor named "${name}" was found, are you sure you have registered it?'`,
    );
  }

  /**
   * Register a custom preprocessor
   * @param   { string } type - preprocessor type either 'js', 'css' or 'template'
   * @param   { string } name - unique preprocessor id
   * @param   { Function } preprocessor - preprocessor function
   * @returns { Map } - the preprocessors map
   */
  function register$2(type, name, preprocessor) {
    if (!type)
      panic$1(
        "Please define the type of preprocessor you want to register 'javascript', 'css' or 'template'",
      );
    if (!name) panic$1('Please define a name for your preprocessor');
    if (!preprocessor) panic$1('Please provide a preprocessor function');
    if (!preprocessors[type]) preprocessorTypeError(type);
    if (preprocessors[type].has(name))
      panic$1(`The preprocessor ${name} was already registered before`);

    preprocessors[type].set(name, preprocessor);

    return preprocessors
  }

  /**
   * Exec the compilation of a preprocessor
   * @param   { string } type - preprocessor type either 'js', 'css' or 'template'
   * @param   { string } name - unique preprocessor id
   * @param   {object} meta - preprocessor meta information
   * @param   { string } source - source code
   * @returns { Output } object containing a sourcemap and a code string
   */
  function execute(type, name, meta, source) {
    if (!preprocessors[type]) preprocessorTypeError(type);
    if (!preprocessors[type].has(name)) preprocessorNameNotFoundError(name);

    return transform(preprocessors[type].get(name), meta, source)
  }

  /**
   * Simple clone deep function, do not use it for classes or recursive objects!
   * @param   {*} source - possibily an object to clone
   * @returns {*} the object we wanted to clone
   */
  function cloneDeep(source) {
    return JSON.parse(JSON.stringify(source))
  }

  /**
   * Generate the javascript from an ast source
   * @param   {AST} ast - ast object
   * @param   {object} options - printer options
   * @returns {object} code + map
   */
  function generateJavascript(ast, options) {
    return mainExports.print(ast, {
      ...options,
      parser: {
        parse: (source, opts) =>
          acornExports.parse(source, {
            ...opts,
            ecmaVersion: 'latest',
          }),
      },
      tabWidth: 2,
      wrapColumn: 0,
      quote: 'single',
    })
  }

  const getEachItemName = (expression) =>
    isSequenceExpression(expression.left)
      ? expression.left.expressions[0]
      : expression.left;
  const getEachIndexName = (expression) =>
    isSequenceExpression(expression.left) ? expression.left.expressions[1] : null;
  const getEachValue = (expression) => expression.right;
  const nameToliteral = compose$1(builders.literal, getName$1);

  const generateEachItemNameKey = (expression) =>
    simplePropertyNode(
      BINDING_ITEM_NAME_KEY,
      compose$1(nameToliteral, getEachItemName)(expression),
    );

  const generateEachIndexNameKey = (expression) =>
    simplePropertyNode(
      BINDING_INDEX_NAME_KEY,
      compose$1(nameToliteral, getEachIndexName)(expression),
    );

  const generateEachEvaluateKey = (
    expression,
    eachExpression,
    sourceFile,
    sourceCode,
  ) =>
    simplePropertyNode(
      BINDING_EVALUATE_KEY,
      compose$1(
        (e) => toScopedFunction(e, sourceFile, sourceCode),
        (e) => ({
          ...eachExpression,
          text: generateJavascript(e).code,
        }),
        getEachValue,
      )(expression),
    );

  /**
   * Get the each expression properties to create properly the template binding
   * @param   { DomBinding.Expression } eachExpression - original each expression data
   * @param   { string } sourceFile - original tag file
   * @param   { string } sourceCode - original tag source code
   * @returns { Array } AST nodes that are needed to build an each binding
   */
  function generateEachExpressionProperties(
    eachExpression,
    sourceFile,
    sourceCode,
  ) {
    const ast = createASTFromExpression(eachExpression, sourceFile, sourceCode);
    const body = ast.program.body;
    const firstNode = body[0];

    if (!isExpressionStatement(firstNode)) {
      panic$1(
        `The each directives supported should be of type "ExpressionStatement",you have provided a "${firstNode.type}"`,
      );
    }

    const { expression } = firstNode;

    return [
      generateEachItemNameKey(expression),
      generateEachIndexNameKey(expression),
      generateEachEvaluateKey(expression, eachExpression, sourceFile, sourceCode),
    ]
  }

  /**
   * Transform a RiotParser.Node.Tag into an each binding
   * @param   { RiotParser.Node.Tag } sourceNode - tag containing the each attribute
   * @param   { string } selectorAttribute - attribute needed to select the target node
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns { AST.Node } an each binding node
   */
  function createEachBinding(
    sourceNode,
    selectorAttribute,
    sourceFile,
    sourceCode,
  ) {
    const [ifAttribute, eachAttribute, keyAttribute] = [
      findIfAttribute,
      findEachAttribute,
      findKeyAttribute,
    ].map((f) => f(sourceNode));
    const attributeOrNull = (attribute) =>
      attribute
        ? toScopedFunction(
            getAttributeExpression(attribute),
            sourceFile,
            sourceCode,
          )
        : nullNode();

    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(BINDING_TYPES),
          builders.identifier(EACH_BINDING_TYPE),
          false,
        ),
      ),
      simplePropertyNode(BINDING_GET_KEY_KEY, attributeOrNull(keyAttribute)),
      simplePropertyNode(BINDING_CONDITION_KEY, attributeOrNull(ifAttribute)),
      createTemplateProperty(
        createNestedBindings(
          sourceNode,
          sourceFile,
          sourceCode,
          selectorAttribute,
        ),
      ),
      ...createSelectorProperties(selectorAttribute),
      ...compose$1(
        generateEachExpressionProperties,
        getAttributeExpression,
      )(eachAttribute),
    ])
  }

  /**
   * Transform a RiotParser.Node.Tag into an if binding
   * @param   { RiotParser.Node.Tag } sourceNode - tag containing the if attribute
   * @param   { string } selectorAttribute - attribute needed to select the target node
   * @param   { stiring } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns { AST.Node } an if binding node
   */
  function createIfBinding(
    sourceNode,
    selectorAttribute,
    sourceFile,
    sourceCode,
  ) {
    const ifAttribute = findIfAttribute(sourceNode);

    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(BINDING_TYPES),
          builders.identifier(IF_BINDING_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        toScopedFunction(ifAttribute.expressions[0], sourceFile, sourceCode),
      ),
      ...createSelectorProperties(selectorAttribute),
      createTemplateProperty(
        createNestedBindings(
          sourceNode,
          sourceFile,
          sourceCode,
          selectorAttribute,
        ),
      ),
    ])
  }

  /**
   * Create the text node expressions
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @returns {Array} array containing all the text node expressions
   */
  function createTextNodeExpressions(sourceNode, sourceFile, sourceCode) {
    const childrenNodes = getChildrenNodes(sourceNode);

    return childrenNodes
      .filter(isTextNode)
      .filter(hasExpressions)
      .map((node) =>
        createExpression(
          node,
          sourceFile,
          sourceCode,
          childrenNodes.indexOf(node),
          sourceNode,
        ),
      )
  }

  /**
   * Add a simple binding to a riot parser node
   * @param   { RiotParser.Node.Tag } sourceNode - tag containing the if attribute
   * @param   { string } selectorAttribute - attribute needed to select the target node
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns { AST.Node } an each binding node
   */
  function createSimpleBinding(
    sourceNode,
    selectorAttribute,
    sourceFile,
    sourceCode,
  ) {
    return builders.objectExpression([
      // root or removable nodes do not need selectors
      ...(isRemovableNode(sourceNode) || isRootNode(sourceNode)
        ? []
        : createSelectorProperties(selectorAttribute)),
      simplePropertyNode(
        BINDING_EXPRESSIONS_KEY,
        builders.arrayExpression([
          ...createTextNodeExpressions(sourceNode, sourceFile, sourceCode),
          ...createAttributeExpressions(sourceNode, sourceFile, sourceCode),
        ]),
      ),
    ])
  }

  /**
   * Transform a RiotParser.Node.Tag of type slot into a slot binding
   * @param   { RiotParser.Node.Tag } sourceNode - slot node
   * @param   { string } selectorAttribute - attribute needed to select the target node
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns { AST.Node } a slot binding node
   */
  function createSlotBinding(
    sourceNode,
    selectorAttribute,
    sourceFile,
    sourceCode,
  ) {
    const slotNameAttribute = findAttribute(NAME_ATTRIBUTE, sourceNode);
    const slotName = slotNameAttribute
      ? slotNameAttribute.value
      : DEFAULT_SLOT_NAME;

    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(BINDING_TYPES),
          builders.identifier(SLOT_BINDING_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_ATTRIBUTES_KEY,
        createBindingAttributes(
          {
            ...sourceNode,
            // filter the name attribute
            attributes: getNodeAttributes(sourceNode).filter(
              (attribute) => getName$1(attribute) !== NAME_ATTRIBUTE,
            ),
          },
          selectorAttribute,
          sourceFile,
          sourceCode,
        ),
      ),
      simplePropertyNode(BINDING_NAME_KEY, builders.literal(slotName)),
      getChildrenNodes(sourceNode).length
        ? createTemplateProperty(
            createNestedBindings(
              // the root attributes should be removed
              { ...sourceNode, attributes: [] },
              sourceFile,
              sourceCode,
              selectorAttribute,
            ),
          )
        : simplePropertyNode(BINDING_TEMPLATE_KEY, builders.nullLiteral()),
      ...createSelectorProperties(selectorAttribute),
    ])
  }

  /**
   * Find the slots in the current component and group them under the same id
   * @param   {RiotParser.Node.Tag} sourceNode - the custom tag
   * @returns {object} object containing all the slots grouped by name
   */
  function groupSlots(sourceNode) {
    return getChildrenNodes(sourceNode).reduce(
      (acc, node) => {
        const slotAttribute = findSlotAttribute(node);

        if (slotAttribute) {
          acc[slotAttribute.value] = node;
        } else {
          acc.default = createNestedRootNode({
            nodes: [...getChildrenNodes(acc.default), node],
          });
        }

        return acc
      },
      {
        default: null,
      },
    )
  }

  /**
   * Create the slot entity to pass to the riot-dom bindings
   * @param   {string} id - slot id
   * @param   {RiotParser.Node.Tag} sourceNode - slot root node
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @returns {AST.Node} ast node containing the slot object properties
   */
  function buildSlot(id, sourceNode, sourceFile, sourceCode) {
    const cloneNode = {
      ...sourceNode,
      attributes: getNodeAttributes(sourceNode),
    };

    // If the node is an empty slot we do not create the html key (https://github.com/riot/riot/issues/3055)
    const [html, bindings] =
      isSlotNode(cloneNode) && !hasChildrenNodes(cloneNode)
        ? [null, null]
        : build(cloneNode, sourceFile, sourceCode);

    return builders.objectExpression(
      [
        simplePropertyNode(BINDING_ID_KEY, builders.literal(id)),
        html
          ? simplePropertyNode(BINDING_HTML_KEY, builders.literal(html))
          : null,
        bindings
          ? simplePropertyNode(
              BINDING_BINDINGS_KEY,
              builders.arrayExpression(bindings),
            )
          : null,
      ].filter(Boolean),
    )
  }

  /**
   * Create the AST array containing the slots
   * @param   { RiotParser.Node.Tag } sourceNode - the custom tag
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns {AST.ArrayExpression} array containing the attributes to bind
   */
  function createSlotsArray(sourceNode, sourceFile, sourceCode) {
    return builders.arrayExpression([
      ...compose$1(
        (slots) =>
          slots.map(([key, value]) =>
            buildSlot(key, value, sourceFile, sourceCode),
          ),
        (slots) => slots.filter(([, value]) => value),
        Object.entries,
        groupSlots,
      )(sourceNode),
    ])
  }

  /**
   * Find the slot attribute if it exists
   * @param   {RiotParser.Node.Tag} sourceNode - the custom tag
   * @returns {RiotParser.Node.Attr|undefined} the slot attribute found
   */
  function findSlotAttribute(sourceNode) {
    return getNodeAttributes(sourceNode).find(
      (attribute) => attribute.name === SLOT_ATTRIBUTE,
    )
  }

  /**
   * Transform a RiotParser.Node.Tag into a tag binding
   * @param   { RiotParser.Node.Tag } sourceNode - the custom tag
   * @param   { string } selectorAttribute - attribute needed to select the target node
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns { AST.Node } tag binding node
   */
  function createTagBinding(
    sourceNode,
    selectorAttribute,
    sourceFile,
    sourceCode,
  ) {
    return builders.objectExpression([
      simplePropertyNode(
        BINDING_TYPE_KEY,
        builders.memberExpression(
          builders.identifier(BINDING_TYPES),
          builders.identifier(TAG_BINDING_TYPE),
          false,
        ),
      ),
      simplePropertyNode(
        BINDING_GET_COMPONENT_KEY,
        builders.identifier(GET_COMPONENT_FN),
      ),
      simplePropertyNode(
        BINDING_EVALUATE_KEY,
        createCustomNodeNameEvaluationFunction(
          sourceNode,
          sourceFile,
          sourceCode,
        ),
      ),
      simplePropertyNode(
        BINDING_SLOTS_KEY,
        createSlotsArray(sourceNode, sourceFile, sourceCode),
      ),
      simplePropertyNode(
        BINDING_ATTRIBUTES_KEY,
        createBindingAttributes(
          sourceNode,
          selectorAttribute,
          sourceFile,
          sourceCode,
        ),
      ),
      ...createSelectorProperties(selectorAttribute),
    ])
  }

  const BuildingState = Object.freeze({
    html: [],
    bindings: [],
    parent: null,
  });

  /**
   * Nodes having bindings should be cloned and new selector properties should be added to them
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} bindingsSelector - temporary string to identify the current node
   * @returns {RiotParser.Node} the original node parsed having the new binding selector attribute
   */
  function createBindingsTag(sourceNode, bindingsSelector) {
    if (!bindingsSelector) return sourceNode

    return {
      ...sourceNode,
      // inject the selector bindings into the node attributes
      attributes: [
        {
          name: bindingsSelector,
          value: bindingsSelector,
        },
        ...getNodeAttributes(sourceNode),
      ],
    }
  }

  /**
   * Create a generic dynamic node (text or tag) and generate its bindings
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @param   {BuildingState} state - state representing the current building tree state during the recursion
   * @returns {Array} array containing the html output and bindings for the current node
   */
  function createDynamicNode(sourceNode, sourceFile, sourceCode, state) {
    switch (true) {
      case isTextNode(sourceNode):
        // text nodes will not have any bindings
        return [nodeToString(sourceNode), []]
      default:
        return createTagWithBindings(sourceNode, sourceFile, sourceCode)
    }
  }

  /**
   * Create only a dynamic tag node with generating a custom selector and its bindings
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @returns {Array} array containing the html output and bindings for the current node
   */
  function createTagWithBindings(sourceNode, sourceFile, sourceCode) {
    const bindingsSelector = isRootNode(sourceNode)
      ? null
      : createBindingSelector();
    const cloneNode = createBindingsTag(sourceNode, bindingsSelector);
    const tagOpeningHTML = nodeToString(cloneNode, bindingsSelector);

    switch (true) {
      case hasEachAttribute(cloneNode):
        // EACH bindings have prio 1
        return [
          tagOpeningHTML,
          [createEachBinding(cloneNode, bindingsSelector, sourceFile, sourceCode)],
        ]
      case hasIfAttribute(cloneNode):
        // IF bindings have prio 2
        return [
          tagOpeningHTML,
          [createIfBinding(cloneNode, bindingsSelector, sourceFile, sourceCode)],
        ]
      case isCustomNode(cloneNode):
        // TAG bindings have prio 3
        return [
          tagOpeningHTML,
          [createTagBinding(cloneNode, bindingsSelector, sourceFile, sourceCode)],
        ]
      case isSlotNode(cloneNode):
        // slot tag
        return [
          tagOpeningHTML,
          [createSlotBinding(cloneNode, bindingsSelector, sourceFile, sourceCode)],
        ]
      default:
        // this node has expressions bound to it
        return [
          tagOpeningHTML,
          [createSimpleBinding(cloneNode, bindingsSelector, sourceFile, sourceCode)],
        ]
    }
  }

  /**
   * Parse a node trying to extract its template and bindings
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @param   {BuildingState} state - state representing the current building tree state during the recursion
   * @returns {Array} array containing the html output and bindings for the current node
   */
  function parseNode(sourceNode, sourceFile, sourceCode, state) {
    // static nodes have no bindings
    if (isStaticNode(sourceNode)) return [nodeToString(sourceNode), []]
    return createDynamicNode(sourceNode, sourceFile, sourceCode)
  }

  /**
   * Create the tag binding
   * @param   { RiotParser.Node.Tag } sourceNode - tag containing the each attribute
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @param   { string } selector - binding selector
   * @returns { Array } array with only the tag binding AST
   */
  function createNestedBindings(
    sourceNode,
    sourceFile,
    sourceCode,
    selector,
  ) {
    const mightBeARiotComponent = isCustomNode(sourceNode);
    const node = cloneNodeWithoutSelectorAttribute(sourceNode, selector);

    return mightBeARiotComponent
      ? [null, [createTagBinding(node, null, sourceFile, sourceCode)]]
      : build(createNestedRootNode(node), sourceFile, sourceCode)
  }

  /**
   * Build the template and the bindings
   * @param   {RiotParser.Node} sourceNode - any kind of node parsed via riot parser
   * @param   {string} sourceFile - source file path
   * @param   {string} sourceCode - original source
   * @param   {BuildingState} state - state representing the current building tree state during the recursion
   * @returns {Array} array containing the html output and the dom bindings
   */
  function build(sourceNode, sourceFile, sourceCode, state) {
    if (!sourceNode)
      panic$1(
        "Something went wrong with your tag DOM parsing, your tag template can't be created",
      );

    const [nodeHTML, nodeBindings] = parseNode(
      sourceNode,
      sourceFile,
      sourceCode);
    const childrenNodes = getChildrenNodes(sourceNode);
    const canRenderNodeHTML = isRemovableNode(sourceNode) === false;
    const currentState = { ...cloneDeep(BuildingState), ...state };

    // mutate the original arrays
    canRenderNodeHTML && currentState.html.push(...nodeHTML);
    currentState.bindings.push(...nodeBindings);

    // do recursion if
    // this tag has children and it has no special directives bound to it
    if (childrenNodes.length && !hasItsOwnTemplate(sourceNode)) {
      childrenNodes.forEach((node) =>
        build(node, sourceFile, sourceCode, {
          parent: sourceNode,
          ...currentState,
        }),
      );
    }

    // close the tag if it's not a void one
    if (canRenderNodeHTML && isTagNode(sourceNode) && !isVoidNode(sourceNode)) {
      currentState.html.push(closeTag(sourceNode));
    }

    return [currentState.html.join(''), currentState.bindings]
  }

  /*! https://mths.be/cssesc v3.0.0 by @mathias */

  var cssesc_1;
  var hasRequiredCssesc;

  function requireCssesc () {
  	if (hasRequiredCssesc) return cssesc_1;
  	hasRequiredCssesc = 1;

  	var object = {};
  	var hasOwnProperty = object.hasOwnProperty;
  	var merge = function merge(options, defaults) {
  		if (!options) {
  			return defaults;
  		}
  		var result = {};
  		for (var key in defaults) {
  			// `if (defaults.hasOwnProperty(key) { … }` is not needed here, since
  			// only recognized option names are used.
  			result[key] = hasOwnProperty.call(options, key) ? options[key] : defaults[key];
  		}
  		return result;
  	};

  	var regexAnySingleEscape = /[ -,\.\/:-@\[-\^`\{-~]/;
  	var regexSingleEscape = /[ -,\.\/:-@\[\]\^`\{-~]/;
  	var regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

  	// https://mathiasbynens.be/notes/css-escapes#css
  	var cssesc = function cssesc(string, options) {
  		options = merge(options, cssesc.options);
  		if (options.quotes != 'single' && options.quotes != 'double') {
  			options.quotes = 'single';
  		}
  		var quote = options.quotes == 'double' ? '"' : '\'';
  		var isIdentifier = options.isIdentifier;

  		var firstChar = string.charAt(0);
  		var output = '';
  		var counter = 0;
  		var length = string.length;
  		while (counter < length) {
  			var character = string.charAt(counter++);
  			var codePoint = character.charCodeAt();
  			var value = void 0;
  			// If it’s not a printable ASCII character…
  			if (codePoint < 0x20 || codePoint > 0x7E) {
  				if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
  					// It’s a high surrogate, and there is a next character.
  					var extra = string.charCodeAt(counter++);
  					if ((extra & 0xFC00) == 0xDC00) {
  						// next character is low surrogate
  						codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
  					} else {
  						// It’s an unmatched surrogate; only append this code unit, in case
  						// the next code unit is the high surrogate of a surrogate pair.
  						counter--;
  					}
  				}
  				value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
  			} else {
  				if (options.escapeEverything) {
  					if (regexAnySingleEscape.test(character)) {
  						value = '\\' + character;
  					} else {
  						value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
  					}
  				} else if (/[\t\n\f\r\x0B]/.test(character)) {
  					value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
  				} else if (character == '\\' || !isIdentifier && (character == '"' && quote == character || character == '\'' && quote == character) || isIdentifier && regexSingleEscape.test(character)) {
  					value = '\\' + character;
  				} else {
  					value = character;
  				}
  			}
  			output += value;
  		}

  		if (isIdentifier) {
  			if (/^-[-\d]/.test(output)) {
  				output = '\\-' + output.slice(1);
  			} else if (/\d/.test(firstChar)) {
  				output = '\\3' + firstChar + ' ' + output.slice(1);
  			}
  		}

  		// Remove spaces after `\HEX` escapes that are not followed by a hex digit,
  		// since they’re redundant. Note that this is only possible if the escape
  		// sequence isn’t preceded by an odd number of backslashes.
  		output = output.replace(regexExcessiveSpaces, function ($0, $1, $2) {
  			if ($1 && $1.length % 2) {
  				// It’s not safe to remove the space, so don’t.
  				return $0;
  			}
  			// Strip the space.
  			return ($1 || '') + $2;
  		});

  		if (!isIdentifier && options.wrap) {
  			return quote + output + quote;
  		}
  		return output;
  	};

  	// Expose default options (so they can be overridden globally).
  	cssesc.options = {
  		'escapeEverything': false,
  		'isIdentifier': false,
  		'quotes': 'single',
  		'wrap': false
  	};

  	cssesc.version = '3.0.0';

  	cssesc_1 = cssesc;
  	return cssesc_1;
  }

  var cssescExports = requireCssesc();
  var cssEscape = /*@__PURE__*/getDefaultExportFromCjs(cssescExports);

  /* MAIN */
  const TOKEN_TYPE = {
      SELECTOR: 1,
      BODY_START: 2,
      BODY_END: 3
  };

  /* MAIN */
  const getIndexes = (str, substr) => {
      const indexes = [];
      const substrLength = substr.length;
      let indexFrom = 0;
      while (true) {
          const index = str.indexOf(substr, indexFrom);
          if (index === -1)
              return indexes;
          indexes.push(index);
          indexFrom = index + substrLength;
      }
  };

  /* IMPORT */
  const { SELECTOR: SELECTOR$1, BODY_START: BODY_START$1, BODY_END: BODY_END$1 } = TOKEN_TYPE;
  /* HELPERS */
  const mergeTokensSorted = (t1, t2) => {
      let length = t1.length + t2.length;
      let i = t1.length - 1;
      let j = t2.length - 1;
      const merged = new Array(length);
      while (length > 0) {
          merged[--length] = (j < 0 || (i >= 0 && t1[i].index > t2[j].index)) ? t1[i--] : t2[j--];
      }
      return merged;
  };
  const mergeTokensSortedEvenOdd = (t1, t2) => {
      const length = t1.length;
      const merged = new Array(length * 2);
      for (let i = 0, j = 0; i < length; i++, j += 2) {
          merged[j] = t1[i];
          merged[j + 1] = t2[i];
      }
      return merged;
  };
  const findSelectorStartIndex = (tokens, tokenIndexStart = 0, limit) => {
      let lastIndex = 0;
      let lastTokenIndex = tokenIndexStart;
      for (let i = tokenIndexStart, l = tokens.length; i < l; i++) {
          const token = tokens[i];
          const index = token.index;
          if (index >= limit)
              break;
          lastIndex = (token.type === BODY_START$1) ? index : index + 1;
          lastTokenIndex = i + 1;
      }
      return [lastIndex, lastTokenIndex];
  };
  /* MAIN */
  const tokenizer = (css) => {
      /* VARIABLES */
      const startIndexes = getIndexes(css, '{');
      const endIndexes = getIndexes(css, '}');
      const selectorTokens = new Array(startIndexes.length);
      const startTokens = new Array(startIndexes.length);
      const endTokens = new Array(endIndexes.length);
      let selectorIndex = 0;
      let startIndex = 0;
      let endIndex = 0;
      /* BODY_START */
      for (let i = 0, l = startIndexes.length; i < l; i++) {
          startTokens[startIndex++] = {
              type: BODY_START$1,
              index: startIndexes[i] + 1 // Start index
          };
      }
      /* BODY_END */
      for (let i = 0, l = endIndexes.length; i < l; i++) {
          endTokens[endIndex++] = {
              type: BODY_END$1,
              index: endIndexes[i] // End index
          };
      }
      /* SELECTOR */
      let prevStartTokenIndex = 0;
      let prevEndTokenIndex = 0;
      for (let i = 0, l = startIndexes.length; i < l; i++) {
          const indexEnd = startIndexes[i];
          const findStartData = findSelectorStartIndex(startTokens, prevStartTokenIndex, indexEnd);
          const findEndData = findSelectorStartIndex(endTokens, prevEndTokenIndex, indexEnd);
          prevStartTokenIndex = findStartData[1];
          prevEndTokenIndex = findEndData[1];
          let index = (findStartData[0] >= findEndData[0]) ? findStartData[0] : findEndData[0];
          let selector = css.slice(index, indexEnd);
          let semicolonIndex = index + selector.lastIndexOf(';', indexEnd) + 1;
          if (semicolonIndex > index) {
              index = semicolonIndex;
              selector = css.slice(index, indexEnd);
          }
          selectorTokens[selectorIndex++] = {
              type: SELECTOR$1,
              index,
              indexEnd,
              selector
          };
      }
      /* RETURN */
      return mergeTokensSorted(mergeTokensSortedEvenOdd(selectorTokens, startTokens), endTokens);
  };

  /* IMPORT */
  const { SELECTOR, BODY_START, BODY_END } = TOKEN_TYPE;
  /* HELPERS */
  const getNodeBody = (node, css) => {
      const { children } = node;
      let body = '';
      let start = node.bodyIndex;
      for (let i = 0, l = children.length; i < l; i++) {
          const child = children[i];
          body += css.slice(start, child.index);
          start = child.indexEnd + 1;
      }
      body += css.slice(start, node.bodyIndexEnd);
      return body;
  };
  /* MAIN */
  const parse = (css) => {
      const tokens = tokenizer(css);
      const AST = { parent: null, children: [] };
      let parent = AST;
      let index = 0;
      while (true) {
          if (!parent)
              throw new Error('Parent node not found');
          const token = tokens[index];
          if (!token)
              break;
          if (token.type === SELECTOR) {
              const tokenBodyStart = tokens[index + 1];
              if (!tokenBodyStart || tokenBodyStart.type !== BODY_START)
                  throw new Error('Found "selector" token without expected subsequent "body_start" token');
              const node = {
                  parent,
                  index: token.index,
                  indexEnd: -1,
                  selector: token.selector,
                  selectorIndex: token.index,
                  selectorIndexEnd: token.indexEnd,
                  body: '',
                  bodyIndex: tokenBodyStart.index,
                  bodyIndexEnd: -1,
                  children: []
              };
              parent.children.push(node);
              parent = node;
              index += 2;
          }
          else if (token.type === BODY_END) {
              const node = parent; //TSC
              node.indexEnd = token.index + 1;
              node.bodyIndexEnd = token.index;
              node.body = getNodeBody(node, css);
              parent = node.parent;
              index += 1;
          }
          else {
              throw new Error(`Unexpected token of type: "${token.type}"`);
          }
      }
      return AST;
  };

  /* IMPORT */
  /* HELPERS */
  const stringifyNode = (node) => {
      return `${node.selector}{${node.body}${stringifyChildren(node.children)}}`;
  };
  const stringifyChildren = (children) => {
      let css = '';
      for (let i = 0, l = children.length; i < l; i++) {
          css += stringifyNode(children[i]);
      }
      return css;
  };
  /* MAIN */
  const stringify = (ast) => {
      return stringifyChildren(ast.children);
  };

  /* IMPORT */
  /* MAIN */
  const traverse$1 = (ast, fn) => {
      const { children } = ast;
      for (let i = 0, l = children.length; i < l; i++) {
          const node = children[i];
          fn(node);
          traverse$1(node, fn);
      }
  };

  /* IMPORT */
  /* MAIN */
  const Parser = { parse, stringify, traverse: traverse$1 };

  const ATTRIBUTE_TYPE_NAME = 'type';

  /**
   * Get the type attribute from a node generated by the riot parser
   * @param   {object} sourceNode - riot parser node
   * @returns { string|null } a valid type to identify the preprocessor to use or nothing
   */
  function getPreprocessorTypeByAttribute(sourceNode) {
    const typeAttribute = sourceNode.attributes
      ? sourceNode.attributes.find(
          (attribute) => attribute.name === ATTRIBUTE_TYPE_NAME,
        )
      : null;

    return typeAttribute ? normalize$1(typeAttribute.value) : null
  }

  /**
   * Remove the noise in case a user has defined the preprocessor type='text/scss'
   * @param   { string } value - input string
   * @returns { string } normalized string
   */
  function normalize$1(value) {
    return value.replace('text/', '')
  }

  /**
   * Preprocess a riot parser node
   * @param   { string } preprocessorType - either css, js
   * @param   { string } preprocessorName - preprocessor id
   * @param   {object} meta - compilation meta information
   * @param   { RiotParser.nodeTypes } node - css node detected by the parser
   * @returns { Output } code and sourcemap generated by the preprocessor
   */
  function preprocess(
    preprocessorType,
    preprocessorName,
    meta,
    node,
  ) {
    const code = node.text;

    return preprocessorName
      ? execute(preprocessorType, preprocessorName, meta, code)
      : { code }
  }

  /**
   * Replace a text chunk in a range
   * @param {string} originalString - the text we need to patch
   * @param {number} start - the start offset where the string should be replaced
   * @param {number} end - the end where the string replacement should finish
   * @param {string} replacement - the string we need to insert
   * @returns {string} the original text patched with the replacement string
   */
  function replaceInRange(
    originalString,
    start,
    end,
    replacement,
  ) {
    return `${originalString.substring(0, start)}${replacement}${originalString.substring(end)}`
  }

  const HOST = ':host';
  const DISABLED_SELECTORS = ['from', 'to'];

  /**
   * Matches valid, multiline JavaScript comments in almost all its forms.
   * @constant {RegExp}
   * @static
   */
  const R_MLCOMMS = /\/\*[^*]*\*+(?:[^*/][^*]*\*+)*\//g;

  /**
   * Matches the list of css selectors excluding the pseudo selectors
   * @constant {RegExp}
   * @static
   */

  const R_CSS_SELECTOR_LIST =
    /([^,]+)(?::(?!host)\w+(?:[\s|\S]*?\))?(?:[^,:]*)?)+|([^,]+)/g;

  /**
   * Scope the css selectors prefixing them with the tag name
   * @param {string} tag - Tag name of the root element
   * @param {string} selectorList - list of selectors we need to scope
   * @returns {string} scoped selectors
   */
  function addScopeToSelectorList(tag, selectorList) {
    return selectorList.replace(R_CSS_SELECTOR_LIST, (match, selector) => {
      const trimmedMatch = match.trim();
      const trimmedSelector = selector ? selector.trim() : trimmedMatch;
      // skip selectors already using the tag name
      if (trimmedSelector.indexOf(tag) === 0) {
        return match
      }

      // skips the keywords and percents of css animations
      if (
        !trimmedSelector ||
        DISABLED_SELECTORS.indexOf(trimmedSelector) > -1 ||
        trimmedSelector.slice(-1) === '%'
      ) {
        return match
      }

      // replace the `:host` pseudo-selector, where it is, with the root tag name;
      // if `:host` was not included, add the tag name as prefix, and mirror all `[is]`
      if (trimmedMatch.indexOf(HOST) < 0) {
        return `${tag} ${trimmedMatch},[is="${tag}"] ${trimmedMatch}`
      } else {
        return `${trimmedMatch.replace(HOST, tag)},${trimmedMatch.replace(
        HOST,
        `[is="${tag}"]`,
      )}`
      }
    })
  }

  /**
   * Traverse the ast children
   * @param {CSSParser.AST | CSSParser.NODE} ast - css parser node or ast
   * @param {Function} fn - function that is needed to parse the single nodes
   * @returns {CSSParser.AST | CSSParser.NODE} the original ast received
   */
  const traverse = (ast, fn) => {
    const { children } = ast;

    children.forEach((child) => {
      // if fn returns false we stop the recursion
      if (fn(child) !== false) traverse(child, fn);
    });

    return ast
  };

  /**
   * Parses styles enclosed in a "scoped" tag
   * The "css" string is received without comments or surrounding spaces.
   * @param   {string} tag - Tag name of the root element
   * @param   {string} css - The CSS code
   * @returns {string} CSS with the styles scoped to the root element
   */
  function generateScopedCss(tag, css) {
    const ast = Parser.parse(css);
    const originalCssLength = css.length;

    traverse(ast, (node) => {
      // calculate the selector offset from the original css length
      const newSelectorOffset = css.length - originalCssLength;

      if (!node.selector.trim().startsWith('@')) {
        // the css parser doesn't detect the comments so we manually remove them
        const selector = node.selector.replace(R_MLCOMMS, '');

        // replace the selector and override the original css
        css = replaceInRange(
          css,
          node.selectorIndex + newSelectorOffset,
          node.selectorIndexEnd + newSelectorOffset,
          addScopeToSelectorList(tag, selector),
        );

        // stop the recursion
        return false
      }
    });

    return css
  }

  /**
   * Remove comments, compact and trim whitespace
   * @param { string } code - compiled css code
   * @returns { string } css code normalized
   */
  function compactCss(code) {
    return code.replace(R_MLCOMMS, '').replace(/\s+/g, ' ').trim()
  }

  const escapeBackslashes = (s) => s.replace(/\\/g, '\\\\');
  const escapeIdentifier = (identifier) =>
    escapeBackslashes(
      cssEscape(identifier, {
        isIdentifier: true,
      }),
    );

  /**
   * Generate the component css
   * @param   {object} sourceNode - node generated by the riot compiler
   * @param   { string } source - original component source code
   * @param   {object} meta - compilation meta information
   * @param   { AST } ast - current AST output
   * @returns { AST } the AST generated
   */
  function css(sourceNode, source, meta, ast) {
    const preprocessorName = getPreprocessorTypeByAttribute(sourceNode);
    const { options } = meta;
    const preprocessorOutput = preprocess(
      'css',
      preprocessorName,
      meta,
      sourceNode.text,
    );
    const normalizedCssCode = compactCss(preprocessorOutput.code);
    const escapedCssIdentifier = escapeIdentifier(meta.tagName);

    const cssCode = (
      options.scopedCss
        ? generateScopedCss(
            escapedCssIdentifier,
            escapeBackslashes(normalizedCssCode),
          )
        : escapeBackslashes(normalizedCssCode)
    ).trim();

    types.visit(ast, {
      visitProperty(path) {
        if (path.value.key.name === TAG_CSS_PROPERTY) {
          path.value.value = builders.templateLiteral(
            [builders.templateElement({ raw: cssCode, cooked: '' }, false)],
            [],
          );

          return false
        }

        this.traverse(path);
      },
    });

    return ast
  }

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry$2(fn, ...acc) {
    return (...args) => {
      args = [...acc, ...args];

      return args.length < fn.length ?
        curry$2(fn, ...args) :
        fn(...args)
    }
  }

  /**
   * Ckeck if an Array-like object has empty length
   * @param {Array} target - Array-like object
   * @returns {boolean} target is empty or null
   */
  function isEmptyArray(target) {
    return !target || !target.length
  }

  /**
   * True if the sourcemap has no mappings, it is empty
   * @param   {object}  map - sourcemap json
   * @returns {boolean} true if empty
   */
  function isEmptySourcemap(map) {
    return !map || isEmptyArray(map.mappings)
  }

  /**
   * Find the export default statement
   * @param   { Array } body - tree structure containing the program code
   * @returns {object} node containing only the code of the export default statement
   */
  function findExportDefaultStatement(body) {
    return body.find(isExportDefaultStatement)
  }

  /**
   * Find all import declarations
   * @param   { Array } body - tree structure containing the program code
   * @returns { Array } array containing all the import declarations detected
   */
  function findAllImportDeclarations(body) {
    return body.filter(isImportDeclaration)
  }

  /**
   * Find all the named export declarations
   * @param   { Array } body - tree structure containing the program code
   * @returns { Array } array containing all the named export declarations detected
   */
  function findAllExportNamedDeclarations(body) {
    return body.filter(isExportNamedDeclaration)
  }

  /**
   * Filter all the import declarations
   * @param   { Array } body - tree structure containing the program code
   * @returns { Array } array containing all the ast expressions without the import declarations
   */
  function filterOutAllImportDeclarations(body) {
    return body.filter((n) => !isImportDeclaration(n))
  }

  /**
   * Filter all the export declarations
   * @param   { Array } body - tree structure containing the program code
   * @returns { Array } array containing all the ast expressions without the export declarations
   */
  function filterOutAllExportDeclarations(body) {
    return body.filter(
      (n) => !isExportNamedDeclaration(n) || isExportDefaultStatement(n),
    )
  }

  /**
   * Find the component interface exported
   * @param   { Array } body - tree structure containing the program code
   * @returns {object | null} the object referencing the component interface if found
   */
  function findComponentInterface(body) {
    const exportNamedDeclarations = body
      .filter(isExportNamedDeclaration)
      .map((n) => n.declaration);
    const types = exportNamedDeclarations.filter(isTypeAliasDeclaration);
    const interfaces = exportNamedDeclarations.filter(isInterfaceDeclaration);
    const isRiotComponentTypeName = ({ typeName }) =>
      typeName && typeName.name
        ? typeName.name === RIOT_TAG_INTERFACE_NAME
        : false;
    const extendsRiotComponent = ({ expression }) =>
      expression.name === RIOT_TAG_INTERFACE_NAME;

    return (
      types.find(
        (node) =>
          (node.typeAnnotation.types &&
            node.typeAnnotation.types.some(isRiotComponentTypeName)) ||
          isRiotComponentTypeName(node.typeAnnotation),
      ) ||
      interfaces.find(
        (node) => node.extends && node.extends.some(extendsRiotComponent),
      )
    )
  }

  /**
   * Add the component interface to the export declaration
   * @param   {object} ast - ast object generated by recast
   * @param   {object} componentInterface - the component typescript interface
   * @returns {object} the component object exported combined with the riot typescript interfaces
   */
  function addComponentInterfaceToExportedObject(ast, componentInterface) {
    const body = getProgramBody(ast);
    const RiotComponentWrapperImportSpecifier = builders.importSpecifier(
      builders.identifier(RIOT_INTERFACE_WRAPPER_NAME),
    );
    const componentInterfaceName = componentInterface.id.name;
    const riotImportDeclaration = findAllImportDeclarations(body).find(
      (node) => node.source.value === RIOT_MODULE_ID,
    );
    const exportDefaultStatement = body.find(isExportDefaultStatement);
    const objectExport = exportDefaultStatement.declaration;

    // add the RiotComponentWrapper to this component imports
    if (riotImportDeclaration) {
      riotImportDeclaration.specifiers.push(RiotComponentWrapperImportSpecifier);
    } else {
      // otherwise create the whole import statement from riot
      body.unshift(
        0,
        builders.importDeclaration(
          [RiotComponentWrapperImportSpecifier],
          builders.stringLiteral(RIOT_MODULE_ID),
        ),
      );
    }

    // override the object export adding the types detected
    exportDefaultStatement.declaration = builders.tsAsExpression(
      objectExport,
      builders.tsTypeReference(
        builders.identifier(RIOT_INTERFACE_WRAPPER_NAME),
        builders.tsTypeParameterInstantiation([
          builders.tsTypeReference(builders.identifier(componentInterfaceName)),
        ]),
      ),
    );

    return ast
  }

  /**
   * Create the default export declaration interpreting the old riot syntax relying on "this" statements
   * @param   { Array } body - tree structure containing the program code
   * @returns {object} ExportDefaultDeclaration
   */
  function createDefaultExportFromLegacySyntax(body) {
    return builders.exportDefaultDeclaration(
      builders.functionDeclaration(
        builders.identifier(TAG_LOGIC_PROPERTY),
        [],
        builders.blockStatement([
          ...compose$1(
            filterOutAllImportDeclarations,
            filterOutAllExportDeclarations,
          )(body),
          builders.returnStatement(builders.thisExpression()),
        ]),
      ),
    )
  }

  /**
   * Find all the code in an ast program except for the export default statements
   * @param   { Array } body - tree structure containing the program code
   * @returns { Array } array containing all the program code except the export default expressions
   */
  function filterNonExportDefaultStatements(body) {
    return body.filter(
      (node) =>
        !isExportDefaultStatement(node) && !isThisExpressionStatement(node),
    )
  }

  /**
   * Get the body of the AST structure
   * @param   {object} ast - ast object generated by recast
   * @returns { Array } array containing the program code
   */
  function getProgramBody(ast) {
    return ast.body || ast.program.body
  }

  /**
   * Extend the AST adding the new tag method containing our tag sourcecode
   * @param   {object} ast - current output ast
   * @param   {object} exportDefaultNode - tag export default node
   * @returns {object} the output ast having the "tag" key extended with the content of the export default
   */
  function extendTagProperty(ast, exportDefaultNode) {
    types.visit(ast, {
      visitProperty(path) {
        if (path.value.key.name === TAG_LOGIC_PROPERTY) {
          path.value.value = exportDefaultNode.declaration;
          return false
        }

        this.traverse(path);
      },
    });

    return ast
  }

  /**
   * Generate the component javascript logic
   * @param   {object} sourceNode - node generated by the riot compiler
   * @param   { string } source - original component source code
   * @param   {object} meta - compilation meta information
   * @param   { AST } ast - current AST output
   * @returns { AST } the AST generated
   */
  function javascript(sourceNode, source, meta, ast) {
    const preprocessorName = getPreprocessorTypeByAttribute(sourceNode);
    const javascriptNode = addLineOffset(
      sourceNode.text.text,
      source,
      sourceNode,
    );
    const { options } = meta;
    const preprocessorOutput = preprocess('javascript', preprocessorName, meta, {
      ...sourceNode,
      text: javascriptNode,
    });
    const inputSourceMap = sourcemapAsJSON(preprocessorOutput.map);
    const generatedAst = generateAST(preprocessorOutput.code, {
      sourceFileName: options.file,
      inputSourceMap: isEmptySourcemap(inputSourceMap) ? null : inputSourceMap,
    });
    const generatedAstBody = getProgramBody(generatedAst);
    const exportDefaultNode = findExportDefaultStatement(generatedAstBody);
    const isLegacyRiotSyntax = isNil(exportDefaultNode);
    const outputBody = getProgramBody(ast);
    const componentInterface = findComponentInterface(generatedAstBody);

    // throw in case of mixed component exports
    if (exportDefaultNode && generatedAstBody.some(isThisExpressionStatement))
      throw new Error(
        'You can\t use "export default {}" and root this statements in the same component',
      )

    // add to the ast the "private" javascript content of our tag script node
    outputBody.unshift(
      ...// for the legacy riot syntax we need to move all the import and (named) export statements outside of the function body
      (isLegacyRiotSyntax
        ? [
            ...findAllImportDeclarations(generatedAstBody),
            ...findAllExportNamedDeclarations(generatedAstBody),
          ]
        : // modern riot syntax will hoist all the private stuff outside of the export default statement
          filterNonExportDefaultStatements(generatedAstBody)),
    );

    // create the public component export properties from the root this statements
    if (isLegacyRiotSyntax)
      extendTagProperty(
        ast,
        createDefaultExportFromLegacySyntax(generatedAstBody),
      );

    // convert the export default adding its content to the component property exported
    if (exportDefaultNode) extendTagProperty(ast, exportDefaultNode);

    return componentInterface
      ? // add the component interface to the component object exported
        addComponentInterfaceToExportedObject(ast, componentInterface)
      : ast
  }

  /**
   * Create the content of the template function
   * @param   { RiotParser.Node } sourceNode - node generated by the riot compiler
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @returns {AST.BlockStatement} the content of the template function
   */
  function createTemplateFunctionContent(sourceNode, sourceFile, sourceCode) {
    return callTemplateFunction(
      ...build(createRootNode(sourceNode), sourceFile, sourceCode),
    )
  }

  /**
   * Extend the AST adding the new template property containing our template call to render the component
   * @param   {object} ast - current output ast
   * @param   { string } sourceFile - source file path
   * @param   { string } sourceCode - original source
   * @param   { RiotParser.Node } sourceNode - node generated by the riot compiler
   * @returns {object} the output ast having the "template" key
   */
  function extendTemplateProperty(ast, sourceFile, sourceCode, sourceNode) {
    types.visit(ast, {
      visitProperty(path) {
        if (path.value.key.name === TAG_TEMPLATE_PROPERTY) {
          path.value.value = createTemplateDependenciesInjectionWrapper(
            createTemplateFunctionContent(sourceNode, sourceFile, sourceCode),
          );

          return false
        }

        this.traverse(path);
      },
    });

    return ast
  }

  /**
   * Generate the component template logic
   * @param   { RiotParser.Node } sourceNode - node generated by the riot compiler
   * @param   { string } source - original component source code
   * @param   {object} meta - compilation meta information
   * @param   { AST } ast - current AST output
   * @returns { AST } the AST generated
   */
  function template(sourceNode, source, meta, ast) {
    const { options } = meta;
    return extendTemplateProperty(ast, options.file, source, sourceNode)
  }

  /**
   * Find whether there is html code outside of the root node
   * @param   {RiotParser.Node} root - node generated by the riot compiler
   * @param   {string}  code - riot tag source code
   * @param   {Function} parse - riot parser function
   * @returns {boolean} true if extra markup is detected
   */
  function hasHTMLOutsideRootNode(root, code, parse) {
    const additionalCode = root
      ? [
          // head
          code.substring(0, root.start),
          // tail
          code.substring(root.end, code.length),
        ]
          .join('')
          .trim()
      : '';

    if (additionalCode) {
      // if there are parsing errors we assume that there are no html
      // tags outside of the root node
      try {
        const { template, javascript, css } = parse(additionalCode).output;

        return [template, javascript, css].some(isObject)
      } catch {
        return false
      }
    }

    return false
  }

  /**
   * Get an object containing the template, css and javascript ast. The origianl source code and the sourcemap are also included
   * @param { string | ParserResult } source - source code of the tag we will need to compile or a parsed Component AST
   * @param {object} meta - compiler meta object that will be used to store the meta information of the input across the whole compilation
   * @returns {object} object that will be used to generate the output code
   */
  function preProcessSource(source, meta) {
    // if the source is a parser output we can return it directly
    // @link https://github.com/riot/compiler/issues/178
    if (isObject(source))
      return { ...source.output, code: source.data, map: null }

    const { options } = meta;

    const { code, map } = execute(
      'template',
      options.template,
      meta,
      source,
    );

    const parse = parser$1(options).parse;
    const { template, css, javascript } = parse(code).output;

    // see also https://github.com/riot/compiler/issues/130
    if (hasHTMLOutsideRootNode(template || css || javascript, source, parse)) {
      throw new Error('Multiple HTML root nodes are not supported')
    }

    return { template, css, javascript, map, code }
  }

  const DEFAULT_OPTIONS = {
    template: 'default',
    file: '[unknown-source-file]',
    scopedCss: true,
  };

  /**
   * Create the initial AST
   * @param {string} tagName - the name of the component we have compiled
   * @returns { AST } the initial AST
   * @example
   * // the output represents the following string in AST
   */
  function createInitialInput({ tagName }) {
    /*
    generates
    export default {
       ${TAG_CSS_PROPERTY}: null,
       ${TAG_LOGIC_PROPERTY}: null,
       ${TAG_TEMPLATE_PROPERTY}: null
    }
    */
    return builders.program([
      builders.exportDefaultDeclaration(
        builders.objectExpression([
          simplePropertyNode(TAG_CSS_PROPERTY, nullNode()),
          simplePropertyNode(TAG_LOGIC_PROPERTY, nullNode()),
          simplePropertyNode(TAG_TEMPLATE_PROPERTY, nullNode()),
          simplePropertyNode(TAG_NAME_PROPERTY, builders.literal(tagName)),
        ]),
      ),
    ])
  }

  /**
   * Make sure the input sourcemap is valid otherwise we ignore it
   * @param   {SourceMapGenerator} map - preprocessor source map
   * @returns {object} sourcemap as json or nothing
   */
  function normaliseInputSourceMap(map) {
    const inputSourceMap = sourcemapAsJSON(map);
    return isEmptySourcemap(inputSourceMap) ? null : inputSourceMap
  }

  /**
   * Override the sourcemap content making sure it will always contain the tag source code
   * @param   {object} map - sourcemap as json
   * @param   {string} source - component source code
   * @returns {object} original source map with the "sourcesContent" property overridden
   */
  function overrideSourcemapContent(map, source) {
    return {
      ...map,
      sourcesContent: [source],
    }
  }

  /**
   * Create the compilation meta object
   * @param { string } source - source code of the tag we will need to compile
   * @param { string } options - compiling options
   * @returns {object} meta object
   */
  function createMeta(source, options) {
    return {
      tagName: null,
      fragments: null,
      options: {
        ...DEFAULT_OPTIONS,
        ...options,
      },
      source,
    }
  }

  /**
   * Parse a string to simply get its template AST
   * @param { string } source - string to parse
   * @param {object} options - parser options
   * @returns {object} riot parser template output
   */
  const parseSimpleString = (source, options) => {
    const { parse } = parser$1(options);
    return parse(source).output.template
  };

  /**
   * Generate the component slots creation function from the root node
   * @param { string } source - component outer html
   * @param {object} parserOptions - riot parser options
   * @returns { string } content of the function that can be used to crate the slots in runtime
   */
  function generateSlotsFromString(source, parserOptions) {
    return compose$1(
      ({ code }) => code,
      generateJavascript,
      createTemplateDependenciesInjectionWrapper,
      createSlotsArray,
    )(parseSimpleString(source, parserOptions), DEFAULT_OPTIONS.file, source)
  }

  /**
   * Generate the Riot.js binding template function from a template string
   * @param { string } source - template string
   * @param {object} parserOptions - riot parser options
   * @returns { string } Riot.js bindings template function generated
   */
  function generateTemplateFunctionFromString(source, parserOptions) {
    return compose$1(
      ({ code }) => code,
      generateJavascript,
      callTemplateFunction,
    )(
      ...build(
        parseSimpleString(source, parserOptions),
        DEFAULT_OPTIONS.file,
        source,
      ),
    )
  }

  /**
   * Generate the output code source together with the sourcemap
   * @param { string | ParserResult } source - source code of the tag we will need to compile or a parsed Component AST
   * @param {object} opts - compiling options
   * @returns { Output } object containing output code and source map
   */
  function compile$1(source, opts = {}) {
    const meta = createMeta(source, opts);
    const { options } = meta;
    const { template: template$1, css: css$1, javascript: javascript$1, map, code } = preProcessSource(
      source,
      meta,
    );

    // extend the meta object with the result of the parsing
    Object.assign(meta, {
      tagName: template$1.name,
      fragments: { template: template$1, css: css$1, javascript: javascript$1 },
    });

    return compose$1(
      (result) => ({ ...result, meta }),
      (result) => execute$1(result, meta),
      (result) => ({
        ...result,
        map: overrideSourcemapContent(result.map, source),
      }),
      (ast) =>
        (meta.ast =
          ast &&
          generateJavascript(ast, {
            sourceMapName: `${options.file}.map`,
            inputSourceMap: normaliseInputSourceMap(map),
          })),
      hookGenerator(template, template$1, code, meta),
      hookGenerator(javascript, javascript$1, code, meta),
      hookGenerator(css, css$1, code, meta),
    )(createInitialInput(meta))
  }

  /**
   * Prepare the riot parser node transformers
   * @param   { Function } transformer - transformer function
   * @param   {object} sourceNode - riot parser node
   * @param   { string } source - component source code
   * @param   {object} meta - compilation meta information
   * @returns { function(): Promise<Output> } Function what resolves to object containing output code and source map
   */
  function hookGenerator(transformer, sourceNode, source, meta) {
    const hasContent =
      sourceNode &&
      (sourceNode.text ||
        !isEmptyArray(sourceNode.nodes) ||
        !isEmptyArray(sourceNode.attributes));

    return hasContent
      ? curry$2(transformer)(sourceNode, source, meta)
      : (result) => result
  }

  // This function can be used to register new preprocessors
  // a preprocessor can target either only the css or javascript nodes
  // or the complete tag source file ('template')
  const registerPreprocessor = register$2;

  // This function can allow you to register postprocessors that will parse the output code
  // here we can run prettifiers, eslint fixes...
  const registerPostprocessor = register$1;

  const compiler_essential = /*#__PURE__*/Object.freeze({
    __proto__: null,
    compile: compile$1,
    createInitialInput: createInitialInput,
    generateSlotsFromString: generateSlotsFromString,
    generateTemplateFunctionFromString: generateTemplateFunctionFromString,
    registerPostprocessor: registerPostprocessor,
    registerPreprocessor: registerPreprocessor
  });

  // Components without template use a mocked template interface with some basic functionalities to
  // guarantee consistent rendering behaviour see https://github.com/riot/riot/issues/2984
  const MOCKED_TEMPLATE_INTERFACE = {
    [MOUNT_METHOD_KEY](el) {
      this.el = el;
    },
    [UPDATE_METHOD_KEY]: noop$1,
    [UNMOUNT_METHOD_KEY](_, __, mustRemoveRoot = false) {
      if (mustRemoveRoot) removeChild(this.el);
      else if (!mustRemoveRoot) cleanNode(this.el);
    },
    clone() {
      return { ...this }
    },
    createDOM: noop$1,
  };

  const HEAD_SYMBOL = Symbol();
  const TAIL_SYMBOL = Symbol();

  /**
   * Create the <template> fragments text nodes
   * @returns {object} {{head: Text, tail: Text}}
   */
  function createHeadTailPlaceholders() {
    const head = document.createTextNode('');
    const tail = document.createTextNode('');

    head[HEAD_SYMBOL] = true;
    tail[TAIL_SYMBOL] = true;

    return { head, tail }
  }

  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {object} the meta property that will be passed to the mount function of the TemplateChunk
   */
  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true);
    const { head, tail } = createHeadTailPlaceholders();

    return {
      avoidDOMInjection: true,
      fragment,
      head,
      tail,
      children: [head, ...Array.from(fragment.childNodes), tail],
    }
  }

  /* c8 ignore start */
  /**
   * ISC License
   *
   * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */

  // fork of https://github.com/WebReflection/udomdiff version 1.1.0
  // due to https://github.com/WebReflection/udomdiff/pull/2
  /* eslint-disable */

  /**
   * @param {Node[]} a The list of current/live children
   * @param {Node[]} b The list of future children
   * @param {(entry: Node, action: number) => Node} get
   * The callback invoked per each entry related DOM operation.
   * @param {Node} [before] The optional node used as anchor to insert before.
   * @returns {Node[]} The same list of future children.
   */
  const udomdiff = (a, b, get, before) => {
    const bLength = b.length;
    let aEnd = a.length;
    let bEnd = bLength;
    let aStart = 0;
    let bStart = 0;
    let map = null;
    while (aStart < aEnd || bStart < bEnd) {
      // append head, tail, or nodes in between: fast path
      if (aEnd === aStart) {
        // we could be in a situation where the rest of nodes that
        // need to be added are not at the end, and in such case
        // the node to `insertBefore`, if the index is more than 0
        // must be retrieved, otherwise it's gonna be the first item.
        const node =
          bEnd < bLength
            ? bStart
              ? get(b[bStart - 1], -0).nextSibling
              : get(b[bEnd - bStart], 0)
            : before;
        while (bStart < bEnd) insertBefore(get(b[bStart++], 1), node);
      }
      // remove head or tail: fast path
      else if (bEnd === bStart) {
        while (aStart < aEnd) {
          // remove the node only if it's unknown or not live
          if (!map || !map.has(a[aStart])) removeChild(get(a[aStart], -1));
          aStart++;
        }
      }
      // same node: fast path
      else if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
      }
      // same tail: fast path
      else if (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      // The once here single last swap "fast path" has been removed in v1.1.0
      // https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
      // reverse swap: also fast path
      else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        // this is a "shrink" operation that could happen in these cases:
        // [1, 2, 3, 4, 5]
        // [1, 4, 3, 2, 5]
        // or asymmetric too
        // [1, 2, 3, 4, 5]
        // [1, 2, 3, 5, 6, 4]
        const node = get(a[--aEnd], -1).nextSibling;
        insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
        insertBefore(get(b[--bEnd], 1), node);
        // mark the future index as identical (yeah, it's dirty, but cheap 👍)
        // The main reason to do this, is that when a[aEnd] will be reached,
        // the loop will likely be on the fast path, as identical to b[bEnd].
        // In the best case scenario, the next loop will skip the tail,
        // but in the worst one, this node will be considered as already
        // processed, bailing out pretty quickly from the map index check
        a[aEnd] = b[bEnd];
      }
      // map based fallback, "slow" path
      else {
        // the map requires an O(bEnd - bStart) operation once
        // to store all future nodes indexes for later purposes.
        // In the worst case scenario, this is a full O(N) cost,
        // and such scenario happens at least when all nodes are different,
        // but also if both first and last items of the lists are different
        if (!map) {
          map = new Map();
          let i = bStart;
          while (i < bEnd) map.set(b[i], i++);
        }
        // if it's a future node, hence it needs some handling
        if (map.has(a[aStart])) {
          // grab the index of such node, 'cause it might have been processed
          const index = map.get(a[aStart]);
          // if it's not already processed, look on demand for the next LCS
          if (bStart < index && index < bEnd) {
            let i = aStart;
            // counts the amount of nodes that are the same in the future
            let sequence = 1;
            while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence)
              sequence++;
            // effort decision here: if the sequence is longer than replaces
            // needed to reach such sequence, which would brings again this loop
            // to the fast path, prepend the difference before a sequence,
            // and move only the future list index forward, so that aStart
            // and bStart will be aligned again, hence on the fast path.
            // An example considering aStart and bStart are both 0:
            // a: [1, 2, 3, 4]
            // b: [7, 1, 2, 3, 6]
            // this would place 7 before 1 and, from that time on, 1, 2, and 3
            // will be processed at zero cost
            if (sequence > index - bStart) {
              const node = get(a[aStart], 0);
              while (bStart < index) insertBefore(get(b[bStart++], 1), node);
            }
            // if the effort wasn't good enough, fallback to a replace,
            // moving both source and target indexes forward, hoping that some
            // similar node will be found later on, to go back to the fast path
            else {
              replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
            }
          }
          // otherwise move the source forward, 'cause there's nothing to do
          else aStart++;
        }
        // this node has no meaning in the future list, so it's more than safe
        // to remove it, and check the next live node out instead, meaning
        // that only the live list index should be forwarded
        else removeChild(get(a[aStart++], -1));
      }
    }
    return b
  };

  const UNMOUNT_SCOPE = Symbol('unmount');

  const EachBinding = {
    // dynamic binding properties
    // childrenMap: null,
    // node: null,
    // root: null,
    // condition: null,
    // evaluate: null,
    // template: null,
    // isTemplateTag: false,
    nodes: [],
    // getKey: null,
    // indexName: null,
    // itemName: null,
    // afterPlaceholder: null,
    // placeholder: null,

    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope)
    },
    update(scope, parentScope) {
      const { placeholder, nodes, childrenMap } = this;
      const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];

      // prepare the diffing
      const { newChildrenMap, batches, futureNodes } = createPatch(
        items,
        scope,
        parentScope,
        this,
      );

      // patch the DOM only if there are new nodes
      udomdiff(
        nodes,
        futureNodes,
        patch(Array.from(childrenMap.values()), parentScope),
        placeholder,
      );

      // trigger the mounts and the updates
      batches.forEach((fn) => fn());

      // update the children map
      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes;

      return this
    },
    unmount(scope, parentScope) {
      this.update(UNMOUNT_SCOPE, parentScope);

      return this
    },
  };

  /**
   * Patch the DOM while diffing
   * @param   {any[]} redundant - list of all the children (template, nodes, context) added via each
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */
  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        // get the last element added to the childrenMap saved previously
        const element = redundant[redundant.length - 1];

        if (element) {
          // get the nodes and the template in stored in the last child of the childrenMap
          const { template, nodes, context } = element;
          // remove the last node (notice <template> tags might have more children nodes)
          nodes.pop();

          // notice that we pass null as last argument because
          // the root node and its children will be removed by domdiff
          if (!nodes.length) {
            // we have cleared all the children nodes and we can unmount this template
            redundant.pop();
            template.unmount(context, parentScope, null);
          }
        }
      }

      return item
    }
  }

  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */
  function mustFilterItem(condition, context) {
    return condition ? !condition(context) : false
  }

  /**
   * Extend the scope of the looped template
   * @param   {object} scope - current template scope
   * @param   {object} options - options
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {object} enhanced scope object
   */
  function extendScope(scope, { itemName, indexName, index, item }) {
    defineProperty(scope, itemName, item);
    if (indexName) defineProperty(scope, indexName, index);

    return scope
  }

  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EachBinding} binding - each binding object instance
   * @returns {object} data - An object containing:
   * @property {Map} newChildrenMap - a Map containing the new children template structure
   * @property {Array} batches - array containing the template lifecycle functions to trigger
   * @property {Array} futureNodes - array containing the nodes we need to diff
   */
  function createPatch(items, scope, parentScope, binding) {
    const {
      condition,
      template,
      childrenMap,
      itemName,
      getKey,
      indexName,
      root,
      isTemplateTag,
    } = binding;
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];

    items.forEach((item, index) => {
      const context = extendScope(Object.create(scope), {
        itemName,
        indexName,
        index,
        item,
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);
      const nodes = [];

      if (mustFilterItem(condition, context)) {
        return
      }

      const mustMount = !oldItem;
      const componentTemplate = oldItem ? oldItem.template : template.clone();
      const el = componentTemplate.el || root.cloneNode();
      const meta =
        isTemplateTag && mustMount
          ? createTemplateMeta(componentTemplate)
          : componentTemplate.meta;

      if (mustMount) {
        batches.push(() =>
          componentTemplate.mount(el, context, parentScope, meta),
        );
      } else {
        batches.push(() => componentTemplate.update(context, parentScope));
      }

      // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes
      if (isTemplateTag) {
        nodes.push(...meta.children);
      } else {
        nodes.push(el);
      }

      // delete the old item from the children map
      childrenMap.delete(key);
      futureNodes.push(...nodes);

      // update the children map
      newChildrenMap.set(key, {
        nodes,
        template: componentTemplate,
        context,
        index,
      });
    });

    return {
      newChildrenMap,
      batches,
      futureNodes,
    }
  }

  function create$6(
    node,
    { evaluate, condition, itemName, indexName, getKey, template },
  ) {
    const placeholder = document.createTextNode('');
    const root = node.cloneNode();

    insertBefore(placeholder, node);
    removeChild(node);

    return {
      ...EachBinding,
      childrenMap: new Map(),
      node,
      root,
      condition,
      evaluate,
      isTemplateTag: isTemplate(root),
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder,
    }
  }

  /**
   * Binding responsible for the `if` directive
   */
  const IfBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,

    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope)
    },
    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;
      const mount = () => {
        const pristine = this.node.cloneNode();

        insertBefore(pristine, this.placeholder);
        this.template = this.template.clone();
        this.template.mount(pristine, scope, parentScope);
      };

      switch (true) {
        case mustMount:
          mount();
          break
        case mustUnmount:
          this.unmount(scope);
          break
        default:
          if (value) this.template.update(scope, parentScope);
      }

      this.value = value;

      return this
    },
    unmount(scope, parentScope) {
      this.template.unmount(scope, parentScope, true);

      return this
    },
  };

  function create$5(node, { evaluate, template }) {
    const placeholder = document.createTextNode('');

    insertBefore(placeholder, node);
    removeChild(node);

    return {
      ...IfBinding,
      node,
      evaluate,
      placeholder,
      template: template.createDOM(node),
    }
  }

  /**
   * This method handles the REF attribute expressions
   * @param   {object} expression - expression data
   * @param   {HTMLElement} expression.node - target node
   * @param   {*} expression.value - the old expression cached value
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function refExpression({ node, value: oldValue }, value) {
    // called on mount and update
    if (value) value(node);
    // called on unmount
    // in this case the node value is null
    else oldValue(null);
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */
  function normalizeStringValue(value) {
    return isNil(value) ? '' : value
  }

  /**
   * This methods handles the input fields value updates
   * @param   {object} expression - expression data
   * @param   {HTMLElement} expression.node - target node
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function valueExpression({ node }, value) {
    node.value = normalizeStringValue(value);
  }

  const RE_EVENTS_PREFIX = /^on/;

  const getCallbackAndOptions = (value) =>
    Array.isArray(value) ? value : [value, false];

  // see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
  const EventListener = {
    handleEvent(event) {
      this[event.type](event);
    },
  };
  const ListenersWeakMap = new WeakMap();

  const createListener = (node) => {
    const listener = Object.create(EventListener);
    ListenersWeakMap.set(node, listener);
    return listener
  };

  /**
   * Set a new event listener
   * @param   {object}  expression - event expression data
   * @param   {HTMLElement} expression.node - target node
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function eventExpression({ node, name }, value) {
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');
    const eventListener = ListenersWeakMap.get(node) || createListener(node);
    const [callback, options] = getCallbackAndOptions(value);
    const handler = eventListener[normalizedEventName];
    const mustRemoveEvent = handler && !callback;
    const mustAddEvent = callback && !handler;

    if (mustRemoveEvent) {
      node.removeEventListener(normalizedEventName, eventListener);
    }

    if (mustAddEvent) {
      node.addEventListener(normalizedEventName, eventListener, options);
    }

    eventListener[normalizedEventName] = callback;
  }

  /* c8 ignore next */
  const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
  const isNativeHtmlProperty = memoize$1(
    (name) => ElementProto.hasOwnProperty(name), // eslint-disable-line
  );

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {object} attributes - object containing the attributes names and values
   * @param   {*} oldAttributes - the old expression cached value
   * @returns {undefined} sorry it's a void function :(
   */
  function setAllAttributes(node, attributes, oldAttributes) {
    Object.entries(attributes)
      // filter out the attributes that didn't change their value
      .filter(([name, value]) => value !== oldAttributes?.[name])
      .forEach(([name, value]) => {
        switch (true) {
          case name === REF_ATTRIBUTE:
            return refExpression({ node }, value)
          case name === VALUE_ATTRIBUTE:
            return valueExpression({ node }, value)
          case isEventAttribute$1(name):
            return eventExpression({ node, name }, value)
          default:
            return attributeExpression({ node, name }, value)
        }
      });
  }

  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {object} newAttributes - object containing all the new attribute names
   * @param   {object} oldAttributes - object containing all the old attribute names
   * @returns {undefined} sorry it's a void function :(
   */
  function removeAllAttributes(node, newAttributes, oldAttributes) {
    const newKeys = newAttributes ? Object.keys(newAttributes) : [];

    Object.entries(oldAttributes)
      .filter(([name]) => !newKeys.includes(name))
      .forEach(([name, value]) => {
        switch (true) {
          case name === REF_ATTRIBUTE:
            return refExpression({ node, value })
          case name === VALUE_ATTRIBUTE:
            node.removeAttribute('value');
            node.value = '';
            return
          case isEventAttribute$1(name):
            return eventExpression({ node, name }, null)
          default:
            return node.removeAttribute(name)
        }
      });
  }

  /**
   * Check whether the attribute value can be rendered
   * @param {*} value - expression value
   * @returns {boolean} true if we can render this attribute value
   */
  function canRenderAttribute(value) {
    return ['string', 'number', 'boolean'].includes(typeof value)
  }

  /**
   * Check whether the attribute should be removed
   * @param {*} value - expression value
   * @param   {boolean} isBoolean - flag to handle boolean attributes
   * @returns {boolean} boolean - true if the attribute can be removed
   */
  function shouldRemoveAttribute(value, isBoolean) {
    // boolean attributes should be removed if the value is falsy
    if (isBoolean) return !value

    // null and undefined values will remove the attribute as well
    return isNil(value)
  }

  /**
   * This methods handles the DOM attributes updates
   * @param   {object} expression - attribute expression data
   * @param   {HTMLElement} expression.node - target node
   * @param   {string} expression.name - attribute name
   * @param   {boolean} expression.isBoolean - flag to handle boolean attributes
   * @param   {*} expression.value - the old expression cached value
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function attributeExpression(
    { node, name, isBoolean: isBoolean$1, value: oldValue },
    value,
  ) {
    // is it a spread operator? {...attributes}
    if (!name) {
      if (oldValue) {
        // remove all the old attributes
        removeAllAttributes(node, value, oldValue);
      }

      // is the value still truthy?
      if (value) {
        setAllAttributes(node, value, oldValue);
      }

      return
    }

    // store the attribute on the node to make it compatible with native custom elements
    if (
      !isNativeHtmlProperty(name) &&
      (isBoolean(value) || isObject(value) || isFunction(value))
    ) {
      node[name] = value;
    }

    if (shouldRemoveAttribute(value, isBoolean$1)) {
      node.removeAttribute(name);
    } else if (canRenderAttribute(value)) {
      node.setAttribute(name, normalizeValue(name, value, isBoolean$1));
    }
  }

  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @param   {boolean} isBoolean - boolean attributes flag
   * @returns {string} input value as string
   */
  function normalizeValue(name, value, isBoolean) {
    // be sure that expressions like selected={ true } will always be rendered as selected='selected'
    // fix https://github.com/riot/riot/issues/2975
    return !!value && isBoolean ? name : value
  }

  /**
   * Get the the target text node to update or create one from of a comment node
   * @param   {HTMLElement} node - any html element containing childNodes
   * @param   {number} childNodeIndex - index of the text node in the childNodes list
   * @returns {Text} the text node to update
   */
  const getTextNode = (node, childNodeIndex) => {
    return node.childNodes[childNodeIndex]
  };

  /**
   * This methods handles a simple text expression update
   * @param   {object} expression - expression data
   * @param   {HTMLElement} expression.node - target node
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function textExpression({ node }, value) {
    node.data = normalizeStringValue(value);
  }

  const expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT$1]: textExpression,
    [VALUE]: valueExpression,
    [REF]: refExpression,
  };

  const Expression = {
    // Static props
    // node: null,
    // value: null,

    // API methods
    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      const value = this.evaluate(scope);

      // IO() DOM updates
      expressions[this.type](this, value);

      // store the computed value for the update calls
      this.value = value;

      return this
    },
    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        expressions[this.type](this, value);
        this.value = value;
      }

      return this
    },
    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      // unmount event and ref expressions
      if (
        [EVENT, REF].includes(this.type) ||
        // spread attributes might contain events or refs that must be unmounted
        (this.type === ATTRIBUTE && !this.name)
      )
        expressions[this.type](this, null);

      return this
    },
  };

  function create$4(node, data) {
    return {
      ...Expression,
      ...data,
      node: data.type === TEXT$1 ? getTextNode(node, data.childNodeIndex) : node,
    }
  }

  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {object} a new object to simplify the the nested methods dispatching
   */
  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return {
        ...acc,
        [method]: (scope) => {
          return collection.map((item) => item[method](scope)) && context
        },
      }
    }, {})
  }

  function create$3(node, { expressions }) {
    return flattenCollectionMethods(
      expressions.map((expression) => create$4(node, expression)),
      ['mount', 'update', 'unmount'],
    )
  }

  const extendParentScope = (attributes, scope, parentScope) => {
    if (!attributes || !attributes.length) return parentScope

    return Object.assign(
      Object.create(parentScope || null),
      generatePropsFromAttributes(attributes, scope),
    )
  };

  const findSlotById = (id, slots) => slots?.find((slot) => slot.id === id);

  // this function is only meant to fix an edge case
  // https://github.com/riot/riot/issues/2842
  const getRealParent = (scope, parentScope) =>
    scope[PARENT_KEY_SYMBOL] || parentScope;

  const SlotBinding = {
    // dynamic binding properties
    // node: null,
    // name: null,
    attributes: [],
    // templateData: null,
    // template: null,

    getTemplateScope(scope, parentScope) {
      return extendParentScope(this.attributes, scope, parentScope)
    },

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots
        ? findSlotById(this.name, scope.slots)
        : false;
      const { parentNode } = this.node;

      // if the slot did not pass any content, we will use the self slot for optional fallback content (https://github.com/riot/riot/issues/3024)
      const realParent = templateData ? getRealParent(scope, parentScope) : scope;

      // if there is no html for the current slot detected we rely on the parent slots (https://github.com/riot/riot/issues/3055)
      this.templateData = templateData?.html
        ? templateData
        : findSlotById(this.name, realParent.slots);

      // override the template property if the slot needs to be replaced
      this.template =
        (this.templateData &&
          create(this.templateData.html, this.templateData.bindings).createDOM(
            parentNode,
          )) ||
        // otherwise use the optional template fallback if provided by the compiler see also https://github.com/riot/riot/issues/3014
        this.template?.clone();

      if (this.template) {
        cleanNode(this.node);
        this.template.mount(
          this.node,
          this.getTemplateScope(scope, realParent),
          realParent,
        );
        this.template.children = Array.from(this.node.childNodes);
      }

      moveSlotInnerContent(this.node);
      removeChild(this.node);

      return this
    },
    update(scope, parentScope) {
      if (this.template) {
        const realParent = this.templateData
          ? getRealParent(scope, parentScope)
          : scope;

        this.template.update(this.getTemplateScope(scope, realParent), realParent);
      }

      return this
    },
    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(
          this.getTemplateScope(scope, parentScope),
          null,
          mustRemoveRoot,
        );
      }

      return this
    },
  };

  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLElement} slot - slot node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  function moveSlotInnerContent(slot) {
    const child = slot && slot.firstChild;

    if (!child) return

    insertBefore(child, slot);
    moveSlotInnerContent(slot);
  }

  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {object} data - slot binding data
   * @param   {string} data.name - slot id
   * @param   {AttributeExpressionData[]} data.attributes - slot attributes
   * @param   {TemplateChunk} data.template - slot fallback template
   * @returns {object} Slot binding object
   */
  function createSlot(node, { name, attributes, template }) {
    return {
      ...SlotBinding,
      attributes,
      template,
      node,
      name,
    }
  }

  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */
  function getTag(component, slots = [], attributes = []) {
    // if this tag was registered before we will return its implementation
    if (component) {
      return component({ slots, attributes })
    }

    // otherwise we return a template chunk
    return create(slotsToMarkup(slots), [
      ...slotBindings(slots),
      {
        // the attributes should be registered as binding
        // if we fallback to a normal template chunk
        expressions: attributes.map((attr) => {
          return {
            type: ATTRIBUTE,
            ...attr,
          }
        }),
      },
    ])
  }

  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */
  function slotBindings(slots) {
    return slots.reduce((acc, { bindings }) => acc.concat(bindings), [])
  }

  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */
  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html
    }, '')
  }

  const TagBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // name: null,
    // slots: null,
    // tag: null,
    // attributes: null,
    // getComponent: null,

    mount(scope) {
      return this.update(scope)
    },
    update(scope, parentScope) {
      const name = this.evaluate(scope);

      // simple update
      if (name && name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(scope, parentScope, true);

        // mount the new tag
        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this
    },
    unmount(scope, parentScope, keepRootTag) {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(keepRootTag);
      }

      return this
    },
  };

  function create$2(
    node,
    { evaluate, getComponent, slots, attributes },
  ) {
    return {
      ...TagBinding,
      node,
      evaluate,
      slots,
      attributes,
      getComponent,
    }
  }

  const bindings = {
    [IF]: create$5,
    [SIMPLE]: create$3,
    [EACH]: create$6,
    [TAG$1]: create$2,
    [SLOT]: createSlot,
  };

  /**
   * Text expressions in a template tag will get childNodeIndex value normalized
   * depending on the position of the <template> tag offset
   * @param   {Expression[]} expressions - riot expressions array
   * @param   {number} textExpressionsOffset - offset of the <template> tag
   * @returns {Expression[]} expressions containing the text expressions normalized
   */
  function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
    return expressions.map((e) =>
      e.type === TEXT$1
        ? {
            ...e,
            childNodeIndex: e.childNodeIndex + textExpressionsOffset,
          }
        : e,
    )
  }

  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {TagBindingData} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Binding} Binding object
   */
  function create$1(root, binding, templateTagOffset) {
    const { selector, type, redundantAttribute, expressions } = binding;
    // find the node to apply the bindings
    const node = selector ? root.querySelector(selector) : root;

    // remove eventually additional attributes created only to select this node
    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    const bindingExpressions = expressions || [];

    // init the binding
    return (bindings[type] || bindings[SIMPLE])(node, {
      ...binding,
      expressions:
        templateTagOffset && !selector
          ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset)
          : bindingExpressions,
    })
  }

  // in this case a simple innerHTML is enough
  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content
  }

  // for svg nodes we need a bit more work
  /* c8 ignore start */
  function createSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(
      new window.DOMParser().parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`,
        'application/xml',
      ).documentElement,
      true,
    );

    return svgNode
  }
  /* c8 ignore end */

  /**
   * Create the DOM that will be injected
   * @param {object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */
  function createDOMTree(root, html) {
    /* c8 ignore next */
    if (isSvg(root)) return createSVGTree(html, root)

    return createHTMLTree(html, root)
  }

  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {DocumentFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */
  function injectDOM(el, dom) {
    switch (true) {
      case isSvg(el):
        moveChildren(dom, el);
        break
      case isTemplate(el):
        el.parentNode.replaceChild(dom, el);
        break
      default:
        el.appendChild(dom);
    }
  }

  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string|HTMLElement} html - HTML markup or HTMLElement that will be injected into the root node
   * @returns {?DocumentFragment} fragment that will be injected into the root node
   */
  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html)
  }

  /**
   * Get the offset of the <template> tag
   * @param {HTMLElement} parentNode - template tag parent node
   * @param {HTMLElement} el - the template tag we want to render
   * @param   {object} meta - meta properties needed to handle the <template> tags in loops
   * @returns {number} offset of the <template> tag calculated from its siblings DOM nodes
   */
  function getTemplateTagOffset(parentNode, el, meta) {
    const siblings = Array.from(parentNode.childNodes);

    return Math.max(siblings.indexOf(el), siblings.indexOf(meta.head) + 1, 0)
  }

  /**
   * Template Chunk model
   * @type {object}
   */
  const TemplateChunk = {
    // Static props
    // bindings: null,
    // bindingsData: null,
    // html: null,
    // isTemplateTag: false,
    // fragment: null,
    // children: null,
    // dom: null,
    // el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom =
        this.dom ||
        createTemplateDOM(el, this.html) ||
        document.createDocumentFragment();

      return this
    },

    // API methods
    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {object} meta - meta properties needed to handle the <template> tags in loops
     * @returns {TemplateChunk} self
     */
    mount(el, scope, parentScope, meta = {}) {
      if (!el) panic$1('Please provide DOM node to mount properly your template');

      if (this.el) this.unmount(scope);

      // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call
      const { fragment, children, avoidDOMInjection } = meta;
      // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings
      const { parentNode } = children ? children[0] : el;
      const isTemplateTag = isTemplate(el);
      const templateTagOffset = isTemplateTag
        ? getTemplateTagOffset(parentNode, el, meta)
        : null;

      // create the DOM if it wasn't created before
      this.createDOM(el);

      // create the DOM of this template cloning the original DOM structure stored in this instance
      // notice that if a documentFragment was passed (via meta) we will use it instead
      const cloneNode = fragment || this.dom.cloneNode(true);

      // store root node
      // notice that for template tags the root note will be the parent tag
      this.el = isTemplateTag ? parentNode : el;

      // create the children array only for the <template> fragments
      this.children = isTemplateTag
        ? children || Array.from(cloneNode.childNodes)
        : null;

      // inject the DOM into the el only if a fragment is available
      if (!avoidDOMInjection && cloneNode) injectDOM(el, cloneNode);

      // create the bindings
      this.bindings = this.bindingsData.map((binding) =>
        create$1(this.el, binding, templateTagOffset),
      );
      this.bindings.forEach((b) => b.mount(scope, parentScope));

      // store the template meta properties
      this.meta = meta;

      return this
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @returns {TemplateChunk} self
     */
    update(scope, parentScope) {
      this.bindings.forEach((b) => b.update(scope, parentScope));

      return this
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
     * if false or undefined clean the root tag content, if null don't touch the DOM
     * @returns {TemplateChunk} self
     */
    unmount(scope, parentScope, mustRemoveRoot = false) {
      const el = this.el;

      if (!el) {
        return this
      }

      this.bindings.forEach((b) => b.unmount(scope, parentScope, mustRemoveRoot));

      switch (true) {
        // pure components should handle the DOM unmount updates by themselves
        // for mustRemoveRoot === null don't touch the DOM
        case el[IS_PURE_SYMBOL] || mustRemoveRoot === null:
          break

        // if children are declared, clear them
        // applicable for <template> and <slot/> bindings
        case Array.isArray(this.children):
          clearChildren(this.children);
          break

        // clean the node children only
        case !mustRemoveRoot:
          cleanNode(el);
          break

        // remove the root node only if the mustRemoveRoot is truly
        case !!mustRemoveRoot:
          removeChild(el);
          break
      }

      this.el = null;

      return this
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return {
        ...this,
        meta: {},
        el: null,
      }
    },
  };

  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {BindingData[]} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */
  function create(html, bindings = []) {
    return {
      ...TemplateChunk,
      html,
      bindingsData: bindings,
    }
  }

  /**
   * Factory function to create the component templates only once
   * @param   {Function} template - component template creation function
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @param   {Function} getChildComponent - getter function to return the children components
   * @returns {TemplateChunk} template chunk object
   */
  function componentTemplateFactory(
    template,
    componentWrapper,
    getChildComponent,
  ) {
    return template(
      create,
      expressionTypes,
      bindingTypes,
      getChildComponent,
    )
  }

  const PURE_COMPONENT_API = Object.freeze({
    [MOUNT_METHOD_KEY]: noop$1,
    [UPDATE_METHOD_KEY]: noop$1,
    [UNMOUNT_METHOD_KEY]: noop$1,
  });

  /**
   * Bind a DOM node to its component object
   * @param   {HTMLElement} node - html node mounted
   * @param   {object} component - Riot.js component object
   * @returns {object} the component object received as second argument
   */
  const bindDOMNodeToComponentInstance = (node, component) =>
    (node[DOM_COMPONENT_INSTANCE_PROPERTY] = component);

  /**
   * Wrap the Riot.js core API methods using a mapping function
   * @param   {Function} mapFunction - lifting function
   * @returns {object} an object having the { mount, update, unmount } functions
   */
  function createCoreAPIMethods(mapFunction) {
    return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce(
      (acc, method) => {
        acc[method] = mapFunction(method);

        return acc
      },
      {},
    )
  }

  /**
   * Create a pure component
   * @param   {Function} pureFactoryFunction - pure component factory function
   * @param   {object} options - pure component options
   * @param   {string} options.css - pure component can't have css
   * @param   {Array} options.slots - component slots
   * @param   {Array} options.attributes - component attributes
   * @param   {Array} options.template - template factory function
   * @param   {any} options.props - initial component properties
   * @returns {object} pure component object
   */
  function createPureComponent(
    pureFactoryFunction,
    { slots, attributes, props, css, template },
  ) {
    if (template) panic$1('Pure components can not have html');
    if (css) panic$1('Pure components do not have css');

    const component = defineDefaults(
      pureFactoryFunction({ slots, attributes, props }),
      PURE_COMPONENT_API,
    );

    return createCoreAPIMethods((method) => (...args) => {
      // intercept the mount calls to bind the DOM node to the pure object created
      // see also https://github.com/riot/riot/issues/2806
      if (method === MOUNT_METHOD_KEY) {
        const [element] = args;
        // mark this node as pure element
        defineProperty(element, IS_PURE_SYMBOL, true);
        bindDOMNodeToComponentInstance(element, component);
      }

      component[method](...args);

      return component
    })
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (
        /^\[object (HTMLCollection|NodeList|Object)\]$/
          .test(Object.prototype.toString.call(els))
          && typeof els.length === 'number'
      )
        return Array.from(els)
      else
        // if it's a single node
        // it will be returned as "array" with one single entry
        return [els]
    }
    // this object could be looped out of the box
    return els
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        scope      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */
  function $(selector, scope) {
    return domToArray(typeof selector === 'string' ?
      (scope || document).querySelectorAll(selector) :
      selector
    )
  }

  const COMPONENT_DOM_SELECTORS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0]
    },
    $$(selector) {
      return $(selector, this.root)
    },
  });

  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    [SHOULD_UPDATE_KEY]: noop$1,
    [ON_BEFORE_MOUNT_KEY]: noop$1,
    [ON_MOUNTED_KEY]: noop$1,
    [ON_BEFORE_UPDATE_KEY]: noop$1,
    [ON_UPDATED_KEY]: noop$1,
    [ON_BEFORE_UNMOUNT_KEY]: noop$1,
    [ON_UNMOUNTED_KEY]: noop$1,
  });

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */
  const normalize = values => values.length === 1 ? values[0] : values;

  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */
  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)))
    }))
  }

  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Object }              name  - either the name of the attribute to set
   *                                                 or a list of properties as object key - value
   * @param   { string }                     value - the new value of the attribute (optional)
   * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
   *
   * @example
   *
   * import { set } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * set(img, 'width', 100)
   *
   * // or also
   * set(img, {
   *   width: 300,
   *   height: 300
   * })
   *
   */
  function set(els, name, value) {
    const attrs = typeof name === 'object' ? name : { [name]: value };
    const props = Object.keys(attrs);

    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els
  }

  /**
   * Get any attribute from a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to get
   * @returns { Array|string } list of the attributes found
   *
   * @example
   *
   * import { get } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * get(img, 'width') // => '200'
   *
   * // or also
   * get(img, ['width', 'height']) // => ['200', '300']
   *
   * // or also
   * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
   */
  function get(els, name) {
    return parseNodes(els, name, 'getAttribute')
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]';

  // memoized curried function
  const getStyleNode = ((style) => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style

      // create a new style element or use an existing one
      // and cache it internally
      style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');

      /* istanbul ignore next */
      if (!style.parentNode) document.head.appendChild(style);

      return style
    }
  })();

  /**
   * Object that will be used to inject and manage the css of every tag instance
   */
  const cssManager = {
    CSS_BY_NAME,
    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {object} self
     */
    add(name, css) {
      if (!CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.set(name, css);
        this.inject();
      }

      return this
    },
    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {object} self
     */
    remove(name) {
      if (CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.delete(name);
        this.inject();
      }

      return this
    },
  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn, ...acc) {
    return (...args) => {
      args = [...acc, ...args];

      return args.length < fn.length ?
        curry(fn, ...args) :
        fn(...args)
    }
  }

  /**
   * Get the computed attribute names from the template instance
   * Since these attributes will not change we memoize the result of this computation
   * @param {TemplateChunk} template - template instance
   * @returns {[]} list of attribute names that will be computed by the template expressions
   */
  const getRootComputedAttributeNames = memoize$1((template) => {
    const firstBinding = template?.bindingsData?.[0];

    // if the first binding has the selector attribute it means that it doesn't belong to the root node
    if (firstBinding?.selector) return []

    return (
      firstBinding?.expressions?.reduce(
        (acc, { name, type }) =>
          type === expressionTypes.ATTRIBUTE ? acc.concat([name]) : acc,
        [],
      ) ?? []
    )
  });

  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */
  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
  }

  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */

  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, IS_DIRECTIVE, name);
    }
  }

  /**
   * Compute the component current state merging it with its previous state
   * @param   {object} oldState - previous state object
   * @param   {object} newState - new state given to the `update` call
   * @returns {object} new object state
   */
  function computeComponentState(oldState, newState) {
    return {
      ...oldState,
      ...callOrAssign(newState),
    }
  }

  /**
   * Evaluate the component properties either from its real attributes or from its initial user properties
   * @param   {HTMLElement} element - component root
   * @param   {object}  initialProps - initial props
   * @returns {object} component props key value pairs
   */
  function computeInitialProps(element, initialProps = {}) {
    return {
      ...DOMattributesToObject(element),
      ...callOrAssign(initialProps),
    }
  }

  /**
   * Run the component instance through all the plugins set by the user
   * @param   {object} component - component instance
   * @returns {object} the component enhanced by the plugins
   */
  function runPlugins(component) {
    return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component)
  }

  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {object} component - a component implementation previously defined
   * @param   {object} options - component options
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @param   {object} options.props - component initial props
   * @returns {Riot.Component} a riot component instance
   */
  function manageComponentLifecycle(
    component,
    { slots, attributes = [], props },
  ) {
    return autobindMethods(
      runPlugins(
        defineProperties(
          isObject(component) ? Object.create(component) : component,
          {
            mount(element, state = {}, parentScope) {
              // any element mounted passing through this function can't be a pure component
              defineProperty(element, IS_PURE_SYMBOL, false);
              this[PARENT_KEY_SYMBOL] = parentScope;

              defineProperty(
                this,
                PROPS_KEY,
                Object.freeze({
                  ...computeInitialProps(element, props),
                  ...generatePropsFromAttributes(attributes, parentScope),
                }),
              );

              this[STATE_KEY] = computeComponentState(this[STATE_KEY], state);
              this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone();
              // get the attribute names that don't belong to the props object
              // this will avoid recursive props rendering https://github.com/riot/riot/issues/2994
              this[ROOT_ATTRIBUTES_KEY_SYMBOL] = getRootComputedAttributeNames(
                this[TEMPLATE_KEY_SYMBOL],
              );

              // link this object to the DOM node
              bindDOMNodeToComponentInstance(element, this);
              // add eventually the 'is' attribute
              component.name && addCssHook(element, component.name);

              // define the root element
              defineProperty(this, ROOT_KEY, element);
              // define the slots array
              defineProperty(this, SLOTS_KEY, slots);

              // before mount lifecycle event
              this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
              // mount the template
              this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
              this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);

              return this
            },
            update(state = {}, parentScope) {
              if (parentScope) {
                this[PARENT_KEY_SYMBOL] = parentScope;
              }

              // filter out the computed attributes from the root node
              const staticRootAttributes = Array.from(
                this[ROOT_KEY].attributes,
              ).filter(
                ({ name }) => !this[ROOT_ATTRIBUTES_KEY_SYMBOL].includes(name),
              );

              // evaluate the value of the static dom attributes
              const domNodeAttributes = DOMattributesToObject({
                attributes: staticRootAttributes,
              });

              // Avoid adding the riot "is" directives to the component props
              // eslint-disable-next-line no-unused-vars
              const { [IS_DIRECTIVE]: _, ...newProps } = {
                ...domNodeAttributes,
                ...generatePropsFromAttributes(
                  attributes,
                  this[PARENT_KEY_SYMBOL],
                ),
              };
              if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false)
                return

              defineProperty(
                this,
                PROPS_KEY,
                Object.freeze({
                  // only root components will merge their initial props with the new ones
                  // children components will just get them overridden see also https://github.com/riot/riot/issues/2978
                  ...(parentScope ? null : this[PROPS_KEY]),
                  ...newProps,
                }),
              );

              this[STATE_KEY] = computeComponentState(this[STATE_KEY], state);
              this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]);

              // avoiding recursive updates
              // see also https://github.com/riot/riot/issues/2895
              if (!this[IS_COMPONENT_UPDATING]) {
                this[IS_COMPONENT_UPDATING] = true;
                this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
              }

              this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
              this[IS_COMPONENT_UPDATING] = false;

              return this
            },
            unmount(preserveRoot) {
              this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);

              // make sure that computed root attributes get removed if the root is preserved
              // https://github.com/riot/riot/issues/3051
              if (preserveRoot)
                this[ROOT_ATTRIBUTES_KEY_SYMBOL].forEach((attribute) =>
                  this[ROOT_KEY].removeAttribute(attribute),
                );
              // if the preserveRoot is null the template html will be left untouched
              // in that case the DOM cleanup will happen differently from a parent node
              this[TEMPLATE_KEY_SYMBOL].unmount(
                this,
                this[PARENT_KEY_SYMBOL],
                preserveRoot === null ? null : !preserveRoot,
              );
              this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);

              return this
            },
          },
        ),
      ),
      Object.keys(component).filter((prop) => isFunction(component[prop])),
    )
  }

  /**
   * Component definition function
   * @param  {object} component - the component initial properties
   * @param  {string}  component.css - component css string
   * @param  {TemplateChunk} component.template - component template rendering
   * @param  {object} component.componentAPI - component export default value
   * @param  {string} component.name - component name
   * @returns {object} a new component implementation object
   */
  function instantiateComponent({ css, template, componentAPI, name }) {
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);

    return curry(manageComponentLifecycle)(
      defineProperties(
        // set the component defaults without overriding the original component API
        defineDefaults(componentAPI, {
          ...COMPONENT_LIFECYCLE_METHODS,
          [PROPS_KEY]: {},
          [STATE_KEY]: {},
        }),
        {
          // defined during the component creation
          [SLOTS_KEY]: null,
          [ROOT_KEY]: null,
          // these properties should not be overriden
          ...COMPONENT_DOM_SELECTORS,
          name,
          css,
          template,
        },
      ),
    )
  }

  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {object} components - components imported in runtime
   * @returns {object} all the components transformed into Riot.Component factory functions
   */
  function createChildrenComponentsObject(components = {}) {
    return Object.entries(callOrAssign(components)).reduce(
      (acc, [key, value]) => {
        acc[camelToDashCase(key)] = createComponentFromWrapper(value);
        return acc
      },
      {},
    )
  }

  /**
   * Create the getter function to render the child components
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @returns {Function} function returning the component factory function
   */
  const createChildComponentGetter = (componentWrapper) => {
    const childrenComponents = createChildrenComponentsObject(
      componentWrapper.exports ? componentWrapper.exports.components : {},
    );

    return (name) => {
      // improve support for recursive components
      if (name === componentWrapper.name)
        return memoizedCreateComponentFromWrapper(componentWrapper)
      // return the registered components
      return childrenComponents[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
    }
  };

  /**
   * Performance optimization for the recursive components
   * @param  {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @returns {object} component like interface
   */
  const memoizedCreateComponentFromWrapper = memoize$1(createComponentFromWrapper);

  /**
   * Create the component interface needed for the @riotjs/dom-bindings tag bindings
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @param   {string} componentWrapper.css - component css
   * @param   {Function} componentWrapper.template - function that will return the dom-bindings template function
   * @param   {object} componentWrapper.exports - component interface
   * @param   {string} componentWrapper.name - component name
   * @returns {object} component like interface
   */
  function createComponentFromWrapper(componentWrapper) {
    const { css, template, exports, name } = componentWrapper;
    const templateFn = template
      ? componentTemplateFactory(
          template,
          componentWrapper,
          createChildComponentGetter(componentWrapper),
        )
      : MOCKED_TEMPLATE_INTERFACE;

    return ({ slots, attributes, props }) => {
      // pure components rendering will be managed by the end user
      if (exports && exports[IS_PURE_SYMBOL])
        return createPureComponent(exports, {
          slots,
          attributes,
          props,
          css,
          template,
        })

      const componentAPI = callOrAssign(exports) || {};

      const component = instantiateComponent({
        css,
        template: templateFn,
        componentAPI,
        name,
      })({ slots, attributes, props });

      // notice that for the components created via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state
      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope)
        },
        update(parentScope, state) {
          return component.update(state, parentScope)
        },
        unmount(preserveRoot) {
          return component.unmount(preserveRoot)
        },
      }
    }
  }

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {object} implementation - tag implementation
   * @param   {string} implementation.css - component css as string
   * @param   {TemplateChunk} implementation.template - component template chunk rendering function
   * @param   {object} implementation.exports - component default export
   * @returns {Map} map containing all the components implementations
   */
  function register(name, { css, template, exports }) {
    if (COMPONENTS_IMPLEMENTATION_MAP.has(name))
      panic$1(`The component "${name}" was already registered`);

    COMPONENTS_IMPLEMENTATION_MAP.set(
      name,
      createComponentFromWrapper({ name, css, template, exports }),
    );

    return COMPONENTS_IMPLEMENTATION_MAP
  }

  /**
   * Unregister a riot web component
   * @param   {string} name - component name
   * @returns {Map} map containing all the components implementations
   */
  function unregister(name) {
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name))
      panic$1(`The component "${name}" was never registered`);

    COMPONENTS_IMPLEMENTATION_MAP.delete(name);
    cssManager.remove(name);

    return COMPONENTS_IMPLEMENTATION_MAP
  }

  /**
   * Sweet unmounting helper function for the DOM node mounted manually by the user
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {boolean|null} keepRootElement - if true keep the root element
   * @returns {Array} list of nodes unmounted
   */
  function unmount(selector, keepRootElement) {
    return $(selector).map((element) => {
      if (element[DOM_COMPONENT_INSTANCE_PROPERTY]) {
        element[DOM_COMPONENT_INSTANCE_PROPERTY].unmount(keepRootElement);
      }
      return element
    })
  }

  /**
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */
  function install(plugin) {
    if (!isFunction(plugin)) panic$1('Plugins must be of type function');
    if (PLUGINS_SET.has(plugin)) panic$1('This plugin was already installed');

    PLUGINS_SET.add(plugin);

    return PLUGINS_SET
  }

  /**
   * Uninstall a riot plugin
   * @param   {Function} plugin - plugin previously installed
   * @returns {Set} the set containing all the plugins installed
   */
  function uninstall(plugin) {
    if (!PLUGINS_SET.has(plugin)) panic$1('This plugin was never installed');

    PLUGINS_SET.delete(plugin);

    return PLUGINS_SET
  }

  /**
   * Lift a riot component Interface into a pure riot object
   * @param   {Function} func - RiotPureComponent factory function
   * @returns {Function} the lifted original function received as argument
   */
  function pure(func) {
    if (!isFunction(func))
      panic$1('riot.pure accepts only arguments of type "function"');
    func[IS_PURE_SYMBOL] = true;
    return func
  }

  /**
   * no-op function needed to add the proper types to your component via typescript
   * @param {Function | object} component - component default export
   * @returns {Function | object} returns exactly what it has received
   */
  /* istanbul ignore next */
  const withTypes = (component) => component;

  /** @type {string} current riot version */
  const version = 'v10.0.0-rc.1';

  // expose some internal stuff that might be used from external tools
  const __ = {
    cssManager,
    DOMBindings: {
      template: create,
      createBinding: create$1,
      createExpression: create$4,
      bindingTypes,
      expressionTypes,
    },
    globals: {
      PROPS_KEY,
      STATE_KEY,
      IS_COMPONENT_UPDATING,
      COMPONENTS_IMPLEMENTATION_MAP,
      PLUGINS_SET,
      DOM_COMPONENT_INSTANCE_PROPERTY,
      PARENT_KEY_SYMBOL,
    },
  };

  // eslint-disable-next-line import/no-unresolved

  async function compileFromUrl(url, options) {
    const response = await fetch(url);

    const code = await response.text();

    return compile$1(code, { file: url, ...options })
  }

  const GLOBAL_REGISTRY = '__riot_registry__';

  /* istanbul ignore next */
  function defineWindowRiotGlobalRegistry() {
    window[GLOBAL_REGISTRY] = window[GLOBAL_REGISTRY] || {};
  }

  const isBrowser = typeof process === 'undefined';

  /* c8 ignore start */
  const evaluateWithScriptInjection = (code, url) => {
    const node = document.createElement('script');
    const root = document.documentElement;
    // make the source available in the "(no domain)" tab
    // of Chrome DevTools, with a .js extension
    node.text = url ? `${code}\n//# sourceURL=${url}.js` : code;

    root.appendChild(node);
    root.removeChild(node);
  };
  /* c8 ignore end */

  // evaluates a compiled tag within the global context
  function evaluate(code, url) {
    // browsers can evaluate the code via script injection and sourcemaps
    /* c8 ignore start */
    if (isBrowser) evaluateWithScriptInjection(code, url);
    /* c8 ignore end */
    // in other environments we rely on a simple Function eval
    else new Function(code)();
  }

  /**
   * Component initialization function starting from a DOM node
   * @param   {HTMLElement} element - element to upgrade
   * @param   {object} initialProps - initial component properties
   * @param   {string} componentName - component id
   * @param   {Array} slots - component slots
   * @returns {object} a new component instance bound to a DOM node
   */
  function mountComponent(element, initialProps, componentName, slots) {
    const name = componentName || getName(element);
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name))
      panic$1(`The component named "${name}" was never registered`);

    const component = COMPONENTS_IMPLEMENTATION_MAP.get(name)({
      props: initialProps,
      slots,
    });

    return component.mount(element)
  }

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  function compose(...fns) {
    return fns.reduce((f, g) => (...args) => f(g(...args)))
  }

  /**
   * Helper method to create component without relying on the registered ones
   * @param   {object} implementation - component implementation
   * @returns {Function} function that will allow you to mount a riot component on a DOM node
   */
  function component$1(implementation) {
    return (el, props, { slots, attributes, parentScope } = {}) =>
      compose(
        (c) => c.mount(el, parentScope),
        (c) => c({ props, slots, attributes }),
        createComponentFromWrapper,
      )(implementation)
  }

  // cheap module transpilation
  function transpile(code) {
    return `(function (global){${code}})(this)`.replace(
      'export default',
      'return',
    )
  }

  function inject(code, tagName, url) {
    defineWindowRiotGlobalRegistry();
    evaluate(`window.${GLOBAL_REGISTRY}['${tagName}'] = ${transpile(code)}`, url);

    register(tagName, window[GLOBAL_REGISTRY][tagName]);
  }

  async function compile(options) {
    const scripts = $('script[type="riot"]');
    const urls = scripts.map((s) => get(s, 'src') || get(s, 'data-src'));
    const tags = await Promise.all(
      urls.map((url) => compileFromUrl(url, options)),
    );

    tags.forEach(({ code, meta }, i) => {
      const url = urls[i];
      const { tagName } = meta;

      inject(code, tagName, url);
    });
  }

  /**
   * Create slots reading the inner HTML of the node
   * @param {HTMLElement} el element we are going to mount
   * @returns {[]|null} Slots array
   */
  function createRuntimeSlots(el) {
    if (!el.innerHTML.trim()) return null
    const slotsCode = generateSlotsFromString(el.outerHTML);

    // clear the DOM node once read
    el.innerHTML = '';

    // parse the element html to create the runtime bindings
    return Function(`return ${slotsCode}`)()(
      create,
      expressionTypes,
      bindingTypes,
      (name) => COMPONENTS_IMPLEMENTATION_MAP.get(name),
    )
  }

  /**
   * Mounting function that will work only for the components that were globally registered
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {object} initialProps - the initial component properties
   * @param   {string} name - optional component name
   * @returns {Array} list of riot components
   */
  function mount(selector, initialProps, name) {
    return $(selector).map((element) =>
      mountComponent(element, initialProps, name, createRuntimeSlots(element)),
    )
  }

  // wrap the original riot component function
  // to create the slots from the DOM node
  function component(implementation) {
    const factory = component$1(implementation);

    return (el, props, { slots, attributes, parentScope } = {}) => {
      return factory(el, props, {
        slots: slots || createRuntimeSlots(el),
        attributes,
        parentScope,
      })
    }
  }

  // eslint-disable-next-line import/no-unresolved

  function compileFromString(string, options) {
    return compile$1(string, options)
  }

  exports.__ = __;
  exports.compile = compile;
  exports.compileFromString = compileFromString;
  exports.compileFromUrl = compileFromUrl;
  exports.compiler = compiler_essential;
  exports.component = component;
  exports.inject = inject;
  exports.install = install;
  exports.mount = mount;
  exports.pure = pure;
  exports.register = register;
  exports.uninstall = uninstall;
  exports.unmount = unmount;
  exports.unregister = unregister;
  exports.version = version;
  exports.withTypes = withTypes;

}));
