import {PROPS_KEY, ROOT_KEY, SLOTS_KEY, STATE_KEY} from '@riotjs/util/constants'
import {defineDefaults, defineProperties} from '@riotjs/util/objects'
import {COMPONENT_CORE_HELPERS} from './component-core-helpers'
import {COMPONENT_LIFECYCLE_METHODS} from './component-lifecycle-methods'
import {createComponent} from './create-component'
import cssManager from './css-manager'
import curry from 'curri'

/**
 * Component definition function
 * @param   {Object} implementation - the componen implementation will be generated via compiler
 * @param   {Object} component - the component initial properties
 * @returns {Object} a new component implementation object
 */
export function defineComponent({css, template, componentAPI, name}) {
  // add the component css into the DOM
  if (css && name) cssManager.add(name, css)

  return curry(createComponent)(defineProperties(
    // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, {
      ...COMPONENT_LIFECYCLE_METHODS,
      [PROPS_KEY]: {},
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
