import {IS_PURE_SYMBOL} from '@riotjs/util/constants'
import {isFunction} from '@riotjs/util/checks'
import {panic} from '@riotjs/util/misc'

/**
 * Lift a riot component Interface into a pure riot object
 * @param   {Function} func - RiotPureComponent factory function
 * @returns {Function} the lifted original function received as argument
 */
export function pure(func) {
  if (!isFunction(func)) panic('riot.pure accepts only arguments of type "function"')
  func[IS_PURE_SYMBOL] = true
  return func
}
