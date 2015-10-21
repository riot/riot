(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd)
      define(['riot'], factory)
    else if (typeof exports === 'object')
      factory(require('riot'))
    else factory(root.riot)
}(this, function (riot, undefined) {

  var
    T_STRING = 'string',
    O_GLOBAL = typeof window === 'object' ? window : global

  var require = function (name) {
    return name in O_GLOBAL ? O_GLOBAL[name] : null
  }
  require.resolve = function (name) {
    return name in O_GLOBAL
  }

  var brackets = riot.util.brackets
