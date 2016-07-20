import styleManager from './browser/tag/styleManager'
import { tmpl, brackets } from 'riot-tmpl'
import obs from 'riot-observable'

/**
 * Riot public api
 */

export const util = {
  tmpl: tmpl,
  brackets: brackets,
  styleManager: styleManager,
  styleNode: styleManager.styleNode
}

export const settings = brackets.settings
export const observable = obs
export * from './browser/tag/core'
export { __VIRTUAL_DOM as vdom } from './browser/global-variables'
