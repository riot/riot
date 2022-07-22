import {
  ATTRIBUTES_KEY_SYMBOL,
  COMPONENTS_IMPLEMENTATION_MAP,
  DOM_COMPONENT_INSTANCE_PROPERTY,
  IS_COMPONENT_UPDATING,
  IS_DIRECTIVE,
  IS_PURE_SYMBOL,
  MOUNT_METHOD_KEY,
  ON_BEFORE_MOUNT_KEY,
  ON_BEFORE_UNMOUNT_KEY,
  ON_BEFORE_UPDATE_KEY,
  ON_MOUNTED_KEY,
  ON_UNMOUNTED_KEY,
  ON_UPDATED_KEY,
  PARENT_KEY_SYMBOL,
  PLUGINS_SET,
  PROPS_KEY,
  ROOT_KEY,
  SHOULD_UPDATE_KEY,
  SLOTS_KEY,
  STATE_KEY,
  TEMPLATE_KEY_SYMBOL,
  UNMOUNT_METHOD_KEY,
  UPDATE_METHOD_KEY,
  VALUE_ATTRIBUTE
} from '@riotjs/util'
import {bindingTypes, createBinding, createExpression,expressionTypes, template} from '@riotjs/dom-bindings'
import {createComponentFromWrapper} from '../core/create-component-from-wrapper'
import cssManager from '../core/css-manager'
import {instantiateComponent} from '../core/instantiate-component'

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
  createComponentFromWrapper,
  instantiateComponent,
  globals: {
    ATTRIBUTES_KEY_SYMBOL,
    COMPONENTS_IMPLEMENTATION_MAP,
    DOM_COMPONENT_INSTANCE_PROPERTY,
    IS_COMPONENT_UPDATING,
    IS_DIRECTIVE,
    IS_PURE_SYMBOL,
    MOUNT_METHOD_KEY,
    ON_BEFORE_MOUNT_KEY,
    ON_BEFORE_UNMOUNT_KEY,
    ON_BEFORE_UPDATE_KEY,
    ON_MOUNTED_KEY,
    ON_UNMOUNTED_KEY,
    ON_UPDATED_KEY,
    PARENT_KEY_SYMBOL,
    PLUGINS_SET,
    PROPS_KEY,
    ROOT_KEY,
    SHOULD_UPDATE_KEY,
    SLOTS_KEY,
    STATE_KEY,
    TEMPLATE_KEY_SYMBOL,
    UNMOUNT_METHOD_KEY,
    UPDATE_METHOD_KEY,
    VALUE_ATTRIBUTE
  }
}
