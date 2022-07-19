import {callOrAssign} from '@riotjs/util/functions'

/**
 * Compute the component current state merging it with its previous state
 * @param   {Object} oldState - previous state object
 * @param   {Object} newState - new state givent to the `update` call
 * @returns {Object} new object state
 */
export function computeState(oldState, newState) {
  return {
    ...oldState,
    ...callOrAssign(newState)
  }
}
