(function (root, factory) {
    if (typeof define === 'function' && define.amd)
      define(['riot'], factory)
    else if (typeof exports === 'object')
      factory(require('riot'))
    else factory(root.riot)
}(this, function (riot, undefined) {

  var T_STRING = 'string'
