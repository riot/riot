import styleManager from './browser/tag/styleManager'
import { tmpl, brackets } from 'riot-tmpl'

/**
 * Riot public api
 */

export const util = {
  tmpl,
  brackets,
  styleManager,
  styleNode: styleManager.styleNode
}

export const settings = brackets.settings
export { default as observable } from 'riot-observable'
export * from './browser/tag/core'
export { __VIRTUAL_DOM as vdom } from './browser/global-variables'
