
// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
    els = expr.trim().slice(b0.length).match(/^\s*(\S+?)\s*(?:,\s*(\S+))?\s+in\s+(.+)$/)
  return els ? { key: els[1], pos: els[2], val: b0 + els[3] } : { val: expr }
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  function eachEnd(dom) {
    var attr = getAttr(dom, 'each-end')
    return attr || attr === ''
  }

  var placeholder = document.createComment('riot placeholder')
  dom.parentNode.insertBefore(placeholder, dom)

  var grp = getAttr(dom, 'each-start'),
    grpcnt = grp ? 0 : 1

  remAttr(dom, 'each')
  remAttr(dom, 'each-start')

  if (grp) {
    var vdom = document.createElement('div') // grouped elements container
    var el = dom
    while (el) { // append to container grouped siblings
      vdom.appendChild(el.cloneNode(true))
      if (el.nodeType == 1) grpcnt++
      if (el.nodeType == 1 && eachEnd(el)) break
      el = el.nextSibling
    }

    // add grouped dom container and remmove old dom
    dom.parentNode.appendChild(vdom)
    while (dom.nextSibling) {
      var done = dom.nextSibling.nodeType == 1 && eachEnd(dom.nextSibling)
      dom.parentNode.removeChild(dom.nextSibling)
      if (done) break
    }
    dom.parentNode.removeChild(dom)
    dom = vdom // reassing
  }

  var tagName = getTagName(dom),
    isNamed = getAttr(dom, 'name'),
    template = dom.outerHTML,
    hasImpl = !!tagImpl[tagName],
    impl = tagImpl[tagName] || {
      tmpl: template
    },
    root = dom.parentNode,
    tags = [],
    child = getTag(dom),
    checksum,
    oldItems = []


  expr = loopKeys(expr)

  // clean template code
  parent
    .one('premount', function () {
      if (root.stub) root = parent.root
      // remove the original DOM node
      dom.parentNode.removeChild(dom)
    })
    .on('update', function () {
      var items = tmpl(expr.val, parent),
        useRoot = SPECIAL_TAGS_REGEX.test(tagName),
        i, j, frag,
        n = 0

      // object loop. any changes cause full redraw
      if (!isArray(items)) {

        checksum = items ? JSON.stringify(items) : ''

        items = !items ? [] :
          Object.keys(items).map(function (key) {
            return mkitem(expr, key, items[key])
          })
      }

      // unmount the old tags
      i = oldItems.length * grpcnt
      while (i-- && tags.length > items.length * grpcnt) {
        if (!~items.indexOf(oldItems[i])) {
          tags[i].unmount()
          tags.splice(i, 1)
        }
      }

      frag = document.createDocumentFragment()
      i = tags.length
      j = items.length

      function loopTag(index, el) {
        var elem = el || dom
        var impl2 = el ? {tmpl: el.outerHTML} : impl

        if (!tags[index]) {
          // mount new
          (tags[index] = new Tag(impl2, {
            parent: parent,
            isLoop: true,
            hasImpl: hasImpl,
            root: useRoot ? root : elem.cloneNode(),
            item: _item
          }, elem.innerHTML)).mount()

          frag.appendChild(tags[index].root)
        } else
          tags[index].update(_item)

        if (grp) tags[index].root.removeAttribute('each-end')
        tags[index]._item = _item
        // cache the real parent tag internally
        tags[index]._parent = parent
      }

      for (i = 0; i < j; ++i) {
        var _item = !checksum && !!expr.key ? mkitem(expr, items[i], i) : items[i]
        if (grp) {
          var el = dom.firstChild
          while (el) {
            if (el.nodeType == 1) {
              loopTag(n++, el)
              if (eachEnd(el)) break
            } else root.appendChild(el.cloneNode())
            el = el.nextSibling
          }
        } else loopTag(i)
      }

      root.insertBefore(frag, placeholder)

      if (child) parent.tags[tagName] = tags

      oldItems = items.slice()

    })

}
