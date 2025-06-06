import { expressionTypes } from '@riotjs/dom-bindings'
import { memoize } from '@riotjs/util'

/**
 * Get the computed attribute names from the template instance
 * Since these attributes will not change we memoize the result of this computation
 * @param {TemplateChunk} template - template instance
 * @returns {[]} list of attribute names that will be computed by the template expressions
 */
export const getRootComputedAttributeNames = memoize((template) => {
  const firstBinding = template?.bindingsData?.[0]

  // if the first binding has the selector attribute it means that it doesn't belong to the root node
  if (firstBinding?.selector) return []

  return (
    firstBinding?.expressions?.reduce(
      (acc, { name, type }) =>
        type === expressionTypes.ATTRIBUTE ? acc.concat([name]) : acc,
      [],
    ) ?? []
  )
})
