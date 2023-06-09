import compose from 'cumpa'
import { createComponentFromWrapper } from '../core/create-component-from-wrapper.js'
/**
 * Helper method to create component without relying on the registered ones
 * @param   {Object} implementation - component implementation
 * @returns {Function} function that will allow you to mount a riot component on a DOM node
 */
export function component(implementation) {
  return (el, props, { slots, attributes, parentScope } = {}) =>
    compose(
      (c) => c.mount(el, parentScope),
      (c) => c({ props, slots, attributes }),
      createComponentFromWrapper,
    )(implementation)
}
