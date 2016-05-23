const expect = chai.expect,
  defaultBrackets = riot.settings.brackets


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
  while (x.nodeType!=1) {
    x = x.previousSibling
  }
  return x
}

export function getNextSibling(n) {
  var x = n.previousSibling
  while (x.nodeType!=1) {
    x = x.previousSibling
  }
  return x
}


export function getRiotStyles() {
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

export function injectScript(path) {
  var script = document.createElement('script')
  script.src = path
  script.type = 'riot/tag'
  document.head.appendChild(script)
}

export function appendTag(name, attrs, innerHTML) {
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


export function loadTagsAndScripts(arr) {

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

export function defineTag(tagDef) {
  var name = tagDef.match(/^<([\w\-]+)/)[1]

  // compile expects the closing tag not to have any leading whitespace
  tagDef = tagDef.replace(/(\s*)(<\/[\w\-]+>)\s*$/, '\n$2')

  riot.compile(tagDef)

  // store the name so it can be un-registered
  defineTag.names = defineTag.names || []
  defineTag.names.push(name)
}

export function makeTag(htmlOrName, html) {
  var name = html ? htmlOrName : 'test-tag'
  if (!html) html = htmlOrName

  html = '<' + name + '>\n' + html.trim() + '\n</' + name + '>'
  defineTag(html)
  injectHTML('<' + name + '/>')
  var tags = riot.mount(name)

  // store the tag, so it can be removed
  makeTag.tags = makeTag.tags || []
  makeTag.tags.push(tags[0])

  return tags[0]
}

export function injectHTML(html) {
  var div = document.createElement('div')
  div.innerHTML = html instanceof Array ? html.join('\n') : html
  while (div.firstChild) {
    document.body.appendChild(div.firstChild)
  }
}