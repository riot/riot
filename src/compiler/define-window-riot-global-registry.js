import { GLOBAL_REGISTRY } from './global-registry.js'

/* istanbul ignore next */
export function defineWindowRiotGlobalRegistry() {
  window[GLOBAL_REGISTRY] = window[GLOBAL_REGISTRY] || {}
}
