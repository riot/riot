import {
  ATTRIBUTES_KEY_SYMBOL,
  COMPONENTS_IMPLEMENTATION_MAP,
  DOM_COMPONENT_INSTANCE_PROPERTY,
  PLUGINS_SET,
  TEMPLATE_KEY_SYMBOL
} from '../globals'
import {DOMattributesToObject, getName} from '../utils/dom'
import {
  autobindMethods,
  callOrAssign,
  camelToDashCase,
  defineDefaults,
  defineProperties,
  defineProperty,
  evaluateAttributeExpressions,
  noop,
  panic
} from '../utils/misc'
import {bindingTypes, createExpression, template as createTemplate, expressionTypes} from '@riotjs/dom-bindings'
import $ from 'bianco.query'
import cssManager from './css-manager'
import curry from 'curri'
import {isFunction} from '../utils/checks'
import {set as setAttr} from 'bianco.attr'

const COMPONENT_CORE_HELPERS = Object.freeze({
  // component helpers
  $(selector){ return $(selector, this.root)[0] },
  $$(selector){ return $(selector, this.root) }
})

const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
  shouldUpdate: noop,
  onBeforeMount: noop,
  onMounted: noop,
  onBeforeUpdate: noop,
  onUpdated: noop,
  onBeforeUnmount: noop,
  onUnmounted: noop
})

const MOCKED_TEMPLATE_INTERFACE = {
  update: noop,
  mount: noop,
  unmount: noop,
  clone: noop,
  createDOM: noop
}

/**
 * Factory function to create the component templates only once
 * @param   {Function} template - component template creation function
 * @param   {Object} components - object containing the nested components
 * @returns {TemplateChunk} template chunk object
 */
function componentTemplateFactory(template, components) {
  return template(
    createTemplate,
    expressionTypes,
    bindingTypes,
    name => {
      return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
    }
  )
}

/**
 * Create the component interface needed for the @riotjs/dom-bindings tag bindings
 * @param   {string} options.css - component css
 * @param   {Function} options.template - functon that will return the dom-bindings template function
 * @param   {Object} options.exports - component interface
 * @param   {string} options.name - component name
 * @returns {Object} component like interface
 */
export function createComponent({css, template, exports, name}) {
  const templateFn = template ? componentTemplateFactory(
    template,
    exports ? createSubcomponents(exports.components) : {}
  ) : MOCKED_TEMPLATE_INTERFACE

  return ({slots, attributes, props}) => {
    const componentAPI = callOrAssign(exports) || {}

    const component = defineComponent({
      css,
      template: templateFn,
      componentAPI,
      name
    })({slots, attributes, props})

    // notice that for the components create via tag binding
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
 * Component definition function
 * @param   {Object} implementation - the componen implementation will be generated via compiler
 * @param   {Object} component - the component initial properties
 * @returns {Object} a new component implementation object
 */
export function defineComponent({css, template, componentAPI, name}) {
  // add the component css into the DOM
  if (css && name) cssManager.add(name, css)

  return curry(enhanceComponentAPI)(defineProperties(
    // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, {
      ...COMPONENT_LIFECYCLE_METHODS,
      state: {}
    }), {
      // defined during the component creation
      slots: null,
      root: null,
      // these properties should not be overriden
      ...COMPONENT_CORE_HELPERS,
      name,
      css,
      template
    })
  )
}

/**
 * Evaluate the component properties either from its real attributes or from its attribute expressions
 * @param   {HTMLElement} element - component root
 * @param   {Array}  attributeExpressions - attribute values generated via createAttributeBindings
 * @returns {Object} attributes key value pairs
 */
function evaluateProps(element, attributeExpressions = []) {
  return {
    ...DOMattributesToObject(element),
    ...evaluateAttributeExpressions(attributeExpressions)
  }
}

/**
 * Create the bindings to update the component attributes
 * @param   {HTMLElement} node - node where we will bind the expressions
 * @param   {Array} attributes - list of attribute bindings
 * @returns {TemplateChunk} - template bindings object
 */
function createAttributeBindings(node, attributes = []) {
  const expressions = attributes.map(a => createExpression(node, a))
  const binding = {}

  const updateValues = method => scope => {
    expressions.forEach(e => e[method](scope))

    return binding
  }

  return Object.assign(binding, {
    expressions,
    mount: updateValues('mount'),
    update: updateValues('update'),
    unmount: updateValues('unmount')
  })
}

