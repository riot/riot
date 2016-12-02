const expect = chai.expect

export const IE_VERSION = (window && window.document || {}).documentMode | 0

// this export function is needed to run the tests also on ie8
// ie8 returns some weird strings when we try to get the innerHTML of a tag
export function normalizeHTML(html) {
  return html
    .trim()
    // change all the tags properties and names to lowercase because a <li> for ie8 is a <LI>
    .replace(/<([^>]*)>/g, function(tag) { return tag.toLowerCase() })
    .replace(/[\r\n\t]+/g, '')
    .replace(/\>\s+\</g, '><')
}

export function expectHTML(tagOrDom) {
  var dom = tagOrDom.root ? tagOrDom.root : tagOrDom
  return expect(normalizeHTML(dom.innerHTML))
}

export function getPreviousSibling(n) {
  var x = n.previousSibling
  while (x.nodeType !== 1) {
    x = x.previousSibling
  }
  return x
}

export function getNextSibling(n) {
  var x = n.previousSibling
  while (x.nodeType !== 1) {
    x = x.previousSibling
  }
  return x
}

export function getRiotStyles(riot) {
  // util.injectStyle must add <style> in head, not in body -- corrected
  var stag = riot.util.styleNode || document.querySelector('style')
  return normalizeHTML(stag.styleSheet ? stag.styleSheet.cssText : stag.innerHTML)
}

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
export function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
export function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}


export function injectHTML(html) {
  var div = document.createElement('div')
  div.innerHTML = html instanceof Array ? html.join('\n') : html
  while (div.firstChild) {
    document.body.appendChild(div.firstChild)
  }
}

export function getCarrotPos(dom) {
  if (dom.selectionStart !== null)
    return dom.selectionStart

  if (document.selection === null)
    return null

  var range = document.selection.createRange()
  range.moveStart('character', -dom.value.length)
  return range.text.length
}

export function setCarrotPos(dom, pos) {
  if (dom.setSelectionRange !== null) {
    dom.setSelectionRange(pos, pos)
    return
  }

  var range = dom.createTextRange()
  range.collapse(true)
  range.moveEnd('character', pos)
  range.moveStart('character', pos)
  range.select()
}

export function fireEvent(el, name) {
  var e = new Event(name, {'bubbles': false, 'cancelable': true})
  el.dispatchEvent(e)
}
