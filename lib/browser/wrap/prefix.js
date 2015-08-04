/* Riot WIP, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window, undefined) {
  'use strict'
  var riot = { version: 'WIP', settings: {} },
      // counter to give a unique id to all the Tag instances
      __uid = 0

  // This globals 'const' helps code size reduction

  // for typeof == '' comparisons
  var T_STRING = 'string',
      T_OBJECT = 'object',
      T_UNDEF  = 'undefined',
      T_FUNCTION  = 'function',
      RESERVED_WORDS_BLACKLIST = ['update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one']

  // for IE8 and rest of the world
  /* istanbul ignore next */
  var isArray = Array.isArray || (function () {
    var _ts = Object.prototype.toString
    return function (v) { return _ts.call(v) === '[object Array]' }
  })()

  // Version# for IE 8-11, 0 for others
  var ieVersion = (function (win) {
    return (window && window.document || {}).documentMode | 0
  })()
