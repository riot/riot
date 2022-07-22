import {callOrAssign, camelToDashCase} from '@riotjs/util'
import {createComponentFromWrapper} from './create-component-from-wrapper'
/**
 * Create the subcomponents that can be included inside a tag in runtime
 * @param   {Object} components - components imported in runtime
 * @returns {Object} all the components transformed into Riot.Component factory functions
 */
export function createChildrenComponentsObject(components = {}) {
  return Object.entries(callOrAssign(components))
    .reduce((acc, [key, value]) => {
      acc[camelToDashCase(key)] = createComponentFromWrapper(value)
      return acc
    }, {})
}
