export const
  COMPONENTS_IMPLEMENTATION_MAP = new Map(),
  MIXINS_MAP = new Map(),
  PLUGINS_SET = new Set(),
  DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
  IS_DIRECTIVE = 'is'