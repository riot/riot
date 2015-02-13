
/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtual_dom = [],
    tag_impl = {},
    expr_begin,
    is_node = !this.top

if (is_node) {
  var util = require('./util')
  var each = util.each
  var walk = util.walk
  var Tag = require('./tag')
  var riot = module.exports = {
    settings: {},
    tag_impl: tag_impl,
    expr_begin: expr_begin
  }
}

riot.tag = function(name, html, fn) {
  expr_begin = expr_begin || (riot.settings.brackets || '{ }').split(' ')[0]
  tag_impl[name] = { name: name, tmpl: html, fn: fn }
}

var mountTo = riot.mountTo = function(root, tagName, opts) {
  var impl = tag_impl[tagName], tag

  if (impl && root) {
    root.riot = 0 // mountTo can override previous instance
    tag = new Tag(impl, { root: root, opts: opts }, riot.settings)
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
  var nodes = []

  if (is_node && riot.settings.doc) {
    walk(riot.settings.doc, function(node) {
      if (node && node.tagName) {
        var tagName = node.tagName.toLowerCase()
        if (selector.indexOf(tagName) != -1) {
          nodes.push(node)
        }
      }
    })
  } else if (!is_node ){
    nodes = document.querySelectorAll(selector)
  }

  each(nodes, function(root) {
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
