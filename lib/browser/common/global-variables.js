export
const
  // be aware, internal usage
  // ATTENTION: prefix the global dynamic variables with `__`
  // tags instances cache
  __TAGS_CACHE = [],
  // tags implementation cache
  __TAG_IMPL = {},
  YIELD_TAG = 'yield',

  /**
   * Const
   */
  GLOBAL_MIXIN = '__global_mixin',

  // riot specific prefixes or attributes
  ATTRS_PREFIX = 'riot-',

  // Riot Directives
  REF_DIRECTIVES = ['ref', 'data-ref'],
  IS_DIRECTIVE = 'data-is',
  CONDITIONAL_DIRECTIVE = 'if',
  LOOP_DIRECTIVE = 'each',
  LOOP_NO_REORDER_DIRECTIVE = 'no-reorder',
  SHOW_DIRECTIVE = 'show',
  HIDE_DIRECTIVE = 'hide',
  KEY_DIRECTIVE = 'key',
  RIOT_EVENTS_KEY = '__riot-events__',

  // for typeof == '' comparisons
  T_STRING = 'string',
  T_OBJECT = 'object',
  T_UNDEF  = 'undefined',
  T_FUNCTION = 'function',

  XLINK_NS = 'http://www.w3.org/1999/xlink',
  SVG_NS = 'http://www.w3.org/2000/svg',
  XLINK_REGEX = /^xlink:(\w+)/,

  WIN = typeof window === T_UNDEF ? /* istanbul ignore next */ undefined : window,

  // special native tags that cannot be treated like the others
  RE_SPECIAL_TAGS = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/,
  RE_SPECIAL_TAGS_NO_OPTION = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/,
  RE_EVENTS_PREFIX = /^on/,
  RE_HTML_ATTRS = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g,
  // some DOM attributes must be normalized
  CASE_SENSITIVE_ATTRIBUTES = {
    'viewbox': 'viewBox',
    'preserveaspectratio': 'preserveAspectRatio'
  },
  /**
   * Matches boolean HTML attributes in the riot tag definition.
   * With a long list like this, a regex is faster than `[].indexOf` in most browsers.
   * @const {RegExp}
   * @see [attributes.md](https://github.com/riot/compiler/blob/dev/doc/attributes.md)
   */
  RE_BOOL_ATTRS = /^(?:disabled|checked|readonly|required|allowfullscreen|auto(?:focus|play)|compact|controls|default|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|no(?:resize|shade|validate|wrap)?|open|reversed|seamless|selected|sortable|truespeed|typemustmatch)$/,
  // version# for IE 8-11, 0 for others
  IE_VERSION = (WIN && WIN.document || /* istanbul ignore next */ {}).documentMode | 0
