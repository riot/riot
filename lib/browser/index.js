import o from 'riot-observable'
import styleManager from './tag/styleManager'

import { tmpl, brackets } from 'riot-tmpl'

import {
  isFunction,
  setAttr,
  getAttr,
  $$,
  each,
  mountTo,
  isObject,
  extend
} from './util'

import {
  __TAG_IMPL,
  __VIRTUAL_DOM,
  T_STRING,
  GLOBAL_MIXIN,
  RIOT_TAG_IS,
  RIOT_TAG
} from './global-variables'

/**
 * Riot public api
 */

export var observable = o

// export the brackets.settings
export var settings = brackets.settings
// share methods for other riot parts, e.g. compiler
export var util = {
  tmpl: tmpl,
  brackets: brackets,
  styleNode: styleManager.styleNode
}

/**
 * Create a mixin that could be globally shared across all the tags
 */
export var mixin = (function() {
  var mixins = {},
    globals = mixins[GLOBAL_MIXIN] = {},
    _id = 0

  /**
   * Create/Return a mixin by its name
   * @param   { String }  name - mixin name (global mixin if object)
   * @param   { Object }  mix - mixin logic
   * @param   { Boolean } g - is global?
   * @returns { Object }  the mixin logic
   */
  return function(name, mix, g) {
    // Unnamed global
    if (isObject(name)) {
      mixin(`__unnamed_${_id++}`, name, true)
      return
    }

    var store = g ? globals : mixins

    // Getter
    if (!mix) return store[name]
    // Setter
    store[name] = extend(store[name] || {}, mix)
  }

})()

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
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else styleManager.add(css)
  }
  name = name.toLowerCase()
  __TAG_IMPL[name] = { name, tmpl, attrs, fn }
  return name
}

/**
 * Export the Tag constructor
 * TODO: make a better tag constructor
 */
// export function Tag() {}

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
  if (css) styleManager.add(css)
  //if (bpair) riot.settings.brackets = bpair
  __TAG_IMPL[name] = { name, tmpl, attrs, fn }
  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { String } selector - tag DOM selector
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
export function mount(selector, tagName, opts) {

  var els,
    allTags,
    tags = []

  // helper functions

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      if (!/[^-\w]/.test(e)) {
        e = e.trim().toLowerCase()
        list += `,[${RIOT_TAG_IS}="${e}"],[${RIOT_TAG}="${e}"]`
      }
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(__TAG_IMPL)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, RIOT_TAG_IS) || getAttr(root, RIOT_TAG)

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName
        setAttr(root, RIOT_TAG_IS, tagName)
        setAttr(root, RIOT_TAG, tagName) // this will be removed in riot 3.0.0
      }
      var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    } else if (root.length) {
      each(root, pushTags)   // assume nodeList
    }
  }

  // ----- mount code -----

  // inject styles into DOM
  styleManager.inject()

  if (isObject(tagName)) {
    opts = tagName
    tagName = 0
  }

  // crawl the DOM to find the tag
  if (typeof selector === T_STRING) {
    if (selector === '*')
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selectAllTags()
    else
      // or just the ones named like the selector
      selector += addRiotTags(selector.split(/, */))

    // make sure to pass always a selector
    // to the querySelectorAll function
    els = selector ? $$(selector) : []
  }
  else
    // probably you have passed already a tag or a NodeList
    els = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectAllTags()
    // if the root els it's just a single tag
    if (els.tagName)
      els = $$(tagName, els)
    else {
      // select all the children for all the different root elements
      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  pushTags(els)

  return tags
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
export function update() {
  return each(__VIRTUAL_DOM, function(tag) {
    tag.update()
  })
}

export function unregister(name) {
  delete __TAG_IMPL[name]
}

/**
 * Export the Virtual DOM
 */
export var vdom = __VIRTUAL_DOM


