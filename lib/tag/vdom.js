
/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtual_dom = [],
    tag_impl = {}

function injectStyle(css) {
  var node = document.createElement('style')
  node.innerHTML = css
  document.head.appendChild(node)
}

riot.tag = function(name, html, css, fn) {
  if (typeof css == 'function') fn = css
  else if (css) injectStyle(css)
  tag_impl[name] = { name: name, tmpl: html, fn: fn }
}

function mountTo(root, tagName, opts) {
  var impl = tag_impl[tagName], tag

  if (impl && root) tag = new Tag(impl, { root: root, opts: opts })

  if (tag) {
    virtual_dom.push(tag)
    return tag.on('unmount', function() {
      virtual_dom.splice(virtual_dom.indexOf(tag), 1)
    })
  }
}

// @depreciated
riot.mountTo = mountTo

riot.mount = function(selector, tagName, opts) {
  if (typeof tagName == 'string')
  if (selector == '*') selector = Object.keys(tag_impl).join(', ')

  var tags = []

  each(document.querySelectorAll(selector), function(root) {
    if (root.riot) return

    var tagName = root.tagName.toLowerCase(),
        tag = mountTo(root, tagName, opts)

    if (tag) tags.push(tag)
  })

  return tags
}

// update everything
riot.update = function() {
  each(virtual_dom, function(tag) {
    tag.update()
  })
  return virtual_dom
}

