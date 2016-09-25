import { isSVGTag } from './../common/util/check'
import { mkEl, setInnerHTML, $ } from './../common/util/dom'
import { getTag } from './../common/util/tags'

import {
  IE_VERSION,
  RE_SPECIAL_TAGS,
  RE_SPECIAL_TAGS_NO_OPTION
} from './../common/global-variables'

/*
  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/

const
  rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
  tblTags = IE_VERSION && IE_VERSION < 10 ? RE_SPECIAL_TAGS : RE_SPECIAL_TAGS_NO_OPTION,
  GENERIC = 'div'


/*
  Creates the root element for table or select child elements:
  tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
*/
function specialTags(el, templ, tagName) {

  var
    select = tagName[0] === 'o',
    parent = select ? 'select>' : 'table>'

  // trim() is important here, this ensures we don't have artifacts,
  // so we can check if we have only one element inside the parent
  el.innerHTML = '<' + parent + templ.trim() + '</' + parent
  parent = el.firstChild

  // returns the immediate parent if tr/th/td/col is the only element, if not
  // returns the whole tree, as this can include additional elements
  if (select) {
    parent.selectedIndex = -1  // for IE9, compatible w/current riot behavior
  } else {
    // avoids insertion of cointainer inside container (ex: tbody inside tbody)
    var tname = rootEls[tagName]
    if (tname && parent.childElementCount === 1) parent = $(tname, parent)
  }
  return parent
}

/*
  Replace the yield tag from any tag template with the innerHTML of the
  original tag in the page
*/
function replaceYield(templ, html) {

  var parser = new DOMParser()
  var templDom = parser.parseFromString(templ, 'text/html')
  var htmlDom = parser.parseFromString(html, 'text/html')
  var to = {}, from = {}
  var traverse = function(doc, onYield, debug) {
    for (var i=0; i<doc.children.length; i++) {
      var el = doc.children.item(i)
      if (getTag(el)) return false // Skip riot tags, they'll be replaced when they're instantiated
      if (el.tagName.toLowerCase() === 'yield') {
        onYield(el)
        continue
      }
      traverse(el, onYield, debug)
    }
  }
  var sortByAttr = function(el, attr, dest) {
    var name = ''
    if (el.hasAttribute(attr)) name = el.getAttribute(attr)
    if (name in dest) {
      console.warn("Duplicate yield: '"+"' in "+el.tagName)
    } else {
      dest[name] = el
    }
  }
  traverse(templDom, function(el) { sortByAttr(el, 'from', from) })
  traverse(htmlDom, function(el) {
    console.log({addinTo: el})
    sortByAttr(el, 'to', to.innerHTML) }
  , true)
	if (!("" in to)) to[""] = html
  Object.keys(from).forEach(function(yieldName) {
    if (yieldName in to) {
			// We have to have exactly one element to use replaceChild below
			// DocumentFragment from HTML specs is not widely supported, but DOMParser supposidly is,
			// so the ugly code below is the most cross-browser way of doing this
      var repl = parser.parseFromString('<span>'+to[yieldName]+'</span>', 'text/html').body.firstChild
      from[yieldName].parentElement.replaceChild(repl, from[yieldName])
    } else {
      console.warn({'No such yield': yieldName, to: to, from: from, templDom: templDom, htmlDom: htmlDom, templ: templ, html: html})
    }
  })
  var result = templDom.body.innerHTML
	//console.log({templ: templ, html: html, result: result})
  return result

}

/**
 * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
 * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
 *
 * @param   {string} templ  - The template coming from the custom tag definition
 * @param   {string} [html] - HTML content that comes from the DOM element where you
 *           will mount the tag, mostly the original tag in the page
 * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
 */
export default function mkdom(templ, html) {
  var match   = templ && templ.match(/^\s*<([-\w]+)/),
    tagName = match && match[1].toLowerCase(),
    el = mkEl(GENERIC, isSVGTag(tagName))

  // replace all the yield tags with the tag inner html
  templ = replaceYield(templ, html)

  /* istanbul ignore next */
  if (tblTags.test(tagName))
    el = specialTags(el, templ, tagName)
  else
    setInnerHTML(el, templ)

  el.stub = true

  return el
}
