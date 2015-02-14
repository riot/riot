var is_node = !this.top

if (is_node) {
  var sdom = require('../sdom')
  module.exports = {
    extend: extend,
    each: each,
    mkdom: mkdom,
    walk: walk,
    inherit: inherit
  }
}

function each(nodes, fn) {
  for (var i = 0; i < (nodes || []).length; i++) {
    if (fn(nodes[i], i) === false) i--
  }
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

function extend(obj, from) {
  from && Object.keys(from).map(function(key) {
    obj[key] = from[key]
  })
  return obj
}

function mkdom(template, doc) {
  var tag_name = template.trim().slice(1, 3).toLowerCase(),
      root_tag = /td|th/.test(tag_name) ? 'tr' : tag_name == 'tr' ? 'tbody' : 'div',
      el = (doc || document).createElement(root_tag)

  el.stub = true

  if (is_node) {
    var frag = sdom.parse(template)
    el.appendChild(frag)
  } else {
    el.innerHTML = template
  }

  return el
}

function walk(dom, fn) {
  dom = fn(dom) === false ? dom.nextSibling : dom.firstChild

  while (dom) {
    walk(dom, fn)
    dom = dom.nextSibling
  }
}

function arrDiff(arr1, arr2) {
  return arr1.filter(function(el) {
    return arr2.indexOf(el) < 0
  })
}

function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}
