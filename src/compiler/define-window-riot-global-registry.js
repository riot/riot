import {GLOBAL_REGISTRY} from './global-registry'

/* istanbul ignore next */
export function defineWindowRiotGlobalRegistry() {
  if (window[GLOBAL_REGISTRY]) return
  window[GLOBAL_REGISTRY] = {}
}
