import styleManager from './browser/tag/styleManager'
import { tmpl, brackets } from 'riot-tmpl'
import o from 'riot-observable'
import s from './settings'
import { __TAGS_CACHE as vdom } from './browser/common/global-variables'
import * as dom from './browser/common/util/dom'
import * as check from './browser/common/util/check'
import * as misc from './browser/common/util/misc'
import * as tags from './browser/common/util/tags'
import * as core from './browser/tag/core'

/**
 * Riot public api
 */
export const settings = s
export const util = {
  tmpl,
  brackets,
  styleManager,
  vdom,
  styleNode: styleManager.styleNode,
  // export the riot internal utils as well
  dom,
  check,
  misc,
  tags
}

// export the core props/methods
export const Tag = core.Tag
export const tag = core.tag
export const tag2 = core.tag2
export const mount = core.mount
export const mixin = core.mixin
export const update = core.update
export const unregister = core.unregister
export const version = core.version
export const observable = o

export default misc.extend({}, core, {
  observable: o,
  settings,
  util,
})
