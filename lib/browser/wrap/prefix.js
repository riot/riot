/* Riot WIP, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window) {
  'use strict'
  var riot = { version: 'WIP', settings: {} }

  // This globals 'const' helps code size reduction

  // for typeof == '' comparisons
  var T_STRING = 'string'
  var T_OBJECT = 'object'

  // for IE8 and rest of the world
  var isArray = Array.isArray || (function () {
    var _ts = Object.prototype.toString
    return function (v) { return _ts.call(v) === '[object Array]' }
  })()

  // Version# for IE 8-11, 0 for others
  var ieVersion = (function (win) {
    return (win && win.document || {}).documentMode | 0
  })(window)
