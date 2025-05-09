import {
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
  autobindMethods,
  defineProperties,
  defineProperty,
  generatePropsFromAttributes,
  isFunction,
  isObject,
  pick,
  DOMattributesToObject,
} from '@riotjs/util'

import { addCssHook } from './add-css-hook.js'
import { bindDOMNodeToComponentInstance } from './bind-dom-node-to-component-instance.js'
import { computeComponentState } from './compute-component-state.js'
import { computeInitialProps } from './compute-initial-props.js'
import { runPlugins } from './run-plugins.js'
import { IS_DIRECTIVE } from '@riotjs/util/constants'
import { getRootComputedAttributeNames } from '../utils/get-root-computed-attribute-names.js'

/**
 * Component creation factory function that will enhance the user provided API
 * @param   {Object} component - a component implementation previously defined
 * @param   {Array} options.slots - component slots generated via riot compiler
 * @param   {Array} options.attributes - attribute expressions generated via riot compiler
 * @returns {Riot.Component} a riot component instance
 */
export function manageComponentLifecycle(
  component,
  { slots, attributes = [], props },
) {
  return autobindMethods(
    runPlugins(
      defineProperties(
        isObject(component) ? Object.create(component) : component,
        {
          mount(element, state = {}, parentScope) {
            // any element mounted passing through this function can't be a pure component
            defineProperty(element, IS_PURE_SYMBOL, false)
            this[PARENT_KEY_SYMBOL] = parentScope

            defineProperty(
              this,
              PROPS_KEY,
              Object.freeze({
                ...computeInitialProps(element, props),
                ...generatePropsFromAttributes(attributes, parentScope),
              }),
            )

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
            }

            // get the attribute names that don't belong to the the props object
            // this will avoid recursive props rendering https://github.com/riot/riot/issues/2994
            const computedAttributeNames = getRootComputedAttributeNames(
              this[TEMPLATE_KEY_SYMBOL],
            )
            // filter out the computed attributes from the root node
            const staticRootAttributes = Array.from(
              this[ROOT_KEY].attributes,
            ).filter(({ name }) => !computedAttributeNames.includes(name))

            // evaluate the value of the static dom attributes
            const domNodeAttributes = DOMattributesToObject({
              attributes: staticRootAttributes,
            })

            // Avoid adding the riot "is" directives to the component props
            // eslint-disable-next-line no-unused-vars
            const { [IS_DIRECTIVE]: _, ...newProps } = {
              ...domNodeAttributes,
              ...generatePropsFromAttributes(
                attributes,
                this[PARENT_KEY_SYMBOL],
              ),
            }
            if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false)
              return

            defineProperty(
              this,
              PROPS_KEY,
              Object.freeze({
                // only root components will merge their initial props with the new ones
                // children components will just get them overridden see also https://github.com/riot/riot/issues/2978
                ...(parentScope
                  ? pick(this[PROPS_KEY], computedAttributeNames)
                  : this[PROPS_KEY]),
                ...newProps,
              }),
            )

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
            // if the preserveRoot is null the template html will be left untouched
            // in that case the DOM cleanup will happen differently from a parent node
            this[TEMPLATE_KEY_SYMBOL].unmount(
              this,
              this[PARENT_KEY_SYMBOL],
              preserveRoot === null ? null : !preserveRoot,
            )
            this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY])

            return this
          },
        },
      ),
    ),
    Object.keys(component).filter((prop) => isFunction(component[prop])),
  )
}
