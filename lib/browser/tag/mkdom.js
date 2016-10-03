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
function replaceYield(templDom, html) {
  var htmlDom = mkEl(GENERIC, false) //parser.parseFromString(html, 'text/html')
  setInnerHTML(htmlDom, html)

  var to = {}, from = {}
  var traverse = function(doc, onYield) {
    var i = 0, el
    while (el = doc.childNodes.item(i++)) {
      if (el.nodeType !== 1) continue // Skip non-tags
      if (getTag(el)) continue // Skip riot tags, they'll be replaced when they're instantiated
      if (el.nodeType === 1 && el.tagName.toLowerCase() === 'yield') {
        onYield(el)
      } else {
        traverse(el, onYield)
      }
    }
  }
  var anonymousYields = []
  var getAttribute = function(el, attr) {
    var i
    for (i=0; i<el.attributes.length; i++) {
      if (el.attributes[i].name === attr && el.attributes[i].specified) {
        return el.attributes[i].value
      }
    }
    return false
  }
  traverse(templDom, function(el) {
    var tgt = anonymousYields
    var name
    if ((name = getAttribute(el, 'from')) !== false) {
      if (!(name in from)) from[name] = []
      tgt = from[name]
    }
    tgt.push(el)
  })
  var yieldsToRemove = []
  traverse(htmlDom, function(el) {
    // We always remove yield. What remains becomes the unnamed yeild contents.
    yieldsToRemove.push(el)
    var name = getAttribute(el, 'to')
    if (name === false) {
      console.warn("<yield> tag without a 'to' attribute in instance of a riot tag. RIOT silently ignores such <yield>'s")
      return
    }
    if (name in to) {
      console.warn("Duplicate <yield> in a riot tag instance with 'to' attribute '"+name+"'")
      return
    }
    to[name] = el
  })
  // If we do this during the traverse, the changing dom by removing a tag ends up skipping elements
	// We have to do it here to remove yields in tag instances not used by the tag definition
  yieldsToRemove.forEach(function(yld) { yld.parentElement.removeChild(yld) })

  var replElem = function(tgt, nodes) {
    var i = 0, el
    while (el = nodes.item(i++)) {
      // We clone the node because insertBefore() removes it from the DOM before inserting it.
      // That causes problems both with the loop and with case where the tag definition
      // has multiple <yields> (either anonymous or with the same 'from=' values)
      tgt.parentNode.insertBefore(el.cloneNode(true), tgt)
    }
    // Remove the <yield>
    tgt.parentNode.removeChild(tgt)
  }

  // Replace anonymous yields
  anonymousYields.forEach(function(yld) {
    replElem(yld, htmlDom.childNodes)
  })
  // Replace named yields
  Object.keys(from).forEach(function(yieldName) {
    if (yieldName in to) {
      from[yieldName].forEach(function(yld) {
        replElem(yld, to[yieldName].childNodes)
      })
    } else {
      console.warn({'No such yield': yieldName, to: to, from: from, templDom: templDom, htmlDom: htmlDom, html: html})
    }
  })
  return templDom
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

  /* istanbul ignore next */
  if (tblTags.test(tagName))
    el = specialTags(el, templ, tagName)
  else
    setInnerHTML(el, templ)

  // replace all the yield tags with the tag inner html
  el = replaceYield(el, html)

  el.stub = true

  return el
}
