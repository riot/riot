import {IS_PURE_SYMBOL, isFunction, panic} from '@riotjs/util'

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
