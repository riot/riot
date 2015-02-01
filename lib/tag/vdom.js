
var virtual_dom = [],
    tag_impl = {}

riot.tag = function(name, tmpl, fn) {
  tag_impl[name] = { name: name, tmpl: tmpl, fn: fn }
}

riot.mountTo = function(root, tagName, opts) {
  var impl = tag_impl[tagName], tag

  if (impl) tag = new Tag(impl, { root: root, opts: opts })

  if (tag) {
    virtual_dom.push(tag)
    tag.on('unmount', function() {
      virtual_dom.splice(virtual_dom.indexOf(tag), 1)
    })
    return tag
  }
}

riot.mount = function(selector, opts) {
  if (selector == '*') selector = Object.keys(tag_impl).join(', ')

  var tags = []

  each(document.querySelectorAll(selector), function(root) {
    var tagName = root.tagName.toLowerCase(),
        tag = riot.mountTo(root, tagName, opts)

    if (tag) tags.push(tag)
  })

  return tags
}

// update everything
riot.update = function() {
  virtual_dom.map(function(tag) {
    tag.update()
  })
}

