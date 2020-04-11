import {
  ATTRIBUTES_KEY_SYMBOL,
  COMPONENTS_IMPLEMENTATION_MAP,
  DOM_COMPONENT_INSTANCE_PROPERTY,
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
  UPDATE_METHOD_KEY
} from '@riotjs/util/constants'

import {
  autobindMethods,
  callOrAssign,
  noop
} from '@riotjs/util/functions'

import {
  bindingTypes,
  createExpression,
  template as createTemplate,
  expressionTypes
} from '@riotjs/dom-bindings'

import {
  defineDefaults,
  defineProperties,
  defineProperty
} from '@riotjs/util/objects'

import {
  evaluateAttributeExpressions,
  panic
} from '@riotjs/util/misc'

import $ from 'bianco.query'
import {DOMattributesToObject} from '@riotjs/util/dom'
import {camelToDashCase} from '@riotjs/util/strings'
import cssManager from './css-manager'
import curry from 'curri'
import {getName} from '../utils/dom'
import {isFunction} from '@riotjs/util/checks'
import {set as setAttr} from 'bianco.attr'

const COMPONENT_CORE_HELPERS = Object.freeze({
  // component helpers
  $(selector){ return $(selector, this.root)[0] },
  $$(selector){ return $(selector, this.root) }
})

const PURE_COMPONENT_API = Object.freeze({
  [MOUNT_METHOD_KEY]: noop,
  [UPDATE_METHOD_KEY]: noop,
  [UNMOUNT_METHOD_KEY]: noop
})

const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
  [SHOULD_UPDATE_KEY]: noop,
  [ON_BEFORE_MOUNT_KEY]: noop,
  [ON_MOUNTED_KEY]: noop,
  [ON_BEFORE_UPDATE_KEY]: noop,
  [ON_UPDATED_KEY]: noop,
  [ON_BEFORE_UNMOUNT_KEY]: noop,
  [ON_UNMOUNTED_KEY]: noop
})

const MOCKED_TEMPLATE_INTERFACE = {
  ...PURE_COMPONENT_API,
  clone: noop,
  createDOM: noop
}

/**
 * Evaluate the component properties either from its real attributes or from its initial user properties
 * @param   {HTMLElement} element - component root
 * @param   {Object}  initialProps - initial props
 * @returns {Object} component props key value pairs
 */
function evaluateInitialProps(element, initialProps = {}) {
  return {
    ...DOMattributesToObject(element),
    ...callOrAssign(initialProps)
  }
}

/**
 * Bind a DOM node to its component object
 * @param   {HTMLElement} node - html node mounted
 * @param   {Object} component - Riot.js component object
 * @returns {Object} the component object received as second argument
 */
const bindDOMNodeToComponentObject = (node, component) => node[DOM_COMPONENT_INSTANCE_PROPERTY] = component

/**
 * Wrap the Riot.js core API methods using a mapping function
 * @param   {Function} mapFunction - lifting function
 * @returns {Object} an object having the { mount, update, unmount } functions
 */
function createCoreAPIMethods(mapFunction) {
  return [
    MOUNT_METHOD_KEY,
    UPDATE_METHOD_KEY,
    UNMOUNT_METHOD_KEY
  ].reduce((acc, method) => {
    acc[method] = mapFunction(method)

    return acc
  }, {})
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
 * Create a pure component
 * @param   {Function} pureFactoryFunction - pure component factory function
 * @param   {Array} options.slots - component slots
 * @param   {Array} options.attributes - component attributes
 * @param   {Array} options.template - template factory function
 * @param   {Array} options.template - template factory function
 * @param   {any} options.props - initial component properties
 * @returns {Object} pure component object
 */
function createPureComponent(pureFactoryFunction, { slots, attributes, props, css, template }) {
  if (template) panic('Pure components can not have html')
  if (css) panic('Pure components do not have css')

  const component = defineDefaults(
    pureFactoryFunction({ slots, attributes, props }),
    PURE_COMPONENT_API
  )

  return createCoreAPIMethods(method => (...args) => {
    // intercept the mount calls to bind the DOM node to the pure object created
    // see also https://github.com/riot/riot/issues/2806
    if (method === MOUNT_METHOD_KEY) {
      const [el] = args
      bindDOMNodeToComponentObject(el, component)
    }

    component[method](...args)

    return component
  })
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
    // pure components rendering will be managed by the end user
    if (exports && exports[IS_PURE_SYMBOL])
      return createPureComponent(
        exports,
        { slots, attributes, props, css, template }
      )

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
      [STATE_KEY]: {}
    }), {
      // defined during the component creation
      [SLOTS_KEY]: null,
      [ROOT_KEY]: null,
      // these properties should not be overriden
      ...COMPONENT_CORE_HELPERS,
      name,
      css,
      template
    })
  )
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

  return Object.assign(binding, {
    expressions,
    ...createCoreAPIMethods(method => scope => {
      expressions.forEach(e => e[method](scope))

      return binding
    })
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
    setAttr(element, IS_DIRECTIVE, name)
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
  return autobindMethods(
    runPlugins(
      defineProperties(Object.create(component), {
        mount(element, state = {}, parentScope) {
          this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope)

          defineProperty(this, PROPS_KEY, Object.freeze({
            ...evaluateInitialProps(element, props),
            ...evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions)
          }))

          this[STATE_KEY] = computeState(this[STATE_KEY], state)
          this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone()

          // link this object to the DOM node
          bindDOMNodeToComponentObject(element, this)
          // add eventually the 'is' attribute
          component.name && addCssHook(element, component.name)

          // define the root element
          defineProperty(this, ROOT_KEY, element)
          // define the slots array
          defineProperty(this, SLOTS_KEY, slots)

          // before mount lifecycle event
          this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY])
          this[PARENT_KEY_SYMBOL] = parentScope
          // mount the template
          this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope)
          this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY])

          return this
        },
        update(state = {}, parentScope) {
          if (parentScope) {
            this[ATTRIBUTES_KEY_SYMBOL].update(parentScope)
          }

          const newProps = evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions)

          if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return

          defineProperty(this, PROPS_KEY, Object.freeze({
            ...this[PROPS_KEY],
            ...newProps
          }))

          this[STATE_KEY] = computeState(this[STATE_KEY], state)

          this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY])
          this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL])
          this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY])

          return this
        },
        unmount(preserveRoot) {
          this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY])
          this[ATTRIBUTES_KEY_SYMBOL].unmount()
          // if the preserveRoot is null the template html will be left untouched
          // in that case the DOM cleanup will happen differently from a parent node
          this[TEMPLATE_KEY_SYMBOL].unmount(this, this[PARENT_KEY_SYMBOL], preserveRoot === null ? null : !preserveRoot)
          this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY])

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

  const component = COMPONENTS_IMPLEMENTATION_MAP.get(name)({
    props: initialProps
  })

  return component.mount(element)
}
