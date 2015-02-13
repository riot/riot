
/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtual_dom = [],
    tag_impl = {},
    expr_begin

riot.tag = function(name, html, fn) {
  expr_begin = expr_begin || (riot.settings.brackets || '{ }').split(' ')[0]
  tag_impl[name] = { name: name, tmpl: html, fn: fn }
}

var mountTo = riot.mountTo = function(root, tagName, opts) {
  var impl = tag_impl[tagName], tag

  if (impl && root) {
    root.riot = 0 // mountTo can override previous instance
    tag = new Tag(impl, { root: root, opts: opts })
  }

  if (tag) {
    virtual_dom.push(tag)
    return tag.on('unmount', function() {
      virtual_dom.splice(virtual_dom.indexOf(tag), 1)
    })
  }
}

riot.mount = function(selector, opts) {
  if (selector == '*') selector = Object.keys(tag_impl).join(', ')

  var tags = []

  each(document.querySelectorAll(selector), function(root) {

    var tagName = root.tagName.toLowerCase(),
        tag = mountTo(root, tagName, opts)

    if (tag) tags.push(tag)
  })

  return tags
}

// update everything
riot.update = function() {
  virtual_dom.map(function(tag) {
    tag.update()
  })
  return virtual_dom
}

