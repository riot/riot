import styleManager from './browser/tag/styleManager'
import { tmpl, brackets } from 'riot-tmpl'
import { __TAGS_CACHE } from './browser/common/global-variables'
import * as dom from './browser/common/util/dom'
import * as check from './browser/common/util/check'
import * as misc from './browser/common/util/misc'
import * as tags from './browser/common/util/tags'

/**
 * Riot public api
 */

export const settings = Object.create(brackets.settings)
export const util = {
  tmpl,
  brackets,
  styleManager,
  vdom: __TAGS_CACHE,
  styleNode: styleManager.styleNode,
  // export the riot internal utils as well
  dom,
  check,
  misc,
  tags
}

export { default as observable } from 'riot-observable'
// core api
export * from './browser/tag/core'
