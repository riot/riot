import styleManager from './styleManager'
import { isString, isUndefined, isObject, isFunction } from './../common/util/check'
import { setAttr, getAttr, $$ } from './../common/util/dom'
import { each, extend } from './../common/util/misc'
import { mountTo, selectTags } from './../common/util/tags'

import {
  __TAG_IMPL,
  __TAGS_CACHE,
  GLOBAL_MIXIN,
  IS_DIRECTIVE
} from './../common/global-variables'

/**
 * Another way to create a riot tag a bit more es6 friendly
 * @param { HTMLElement } el - tag DOM selector or DOM node/s
 * @param { Object } opts - tag logic
 * @returns { Tag } new riot tag instance
 */
export function Tag(el, opts) {
  // get the tag properties from the class constructor
  var {name, tmpl, css, attrs, onCreate} = this
  // register a new tag and cache the class prototype
  if (!__TAG_IMPL[name]) {
    tag(name, tmpl, css, attrs, onCreate)
    // cache the class constructor
    __TAG_IMPL[name].class = this.constructor
  }

  // mount the tag using the class instance
  mountTo(el, name, opts, this)
  // inject the component css
  if (css) styleManager.inject()

  return this
}

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
export function tag(name, tmpl, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs

    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else
      attrs = ''
  }

  if (css) {
    if (isFunction(css))
      fn = css
    else
      styleManager.add(css)
  }

  name = name.toLowerCase()
  __TAG_IMPL[name] = { name, tmpl, attrs, fn }

  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
export function tag2(name, tmpl, css, attrs, fn) {
  if (css) styleManager.add(css, name)

  __TAG_IMPL[name] = { name, tmpl, attrs, fn }

  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { * } selector - tag DOM selector or DOM node/s
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
export function mount(selector, tagName, opts) {
  var tags = []

  function pushTagsTo(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, IS_DIRECTIVE)

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName
        setAttr(root, IS_DIRECTIVE, tagName)
      }

      var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts)

      if (tag)
        tags.push(tag)
    } else if (root.length)
      each(root, pushTagsTo) // assume nodeList
  }

  // inject styles into DOM
  styleManager.inject()

  if (isObject(tagName)) {
    opts = tagName
    tagName = 0
  }

  var elem
  var allTags

  // crawl the DOM to find the tag
  if (isString(selector)) {
    selector = selector === '*' ?
      // select all registered tags
      // & tags found with the riot-tag attribute set
      allTags = selectTags() :
      // or just the ones named like the selector
      selector + selectTags(selector.split(/, */))

    // make sure to pass always a selector
    // to the querySelectorAll function
    elem = selector ? $$(selector) : []
  }
  else
    // probably you have passed already a tag or a NodeList
    elem = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectTags()
    // if the root els it's just a single tag
    if (elem.tagName)
      elem = $$(tagName, elem)
    else {
      // select all the children for all the different root elements
      var nodeList = []

      each(elem, _el => nodeList.push($$(tagName, _el)))

      elem = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  pushTagsTo(elem)

  return tags
}

// Create a mixin that could be globally shared across all the tags
const mixins = {}
const globals = mixins[GLOBAL_MIXIN] = {}
let mixins_id = 0

/**
 * Create/Return a mixin by its name
 * @param   { String }  name - mixin name (global mixin if object)
 * @param   { Object }  mix - mixin logic
 * @param   { Boolean } g - is global?
 * @returns { Object }  the mixin logic
 */
export function mixin(name, mix, g) {
  // Unnamed global
  if (isObject(name)) {
    mixin(`__unnamed_${mixins_id++}`, name, true)
    return
  }

  const store = g ? globals : mixins

  // Getter
  if (!mix) {
    if (isUndefined(store[name]))
      throw new Error('Unregistered mixin: ' + name)

    return store[name]
  }

  // Setter
  store[name] = isFunction(mix) ?
    extend(mix.prototype, store[name] || {}) && mix :
    extend(store[name] || {}, mix)
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
export function update() {
  return each(__TAGS_CACHE, tag => tag.update())
}

export function unregister(name) {
  delete __TAG_IMPL[name]
}

export const version = 'WIP'
