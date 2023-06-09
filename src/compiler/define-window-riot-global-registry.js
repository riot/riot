import { GLOBAL_REGISTRY } from './global-registry.js'

/* istanbul ignore next */
export function defineWindowRiotGlobalRegistry() {
  if (window[GLOBAL_REGISTRY]) return
  window[GLOBAL_REGISTRY] = {}
}
