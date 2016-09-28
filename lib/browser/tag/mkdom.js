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
	var anonymousYields = [];
  traverse(templDom, function(el) { 
		var tgt = anonymousYields
    if (el.hasAttribute('from')) {
			var name = el.getAttribute('from')
			if (!(name in from)) from[name] = []
			tgt = from[name]
		}
		tgt.push(el)
	})
	var yieldsToRemove = []
  traverse(htmlDom, function(el) {
		// We always remove to yield. What remains becomes the unnamed yeild contents.
		yieldsToRemove.push(el)
    if (!el.hasAttribute('to')) {
			console.warn("<yield> tag without a 'to' attribute in instance of a riot tag. RIOT silently ignores such <yield>'s")
			return;
		}
		var name = el.getAttribute('to')
		if (name in to) {
			console.warn("Duplicate <yield> in a riot tag instance with 'to' attribute '"+name+"'")
			return
		}
		to[name] = el
	})
	// If we do this during the traverse, the changing dom ends up skipping elements
	yieldsToRemove.forEach(function(yld) { yld.parentElement.removeChild(yld) })

	var replElem = function(tgt, nodes) {
		// replaceChild accepts single node, but we may have multiple nodes to put in place of the <yield>
		// DocumentFragment from HTML specs is not widely supported, but DOMParser supposidly is,
		// so the ugly code below is the most cross-browser way of doing this
 		var repl = parser.parseFromString('<span></span>', 'text/html').body.firstChild
		// Replace the <yield> with a <span>
   	tgt.parentElement.replaceChild(repl, tgt)
		// childNodes returns a LIVE list and insertBefore /moves/ nodes.
		// We therefore have to build a list of referenecs to the nodes we want to move,
		// because insertBefore() would change the length and index as the loop progressed
		// Position each node from within our riot tag instance yield before our <span>
		for (var i=0; i < nodes.length; i++) {
			// We clone the node because insertBefore() removes it from the DOM before inserting it.
			// That causes problems both with the loop and with case where the tag definition
			// has multiple <yields> (either anonymous or with the same 'from=' values)
 	   	repl.parentElement.insertBefore(nodes[i].cloneNode(true), repl)
		}
		// Remove the <span>
	  repl.parentElement.removeChild(repl)
	};

	// Replace anonymous yields
	anonymousYields.forEach(function(yld) {
		replElem(yld, htmlDom.body.childNodes)
	})
	// Replace named yields
  Object.keys(from).forEach(function(yieldName) {
    if (yieldName in to) {
			from[yieldName].forEach(function(yld) {
				replElem(yld,to[yieldName].childNodes);
			})
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
