import { expressionTypes } from '@riotjs/dom-bindings'
import { memoize } from '@riotjs/util'

/**
 * Get the computed attribute names from the template instance
 * Since these attributes will not change we memoize the result of this computation
 * @param {TemplateChunk} template - template instance
 * @return {[]} list of attribute names that will be computed by the template expressions
 */
export const getRootComputedAttributeNames = memoize(
  (template) =>
    template?.bindingsData?.[0].expressions?.reduce(
      (acc, { name, type }) =>
        type === expressionTypes.ATTRIBUTE ? [...acc, name] : acc,
      [],
    ) ?? [],
)
