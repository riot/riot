import {
  PROPS_KEY,
  ROOT_KEY,
  SLOTS_KEY,
  STATE_KEY,
  defineDefaults,
  defineProperties,
} from '@riotjs/util'
import { COMPONENT_DOM_SELECTORS } from './component-dom-selectors.js'
import { COMPONENT_LIFECYCLE_METHODS } from './component-lifecycle-methods.js'
import cssManager from './css-manager.js'
import curry from 'curri'
import { manageComponentLifecycle } from './manage-component-lifecycle.js'

/**
 * Component definition function
 * @param  {object} component - the component initial properties
 * @param  {string}  component.css - component css string
 * @param  {TemplateChunk} component.template - component template rendering
 * @param  {object} component.componentAPI - component export default value
 * @param  {string} component.name - component name
 * @returns {object} a new component implementation object
 */
export function instantiateComponent({ css, template, componentAPI, name }) {
  // add the component css into the DOM
  if (css && name) cssManager.add(name, css)

  return curry(manageComponentLifecycle)(
    defineProperties(
      // set the component defaults without overriding the original component API
      defineDefaults(componentAPI, {
        ...COMPONENT_LIFECYCLE_METHODS,
        [PROPS_KEY]: {},
        [STATE_KEY]: {},
      }),
      {
        // defined during the component creation
        [SLOTS_KEY]: null,
        [ROOT_KEY]: null,
        // these properties should not be overriden
        ...COMPONENT_DOM_SELECTORS,
        name,
        css,
        template,
      },
    ),
  )
}
