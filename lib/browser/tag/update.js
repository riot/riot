/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var ptag = tag._parent,
      item = tag._item,
      el

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag._parent
      }

    // cross browser event fix
    e = e || window.event

    // override the event properties
    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
    if (isWritable(e, 'target')) e.target = e.srcElement
    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      el = item ? getImmediateCustomParentTag(ptag) : tag
      el.update()
    }

  }

}


/**
 * Insert a DOM node replacing another one (used by if- attribute)
 * @param   { Object } root - parent node
 * @param   { Object } node - node replaced
 * @param   { Object } before - node added
 */
function insertTo(root, node, before) {
  if (!root) return
  root.insertBefore(before, node)
  root.removeChild(node)
}

/**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      parent = dom && dom.parentNode

    if (expr.bool)
      value = value ? attrName : false
    else if (value == null)
      value = ''

    // leave out riot- prefixes from strings inside textarea
    // fix #815: any value -> string
    if (parent && parent.tagName == 'TEXTAREA') {
      value = ('' + value).replace(/riot-/g, '')
      // change textarea's value
      parent.value = value
    }

    var old = expr.value
    expr.value = value

    if (expr.isIf) return updateIf(expr, old, value, tag)
    if (expr.isTag) return updateTagRef(expr, tag)
    if (expr.isVirtual) return updateVirtual(expr, tag)
    if (expr.isLoop) return expr.update()
    if (expr.isNamed) return updateNamed(expr, old, value, tag)

    // no change, so nothing more to do
    if (old === value) return

    // text node
    if (!attrName) {
      dom.nodeValue = '' + value    // #815 related
      return
    }

    // remove original attribute
    remAttr(dom, attrName)
    // event handler
    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    // show / hide
    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attrName == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
      if (value)
        setAttr(dom, attrName.slice(RIOT_PREFIX.length), value)

    } else {
      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
      }

      if (value === 0 || value && typeof value !== T_OBJECT)
        setAttr(dom, attrName, value)

    }

  })

}

// Named expressions set a property on the parent, so that
// <input name='foo' /> is available as this.foo
function updateNamed(expr, old, value, tag) {
  if (expr.done) return // only set named once
  // names only get set on custom tags (not loop items, for example)
  var parent = getImmediateCustomParentTag(tag)
  setNamed(expr.dom, parent, value)
  expr.done = true
}

// TagRef points to a child tag that may or may not exist yet.
// This way, we don't mount a tag until it's actually going to be inserted into DOM
function updateTagRef(expr, parent) {
  if (expr.tag) {
    expr.tag.update()
    return
  }

  var conf = {root: expr.dom, parent: parent, hasImpl: true, ownAttrs: expr.ownAttrs}
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent, expr.nameHasExpression)
  expr.tag.mount()
  expr.tag.update()
}

function updateVirtual(expr, parent) {
  if (expr.tag) {
    expr.tag.update()
    return
  }

  // create tag
  var conf = {root: expr.dom, parent: parent, hasImpl: true, ownAttrs: expr.ownAttrs}
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent, expr.nameHasExpression)
  expr.tag.mount()

  // make tag virtual and insert
  var frag = document.createDocumentFragment()
  makeVirtual(expr.tag, frag)
  expr.tag.root.parentElement.replaceChild(frag, expr.tag.root)
  expr.tag.update()

}

// If expressions add or remove DOM, as well as control the flow of updates.
// An if-expression that remains false won't update any dependants.
// When the truthyness changes, we insert the DOM, or a stub to hold position.
function updateIf(expr, old, value, tag) {
  // if the truthyness remains unchange
  if (expr.started && !value == !old) {
    if (value)
      update(expr.children, tag)
    return
  }

  var stub, dom = expr.dom
  stub = expr.stub = expr.stub || document.createTextNode('')

  // add to DOM
  if (value) {
    update(expr.children, tag)
    insertTo(stub.parentNode, stub, dom)
  } else {
    if (dom.parentNode) insertTo(dom.parentNode, dom, stub)
    // pretty sure this only happens with <foo each={items} if={show} />
    else tag.stub = stub
  }
  expr.started = true
}
