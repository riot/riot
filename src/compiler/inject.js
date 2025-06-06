import { GLOBAL_REGISTRY } from './global-registry.js'
import { defineWindowRiotGlobalRegistry } from './define-window-riot-global-registry.js'
import { evaluate } from './evaluate.js'
import { register } from '../riot.js'
import { transpile } from './transpile.js'

export function inject(code, tagName, url) {
  defineWindowRiotGlobalRegistry()
  evaluate(`window.${GLOBAL_REGISTRY}['${tagName}'] = ${transpile(code)}`, url)

  register(tagName, window[GLOBAL_REGISTRY][tagName])
}
