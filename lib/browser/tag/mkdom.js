/*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/
export default (function (checkIE) {
  var
    reHasYield  = /<yield\b/i,
    reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig,
    reYieldCls  = /<yield\s+to=[^>]+>[\S\s]*?<\/yield\s*>\s*/ig,
    reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig,
    rsYieldSrc  = '<yield\\s+to=[\'"]@[\'"]\\s*>([\\S\\s]*?)</yield\\s*>',
    rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
    GENERIC = 'div'


  checkIE = checkIE && checkIE < 10
  var tblTags = checkIE
    ? SPECIAL_TAGS_REGEX : /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/

  /**
   * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
   * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
   *
   * @param   {string} impl   - Tag implementation with the template and root attributes
   * @param   {string} [html] - HTML content that comes from the DOM element where you
   *           will mount the tag, mostly the original tag in the page
   * @param   {object} [attr] - Plain object where to store the root attributes
   * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
   */
  function _mkdom(impl, html, attr) {

    var templ = impl.tmpl,
      match   = templ && templ.match(/^\s*<([-\w]+)/),
      tagName = match && match[1].toLowerCase(),
      el = mkEl(GENERIC, isSVGTag(tagName))

    if (!html) html = ''

    if (impl.attrs) attr.attrs = replaceYield(impl.attrs, html)

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
      if (tname && parent.childNodes.length === 1) parent = $(tname, parent)
    }
    return parent
  }

  /*
    Replace the yield tag from any tag template with the innerHTML of the
    original tag in the page
  */
  function replaceYield(templ, html) {
    // do nothing if no yield
    if (!reHasYield.test(templ)) return templ

    // be careful with #1343 - string on the source having `$1`
    var n = 1
    templ = templ.replace(reYieldDest, function (_, ref, def) {
      var m = html.match(RegExp(rsYieldSrc.replace('@', ref), 'i'))
      n = 0
      return (m ? m[1] : def) || ''
    })

    // yield without any "from", replace yield in templ with the innerHTML
    if (n || reHasYield.test(templ)) {
      if (html) html = html.replace(reYieldCls, '').trim()
      templ = templ.replace(reYieldAll, function (_, def) {
        return html || def || ''
      })
    }

    return templ
  }

  return _mkdom

})(IE_VERSION)
