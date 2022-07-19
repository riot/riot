import {createCoreAPIMethods} from './create-core-api-methods'
import {createExpression} from '@riotjs/dom-bindings'

/**
 * Create the bindings to update the component attributes
 * @param   {HTMLElement} node - node where we will bind the expressions
 * @param   {Array} attributes - list of attribute bindings
 * @returns {TemplateChunk} - template bindings object
 */
export function createAttributeBindings(node, attributes = []) {
  const expressions = attributes.map(a => createExpression(node, a))
  const binding = {}

  return Object.assign(binding, {
    expressions,
    ...createCoreAPIMethods(method => scope => {
      expressions.forEach(e => e[method](scope))

      return binding
    })
  })
}
