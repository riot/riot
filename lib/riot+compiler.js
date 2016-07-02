import * as riot from './riot'
import { compile, parsers } from './browser/compiler/index'
import { extend } from './browser/util'

function mount(a, b, c) {
  var ret
  compile(function () { ret = riot.mount(a, b, c) })
  return ret
}

export default extend({}, riot, {
  mount,
  compile,
  parsers
})