/**
 * Create the subcomponents that can be included inside a tag in runtime
 * @param   {Object} components - components imported in runtime
 * @returns {Object} all the components transformed into Riot.Component factory functions
 */
function createSubcomponents(components = {}) {
  return Object.entries(callOrAssign(components))
    .reduce((acc, [key, value]) => {
      acc[camelToDashCase(key)] = createComponent(value)
      return acc
    }, {})
}

/**
 * Run the component instance through all the plugins set by the user
 * @param   {Object} component - component instance
 * @returns {Object} the component enhanced by the plugins
 */
function runPlugins(component) {
  return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component)
}

/**
 * Compute the component current state merging it with its previous state
 * @param   {Object} oldState - previous state object
 * @param   {Object} newState - new state givent to the `update` call
 * @returns {Object} new object state
 */
function computeState(oldState, newState) {
  return {
    ...oldState,
    ...callOrAssign(newState)
  }
}

/**
 * Add eventually the "is" attribute to link this DOM node to its css
 * @param {HTMLElement} element - target root node
 * @param {string} name - name of the component mounted
 * @returns {undefined} it's a void function
 */
function addCssHook(element, name) {
  if (getName(element) !== name) {
    setAttr(element, 'is', name)
  }
}

/**
 * Component creation factory function that will enhance the user provided API
 * @param   {Object} component - a component implementation previously defined
 * @param   {Array} options.slots - component slots generated via riot compiler
 * @param   {Array} options.attributes - attribute expressions generated via riot compiler
 * @returns {Riot.Component} a riot component instance
 */
export function enhanceComponentAPI(component, {slots, attributes, props}) {
  const initialProps = callOrAssign(props)

  return autobindMethods(
    runPlugins(
      defineProperties(Object.create(component), {
        mount(element, state = {}, parentScope) {
          this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope)

          this.props = Object.freeze({
            ...initialProps,
            ...evaluateProps(element, this[ATTRIBUTES_KEY_SYMBOL].expressions)
          })

          this.state = computeState(this.state, state)
          this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone()

          // link this object to the DOM node
          element[DOM_COMPONENT_INSTANCE_PROPERTY] = this
          // add eventually the 'is' attribute
          component.name && addCssHook(element, component.name)

          // define the root element
          defineProperty(this, 'root', element)
          // define the slots array
          defineProperty(this, 'slots', slots)

          // before mount lifecycle event
          this.onBeforeMount(this.props, this.state)
          // mount the template
          this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope)

          this.onMounted(this.props, this.state)

          return this
        },
        update(state = {}, parentScope) {
          if (parentScope) {
            this[ATTRIBUTES_KEY_SYMBOL].update(parentScope)
          }

          const newProps = evaluateProps(this.root, this[ATTRIBUTES_KEY_SYMBOL].expressions)

          if (this.shouldUpdate(newProps, this.props) === false) return

          this.props = Object.freeze({...initialProps, ...newProps})
          this.state = computeState(this.state, state)

          this.onBeforeUpdate(this.props, this.state)

          this[TEMPLATE_KEY_SYMBOL].update(this, parentScope)
          this.onUpdated(this.props, this.state)

          return this
        },
        unmount(preserveRoot) {
          this.onBeforeUnmount(this.props, this.state)
          this[ATTRIBUTES_KEY_SYMBOL].unmount()
          // if the preserveRoot is null the template html will be left untouched
          // in that case the DOM cleanup will happen differently from a parent node
          this[TEMPLATE_KEY_SYMBOL].unmount(this, {}, preserveRoot === null ? null : !preserveRoot)
          this.onUnmounted(this.props, this.state)

          return this
        }
      })
    ),
    Object.keys(component).filter(prop => isFunction(component[prop]))
  )
}

/**
 * Component initialization function starting from a DOM node
 * @param   {HTMLElement} element - element to upgrade
 * @param   {Object} initialProps - initial component properties
 * @param   {string} componentName - component id
 * @returns {Object} a new component instance bound to a DOM node
 */
export function mountComponent(element, initialProps, componentName) {
  const name = componentName || getName(element)
  if (!COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component named "${name}" was never registered`)

  const component = COMPONENTS_IMPLEMENTATION_MAP.get(name)({ props: initialProps })

  return component.mount(element)
}
