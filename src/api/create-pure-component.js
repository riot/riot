import { createPureComponent as create } from '../core/create-pure-component.js'
import { pure } from './pure.js'

/**
 * Helper method to simplify the creation of pure components without the need to rely on a .riot file
 * @param {Function} func - RiotPureComponent factory function
 * @param {string} name - Optional parameter if you want to define the name of your component for debugging purposes
 * @returns {import('../../riot.js').RiotComponentWrapper} pure component object implementation
 */
export function createPureComponent(func, name) {
  return {
    name,
    exports: pure(({ slots, attributes, props }) =>
      create(func, {
        attributes,
        slots,
        props,
      }),
    ),
  }
}
