import {bindingTypes, template as createTemplate, expressionTypes} from '@riotjs/dom-bindings'

/**
 * Factory function to create the component templates only once
 * @param   {Function} template - component template creation function
 * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @param   {Function} getChildComponent - getter function to return the children components
 * @returns {TemplateChunk} template chunk object
 */
export function componentTemplateFactory(template, componentWrapper, getChildComponent) {
  return template(
    createTemplate,
    expressionTypes,
    bindingTypes,
    getChildComponent
  )
}
