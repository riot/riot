import {IS_PURE_SYMBOL, callOrAssign, memoize} from '@riotjs/util'
import {MOCKED_TEMPLATE_INTERFACE} from './mocked-template-interface'
import {componentTemplateFactory} from './component-template-factory'
import {createPureComponent} from './create-pure-component'
import {instantiateComponent} from './instantiate-component'

/**
 * Create the component interface needed for the @riotjs/dom-bindings tag bindings
 * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @param   {string} componentWrapper.css - component css
 * @param   {Function} componentWrapper.template - function that will return the dom-bindings template function
 * @param   {Object} componentWrapper.exports - component interface
 * @param   {string} componentWrapper.name - component name
 * @returns {Object} component like interface
 */
export function createComponentFromWrapper(componentWrapper) {
  const {css, template, exports, name} = componentWrapper
  const templateFn = template ? componentTemplateFactory(
    template,
    componentWrapper
  ) : MOCKED_TEMPLATE_INTERFACE

  return ({slots, attributes, props}) => {
    // pure components rendering will be managed by the end user
    if (exports && exports[IS_PURE_SYMBOL])
      return createPureComponent(
        exports,
        { slots, attributes, props, css, template }
      )

    const componentAPI = callOrAssign(exports) || {}

    const component = instantiateComponent({
      css,
      template: templateFn,
      componentAPI,
      name
    })({slots, attributes, props})

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
      }
    }
  }
}

/**
 * Performance optimization for the recursive components
 * @param  {RiotComponentWrapper} componentWrapper - riot compiler generated object
 * @returns {Object} component like interface
 */
export const memoizedCreateComponentFromWrapper = memoize(createComponentFromWrapper)

