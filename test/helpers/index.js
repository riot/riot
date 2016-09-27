var defaultBrackets = riot.settings.brackets

// this function is needed to run the tests also on ie8
// ie8 returns some weird strings when we try to get the innerHTML of a tag
function normalizeHTML(html) {
  return html
    .trim()
    // change all the tags properties and names to lowercase because a <li> for ie8 is a <LI>
    .replace(/<([^>]*)>/g, function(tag) { return tag.toLowerCase() })
    .replace(/[\r\n\t]+/g, '')
    .replace(/\>\s+\</g, '><')
}

function getPreviousSibling(n) {
  var x = n.previousSibling
  while (x.nodeType!=1) {
    x = x.previousSibling
  }
  return x
}

function getNextSibling(n) {
  var x = n.previousSibling
  while (x.nodeType!=1) {
    x = x.previousSibling
  }
  return x
}


function getRiotStyles() {
  // util.injectStyle must add <style> in head, not in body -- corrected
  var stag = riot.styleNode || document.querySelector('style')
  return normalizeHTML(stag.styleSheet ? stag.styleSheet.cssText : stag.innerHTML)
}


// small polyfill
// normalize the document.contains method
document.contains = Element.prototype.contains = function contains(node) {
  if (!(0 in arguments)) {
    throw new TypeError('1 argument is required')
  }
  do {
    if (this === node) {
      return true
    }
  } while (node = node && node.parentNode)
  return false
}

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

function injectScript(path) {
  var script = document.createElement('script')
  script.src = path
  script.type = 'riot/tag'
  document.head.appendChild(script)
}

function appendTag(name, attrs, innerHTML) {
  var tag = document.createElement(name)
  document.body.appendChild(tag)
  if (attrs)
    Object.keys(attrs).forEach(function(key) {
      tag.setAttribute(key, attrs[key])
    })
  if (innerHTML)
    tag.innerHTML = innerHTML
  return tag
}


function loadTagsAndScripts(arr) {

  var tagsNames = []

  arr.forEach(function(item) {
    var path,
      name

    // if it's a string we assume it's just the path
    if (typeof item === 'string') {
      path = item
    } else {
      // get the item properties
      path = item.path
      name = item.name
    }

    // if name is undefined
    // we assume the file name without extension is tag name
    if (typeof name === 'undefined')
      name = path.split('/').pop().replace(/(\..*|~)/g, '')

    if (path)
      injectScript(path)
    if (name) {
      appendTag(name, item.attrs, item.html)
      tagsNames.push(name)
    }
  })

  return tagsNames.join(',')
}

function injectHTML(html) {
  var div = document.createElement('div')
  div.innerHTML = html instanceof Array ? html.join('\n') : html
  while (div.firstChild) {
    document.body.appendChild(div.firstChild)
  }
}