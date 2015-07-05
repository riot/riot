(function (root, factory) {
    if (typeof define === 'function' && define.amd)
      define(['riot'], factory)
    else if (typeof exports === 'object')
      factory(exports, require('riot'))
    else factory(window, root.riot)
}(this, function (window, riot) {
