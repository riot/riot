(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd)
      define(['riot'], factory)
    else if (typeof exports === 'object')
      factory(require('riot'))
    else factory(root.riot)
}(this, function (riot, undefined) {

  if (typeof riot.util !== 'object')
    throw new Error('riot is required for riot.compile')

  var brackets = riot.util.brackets
