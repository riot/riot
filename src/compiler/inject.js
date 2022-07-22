import {GLOBAL_REGISTRY} from './global-registry'
import {defineWindowRiotGlobalRegistry} from './define-window-riot-global-registry'
import {evaluate} from './evaluate'
import {register} from '../riot'
import {transpile} from './transpile'

export function inject(code, tagName, url) {
  defineWindowRiotGlobalRegistry()
  evaluate(`window.${GLOBAL_REGISTRY}['${tagName}'] = ${transpile(code)}`, url)
  // eslint-disable-next-line no-undef
  register(tagName, window[GLOBAL_REGISTRY][tagName])
}
