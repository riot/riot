/**
 *
 * Hacks needed for the old internet explorer versions [lower than IE10]
 *
 */

var ieVersion = checkIE()

function checkIE() {
  if (window) {
    var ua = navigator.userAgent
    var msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    }
    else {
      return 0
    }
  }
}

function tbodyInnerHTML(el, html, tagName) {
  var div = document.createElement('div')
  div.innerHTML = '<table>' + html + '</table>'

  el.appendChild(/td|th/.test(tagName) ? div.firstChild.firstChild.firstChild.firstChild : div.firstChild.firstChild.firstChild)

}

function optionInnerHTML(el, html) {
  var opt = document.createElement('option'),
      valRegx = /value=[\"'](.+?)[\"']/,
      selRegx = /selected=[\"'](.+?)[\"']/,
      valuesMatch = html.match(valRegx),
      selectedMatch = html.match(selRegx)

  opt.innerHTML = html

  if (valuesMatch) {
    opt.value = valuesMatch[1]
  }

  if (selectedMatch) {
    opt.setAttribute('riot-selected', selectedMatch[1])
  }

  el.appendChild(opt)
}