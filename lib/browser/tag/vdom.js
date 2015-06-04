
/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtualDom = [],
    tagImpl = {},
    styleNode


function getTag(dom) {
  return tagImpl[dom.getAttribute('riot-tag') || dom.tagName.toLowerCase()]
}

function injectStyle(css) {

  styleNode = styleNode || mkEl('style')

  if (!document.head) return

  if(styleNode.styleSheet)
    styleNode.styleSheet.cssText += css
  else
    styleNode.innerHTML += css

  if (!styleNode._rendered)
    if (styleNode.styleSheet)
      document.body.appendChild(styleNode)
    else
      document.head.appendChild(styleNode)

  styleNode._rendered = true

}

function mountTo(root, tagName, opts) {
  var tag = tagImpl[tagName],
      innerHTML = root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    virtualDom.push(tag)
    return tag.on('unmount', function() {
      virtualDom.splice(virtualDom.indexOf(tag), 1)
    })
  }

}

riot.tag = function(name, html, css, attrs, fn) {
  if (typeof attrs == 'function') {
    fn = attrs
    if(/^[\w\-]+\s?=/.test(css)) {attrs = css; css = ''} else attrs = ''
  }
  if (typeof css == 'function') fn = css
  else if (css) injectStyle(css)
  tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

riot.mount = function(selector, tagName, opts) {

  var el,
      selctAllTags = function() {
        var keys = Object.keys(tagImpl)
        var list = keys.join(', ')
        each(keys, function(t) {
          list += ', *[riot-tag="'+ t.trim() + '"]'
        })
        return list
      },
      allTags,
      tags = []

  if (typeof tagName == 'object') { opts = tagName; tagName = 0 }

  // crawl the DOM to find the tag
  if(typeof selector == 'string') {
    if (selector == '*') {
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selctAllTags()
    } else {
      selector.split(',').map(function(t) {
        selector += ', *[riot-tag="'+ t.trim() + '"]'
      })

    }
    // or just the ones named like the selector
    el = $$(selector)
  }
  // probably you have passed already a tag or a NodeList
  else
    el = selector

  // select all the registered and mount them inside their root elements
  if (tagName == '*') {
    // get all custom tags
    tagName = allTags || selctAllTags()
    // if the root el it's just a single tag
    if (el.tagName) {
      el = $$(tagName, el)
    } else {
      var nodeList = []
      // select all the children for all the different root elements
      each(el, function(tag) {
        nodeList = $$(tagName, tag)
      })
      el = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  function push(root) {
    if(tagName && !root.getAttribute('riot-tag')) root.setAttribute('riot-tag', tagName)

    var name = tagName || root.getAttribute('riot-tag') || root.tagName.toLowerCase(),
        tag = mountTo(root, name, opts)

    if (tag) tags.push(tag)
  }

  // DOM node
  if (el.tagName)
    push(selector)
  // selector or NodeList
  else
    each(el, push)

  return tags

}

// update everything
riot.update = function() {
  return each(virtualDom, function(tag) {
    tag.update()
  })
}

// @deprecated
riot.mountTo = riot.mount

