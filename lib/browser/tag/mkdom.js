
/*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and below

*/
// http://kangax.github.io/compat-table/es5/#ie8
// http://codeplanet.io/dropping-ie8/

var mkdom = (function (checkIE) {

  var rootEls = {
      tr: 'tbody',
      th: 'tr',
      td: 'tr',
      tbody: 'table',
      col: 'colgroup'
    },
    reToSrc = /<yield\s+to=(['"])?@\1\s*>([\S\s]+?)<\/yield\s*>/.source,
    GENERIC = 'div'

  checkIE = checkIE && checkIE < 10

  // creates any dom element in a div, table, or colgroup container
  function _mkdom(templ, html) {

    var match = templ && templ.match(/^\s*<([-\w]+)/),
      tagName = match && match[1].toLowerCase(),
      rootTag = rootEls[tagName] || GENERIC,
      el = mkEl(rootTag)

    el.stub = true

    // replace all the yield tags with the tag inner html
    if (html) templ = replaceYield(templ, html)

    /* istanbul ignore next */
    if (checkIE && tagName && (match = tagName.match(SPECIAL_TAGS_REGEX)))
      ie9elem(el, templ, tagName, !!match[1])
    else
      el.innerHTML = templ

    return el
  }

  // creates tr, th, td, option, optgroup element for IE8-9
  /* istanbul ignore next */
  function ie9elem(el, html, tagName, select) {

    var div = mkEl(GENERIC),
      tag = select ? 'select>' : 'table>',
      child

    div.innerHTML = '<' + tag + html + '</' + tag

    child = $(tagName, div)
    if (child)
      el.appendChild(child)

  }
  // end ie9elem()

  /**
   * Replace the yield tag from any tag template with the innerHTML of the
   * original tag in the page
   * @param   { String } templ - tag implementation template
   * @param   { String } html  - original content of the tag in the DOM
   * @returns { String } tag template updated without the yield tag
   */
  function replaceYield(templ, html) {
    // do nothing if no yield
    if (!/<yield\b/i.test(templ)) return templ

    // be careful with #1343 - string on the source having `$1`
    var n = 0
    templ = templ.replace(/<yield\s+from=['"]([-\w]+)['"]\s*(?:\/>|>\s*<\/yield\s*>)/ig,
      function (str, ref) {
        var m = html.match(RegExp(reToSrc.replace('@', ref), 'i'))
        ++n
        return m && m[2] || ''
      })

    // yield without any "from", replace yield in templ with the innerHTML
    return n ? templ : templ.replace(/<yield\s*(?:\/>|>\s*<\/yield\s*>)/gi, html || '')
  }

  return _mkdom

})(IE_VERSION)
