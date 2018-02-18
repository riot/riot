import * as riot from './riot'
import { compile, parsers } from './browser/compiler/index'
import extend from './browser/common/util/misc/extend'

function mount(...args) {
  var ret
  compile(function () { ret = riot.mount.apply(riot, args) })
  return ret
}

export default extend({}, riot, {
  mount,
  compile,
  parsers
})
