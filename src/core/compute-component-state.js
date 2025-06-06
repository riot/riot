import { callOrAssign } from '@riotjs/util'

/**
 * Compute the component current state merging it with its previous state
 * @param   {object} oldState - previous state object
 * @param   {object} newState - new state given to the `update` call
 * @returns {object} new object state
 */
export function computeComponentState(oldState, newState) {
  return {
    ...oldState,
    ...callOrAssign(newState),
  }
}
