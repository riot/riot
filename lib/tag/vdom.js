
/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtual_dom = [],
    tag_impl = {}


function getTag(dom) {
  return tag_impl[dom.tagName.toLowerCase()]
}

function injectStyle(css) {
  var node = document.createElement('style')
  node.innerHTML = css
  document.head.appendChild(node)
}

function mountTo(root, tagName, opts) {
  var tag = tag_impl[tagName]

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts })

  if (tag && tag.mount) {
    tag.mount()
    virtual_dom.push(tag)
    return tag.on('unmount', function() {
      virtual_dom.splice(virtual_dom.indexOf(tag), 1)
    })
  }

}

riot.tag = function(name, html, css, fn) {
  if (typeof css == 'function') fn = css
  else if (css) injectStyle(css)
  tag_impl[name] = { name: name, tmpl: html, fn: fn }
}

riot.mount = function(selector, tagName, opts) {
  if (selector == '*') selector = Object.keys(tag_impl).join(', ')
  if (typeof tagName == 'object') { opts = tagName; tagName = 0 }

  var tags = []

  function push(root) {
    var name = tagName || root.tagName.toLowerCase(),
        tag = mountTo(root, name, opts)

    if (tag) tags.push(tag)
  }

  // DOM node
  if (selector.tagName) {
    push(selector)
    return tags[0]

  // selector
  } else {
    each(document.querySelectorAll(selector), push)
    return tags
  }

}

// update everything
riot.update = function() {
  return each(virtual_dom, function(tag) {
    tag.update()
  })
}

// @deprecated
riot.mountTo = riot.mount


