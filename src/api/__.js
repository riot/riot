import {
  COMPONENTS_IMPLEMENTATION_MAP,
  DOM_COMPONENT_INSTANCE_PROPERTY,
  IS_COMPONENT_UPDATING,
  PARENT_KEY_SYMBOL,
  PLUGINS_SET,
  PROPS_KEY,
  STATE_KEY,
} from '@riotjs/util'
import {
  bindingTypes,
  createBinding,
  createExpression,
  expressionTypes,
  template,
} from '@riotjs/dom-bindings'
import cssManager from '../core/css-manager.js'

// expose some internal stuff that might be used from external tools
export const __ = {
  cssManager,
  DOMBindings: {
    template,
    createBinding,
    createExpression,
    bindingTypes,
    expressionTypes,
  },
  globals: {
    PROPS_KEY,
    STATE_KEY,
    IS_COMPONENT_UPDATING,
    COMPONENTS_IMPLEMENTATION_MAP,
    PLUGINS_SET,
    DOM_COMPONENT_INSTANCE_PROPERTY,
    PARENT_KEY_SYMBOL,
  },
}
