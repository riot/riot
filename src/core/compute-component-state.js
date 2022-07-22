import {callOrAssign} from '@riotjs/util'

/**
 * Compute the component current state merging it with its previous state
 * @param   {Object} oldState - previous state object
 * @param   {Object} newState - new state given to the `update` call
 * @returns {Object} new object state
 */
export function computeComponentState(oldState, newState) {
  return {
    ...oldState,
    ...callOrAssign(newState)
  }
}
