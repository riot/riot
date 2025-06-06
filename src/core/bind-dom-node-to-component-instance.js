import { DOM_COMPONENT_INSTANCE_PROPERTY } from '@riotjs/util'

/**
 * Bind a DOM node to its component object
 * @param   {HTMLElement} node - html node mounted
 * @param   {object} component - Riot.js component object
 * @returns {object} the component object received as second argument
 */
export const bindDOMNodeToComponentInstance = (node, component) =>
  (node[DOM_COMPONENT_INSTANCE_PROPERTY] = component)
