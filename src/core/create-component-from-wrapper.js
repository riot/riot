import {
  COMPONENTS_IMPLEMENTATION_MAP,
  IS_PURE_SYMBOL,
  callOrAssign,
  camelToDashCase,
  memoize,
} from '@riotjs/util'
import { MOCKED_TEMPLATE_INTERFACE } from './mocked-template-interface.js'
import { componentTemplateFactory } from './component-template-factory.js'
import { createPureComponent } from './create-pure-component.js'
import { instantiateComponent } from './instantiate-component.js'
/**
 * Create the subcomponents that can be included inside a tag in runtime
 * @param   {object} components - components imported in runtime
 * @returns {object} all the components transformed into Riot.Component factory functions
 */
function createChildrenComponentsObject(components = {}) {
  return Object.entries(callOrAssign(components)).reduce(
    (acc, [key, value]) => {
      acc[camelToDashCase(key)] = createComponentFromWrapper(value)
      return acc
    },
    {},
  )
}

/**
 * Create the getter function to render the child components
 * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @returns {Function} function returning the component factory function
 */
const createChildComponentGetter = (componentWrapper) => {
  const childrenComponents = createChildrenComponentsObject(
    componentWrapper.exports ? componentWrapper.exports.components : {},
  )

  return (name) => {
    // improve support for recursive components
    if (name === componentWrapper.name)
      return memoizedCreateComponentFromWrapper(componentWrapper)
    // return the registered components
    return childrenComponents[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
  }
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
  const templateFn = template
    ? componentTemplateFactory(
        template,
        componentWrapper,
        createChildComponentGetter(componentWrapper),
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
