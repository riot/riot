/* Riot WIP, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window, undefined) {
  'use strict'
  var riot = { version: 'WIP', settings: {} },

      // counter to give a unique id to all the Tag instances
      __uid = 0,

      // for typeof == '' comparisons
      T_STRING = 'string',
      T_OBJECT = 'object',
      T_UNDEF  = 'undefined',
      T_FUNCTION = 'function',

      // for riot specific attributes
      RIOT_PREFIX = 'riot-',
      RIOT_TAG = RIOT_PREFIX + 'tag',

      // version# for IE 8-11, zero for other browsers
      IE_VERSION = (window && window.document || {}).documentMode | 0,

      // Array.isArray for IE8 is in the polyfills
      isArray = Array.isArray
