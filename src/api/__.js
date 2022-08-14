import {DOM_COMPONENT_INSTANCE_PROPERTY, PARENT_KEY_SYMBOL} from '@riotjs/util'
import {bindingTypes, createBinding, createExpression,expressionTypes, template} from '@riotjs/dom-bindings'
import cssManager from '../core/css-manager'

// expose some internal stuff that might be used from external tools
export const __ = {
  cssManager,
  DOMBindings: {
    template,
    createBinding,
    createExpression,
    bindingTypes,
    expressionTypes
  },
  globals: {
    DOM_COMPONENT_INSTANCE_PROPERTY,
    PARENT_KEY_SYMBOL
  }
}
