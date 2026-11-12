import {
  COMPONENTS_IMPLEMENTATION_MAP,
  IS_PURE_SYMBOL,
  UPDATE_COMPONENTS_SYMBOL,
  callOrAssign,
  camelToDashCase,
  defineProperty,
  memoize,
} from '@riotjs/util'
import { MOCKED_TEMPLATE_INTERFACE } from './mocked-template-interface.js'
import { componentTemplateFactory } from './component-template-factory.js'
import { createPureComponent } from './create-pure-component.js'
import { instantiateComponent } from './instantiate-component.js'

/**
 * Create the object containing the children components.
 * @param   {object} components - components imported in runtime
 * @returns {object} all the components transformed into Riot.Component factory functions
 */
function createChildrenComponents(components = {}) {
  return Object.entries(callOrAssign(components) || {}).reduce(
    (acc, [key, value]) => {
      acc[camelToDashCase(key)] = createComponentFromWrapper(value)
      return acc
    },
    {},
  )
}

/**
 * Create the callable proxy containing the children components.
 * It normalizes on write the components names and factories and it can be
 * called to update its components.
 * @param   {object} components - components imported in runtime
 * @returns {Proxy} callable proxy containing the children components factories
 */
function createChildrenComponentsProxy(components = {}) {
  return new Proxy(() => {}, {
    componentsMap: createChildrenComponents(components),
    get(_, name) {
      return this.componentsMap[name]
    },
    apply(_, __, [name, component]) {
      // replace only the given component, keeping the previous ones
      Object.assign(this.componentsMap, {
        [camelToDashCase(name)]: createComponentFromWrapper(component),
      })
    },
  })
}

/**
 * Create the getter function to render the child components
 * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @param   {Proxy} childrenComponents - proxy containing the children components factories
 * @returns {Function} function returning the component factory function
 */
const createChildComponentGetter =
  (componentWrapper, childrenComponents) => (name) => {
    // improve support for recursive components
    if (name === componentWrapper.name)
      return memoizedCreateComponentFromWrapper(componentWrapper)
    // return the children components resolving also the globally registered ones
    return childrenComponents[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
  }

/**
 * Performance optimization for the recursive components
 * @param  {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @returns {object} component like interface
 */
const memoizedCreateComponentFromWrapper = memoize(createComponentFromWrapper)

/**
 * Create the component interface needed for the @riotjs/dom-bindings tag bindings
 * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @param   {string} componentWrapper.css - component css
 * @param   {Function} componentWrapper.template - function that will return the dom-bindings template function
 * @param   {object} componentWrapper.exports - component interface
 * @param   {string} componentWrapper.name - component name
 * @returns {object} component like interface
 */
export function createComponentFromWrapper(componentWrapper) {
  const { css, template, exports, name } = componentWrapper
  const componentsSource = exports ? exports.components : null
  // The Proxy is needed only in development and only when the component has
  // children components. The condition is inlined so that bundlers can
  // tree-shake the Proxy code in the production builds
  const childrenComponents =
    componentsSource &&
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'development'
      ? createChildrenComponentsProxy(componentsSource)
      : createChildrenComponents(componentsSource)
  // update the children components (used by @riotjs/hot-reload):
  // the Proxy is callable and replaces the given component when invoked,
  // otherwise we assign it to the plain object
  const updateComponents =
    typeof childrenComponents === 'function'
      ? childrenComponents
      : (name, component) =>
          Object.assign(childrenComponents, {
            [camelToDashCase(name)]: createComponentFromWrapper(component),
          })
  const templateFn = template
    ? componentTemplateFactory(
        template,
        componentWrapper,
        createChildComponentGetter(componentWrapper, childrenComponents),
      )
    : MOCKED_TEMPLATE_INTERFACE

  return ({ slots, attributes, props }) => {
    // pure components rendering will be managed by the end user
    if (exports && exports[IS_PURE_SYMBOL])
      return createPureComponent(exports, {
        slots,
        attributes,
        props,
        css,
        template,
      })

    const componentAPI = callOrAssign(exports) || {}

    const component = instantiateComponent({
      css,
      template: templateFn,
      componentAPI,
      name,
    })({ slots, attributes, props })

    // method callable via symbol to update the internal children components
    // used by the component template (needed by @riotjs/hot-reload)
    defineProperty(component, UPDATE_COMPONENTS_SYMBOL, updateComponents)

    // notice that for the components created via tag binding
    // we need to invert the mount (state/parentScope) arguments
    // the template bindings will only forward the parentScope updates
    // and never deal with the component state
    return {
      mount(element, parentScope, state) {
        return component.mount(element, state, parentScope)
      },
      update(parentScope, state) {
        return component.update(state, parentScope)
      },
      unmount(preserveRoot) {
        return component.unmount(preserveRoot)
      },
    }
  }
}
