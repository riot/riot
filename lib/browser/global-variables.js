// be aware, internal usage
// ATTENTION: prefix the global dynamic variables with `__`
// counter to give a unique id to all the Tag instances
export var __uid = 0
// tags instances cache
export var __virtualDom = []
// tags implementation cache
export var  __tagImpl = {}
/**
 * Const
 */
// riot specific prefixes
export const  RIOT_PREFIX = 'riot-'
export const  RIOT_TAG = RIOT_PREFIX + 'tag'
// for typeof == '' comparisons
export const  T_STRING = 'string'
export const  T_OBJECT = 'object'
export const  T_UNDEF  = 'undefined'
export const  T_FUNCTION = 'function'
// special native tags that cannot be treated like the others
export const  SPECIAL_TAGS_REGEX = /^(?:opt(ion|group)|tbody|col|t[rhd])$/
export const  RESERVED_WORDS_BLACKLIST = ['_item', '_id', '_parent', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one']
// version# for IE 8-11, 0 for others
export const  IE_VERSION = (window && window.document || {}).documentMode | 0
