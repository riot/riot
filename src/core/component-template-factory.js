import {bindingTypes, template as createTemplate, expressionTypes} from '@riotjs/dom-bindings'
import {COMPONENTS_IMPLEMENTATION_MAP} from '@riotjs/util'
import {createChildrenComponentsObject} from './create-children-components-object'
import {memoizedCreateComponentFromWrapper} from './create-component-from-wrapper'

/**
 * Factory function to create the component templates only once
 * @param   {Function} template - component template creation function
 * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @returns {TemplateChunk} template chunk object
 */
export function componentTemplateFactory(template, componentWrapper) {
  const components = createChildrenComponentsObject(componentWrapper.exports ? componentWrapper.exports.components : {})

  return template(
    createTemplate,
    expressionTypes,
    bindingTypes,
    name => {
      // improve support for recursive components
      if (name === componentWrapper.name) return memoizedCreateComponentFromWrapper(componentWrapper)
      // return the registered components
      return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
    }
  )
}
