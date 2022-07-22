import {
  ATTRIBUTES_KEY_SYMBOL,
  IS_COMPONENT_UPDATING,
  IS_PURE_SYMBOL,
  ON_BEFORE_MOUNT_KEY,
  ON_BEFORE_UNMOUNT_KEY,
  ON_BEFORE_UPDATE_KEY,
  ON_MOUNTED_KEY,
  ON_UNMOUNTED_KEY,
  ON_UPDATED_KEY,
  PARENT_KEY_SYMBOL,
  PROPS_KEY,
  ROOT_KEY,
  SHOULD_UPDATE_KEY,
  SLOTS_KEY,
  STATE_KEY,
  TEMPLATE_KEY_SYMBOL,
  autobindMethods, defineProperties,
  defineProperty, evaluateAttributeExpressions,
  isFunction,
  isObject
} from '@riotjs/util'
import {addCssHook} from './add-css-hook'
import {bindDOMNodeToComponentInstance} from './bind-dom-node-to-component-instance'
import {computeComponentState} from './compute-component-state'
import {computeInitialProps} from './compute-initial-props'
import {createAttributeBindings} from './create-attribute-bindings'
import {runPlugins} from './run-plugins'

/**
 * Component creation factory function that will enhance the user provided API
 * @param   {Object} component - a component implementation previously defined
 * @param   {Array} options.slots - component slots generated via riot compiler
 * @param   {Array} options.attributes - attribute expressions generated via riot compiler
 * @returns {Riot.Component} a riot component instance
 */
export function manageComponentLifecycle(component, {slots, attributes, props}) {
  return autobindMethods(
    runPlugins(
      defineProperties(isObject(component) ? Object.create(component) : component, {
        mount(element, state = {}, parentScope) {
          // any element mounted passing through this function can't be a pure component
          defineProperty(element, IS_PURE_SYMBOL, false)
          this[PARENT_KEY_SYMBOL] = parentScope
          this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope)

          defineProperty(this, PROPS_KEY, Object.freeze({
            ...computeInitialProps(element, props),
            ...evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions)
          }))

          this[STATE_KEY] = computeComponentState(this[STATE_KEY], state)
          this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone()

          // link this object to the DOM node
          bindDOMNodeToComponentInstance(element, this)
          // add eventually the 'is' attribute
          component.name && addCssHook(element, component.name)

          // define the root element
          defineProperty(this, ROOT_KEY, element)
          // define the slots array
          defineProperty(this, SLOTS_KEY, slots)

          // before mount lifecycle event
          this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY])
          // mount the template
          this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope)
          this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY])

          return this
        },
        update(state = {}, parentScope) {
          if (parentScope) {
            this[PARENT_KEY_SYMBOL] = parentScope
            this[ATTRIBUTES_KEY_SYMBOL].update(parentScope)
          }

          const newProps = evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions)

          if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return

          defineProperty(this, PROPS_KEY, Object.freeze({
            ...this[PROPS_KEY],
            ...newProps
          }))

          this[STATE_KEY] = computeComponentState(this[STATE_KEY], state)

          this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY])

          // avoiding recursive updates
          // see also https://github.com/riot/riot/issues/2895
          if (!this[IS_COMPONENT_UPDATING]) {
            this[IS_COMPONENT_UPDATING] = true
            this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL])
          }

          this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY])
          this[IS_COMPONENT_UPDATING] = false

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
