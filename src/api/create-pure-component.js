import { createPureComponent as create } from '../core/create-pure-component.js'
import { pure } from './pure.js'

/**
 * Helper method to simplify the creation of pure components without the need to rely on a .riot file
 * @param {Function} func - RiotPureComponent factory function
 * @returns {PureComponentFactoryFunction} pure component object implementation
 */
export function createPureComponent(func) {
  return ({ slots, attributes, props }) =>
    create(pure(func), {
      attributes,
      slots,
      props,
    })
}
