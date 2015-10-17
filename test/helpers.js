var defaultBrackets = riot.settings.brackets

// this function is needed to run the tests also on ie8
// ie8 returns some weird strings when we try to get the innerHTML of a tag
function normalizeHTML (html) {
  return html
    .trim()
    // change all the tags properties and names to lowercase because a <li> for ie8 is a <LI>
    .replace(/<([^>]*)>/g, function(tag) { return tag.toLowerCase() })
    .replace(/\r|\r|\n|\t/gi, '')
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