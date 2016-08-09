import styleManager from './browser/tag/styleManager'
import { tmpl, brackets } from 'riot-tmpl'
import * as dom from './browser/common/util/dom'
import * as check from './browser/common/util/check'
import * as misc from './browser/common/util/misc'
import * as tags from './browser/common/util/tags'

/**
 * Riot public api
 */

export const util = {
  tmpl,
  brackets,
  styleManager,
  styleNode: styleManager.styleNode,
  // export the riot internal utils as well
  dom,
  check,
  misc,
  tags
}

// TODO: remove it! this should be handled differently
export const settings = brackets.settings
export { default as observable } from 'riot-observable'
export * from './browser/tag/core'
export { __VIRTUAL_DOM as vdom } from './browser/common/global-variables'