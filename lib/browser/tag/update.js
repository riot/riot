/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
export function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var ptag = tag._parent,
      item = tag._item

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

    handler.call(tag, e)

    if (!e.preventUpdate) {
      getImmediateCustomParentTag(tag).update()
    }

  }

}

/**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
export function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      parent = dom && dom.parentNode,
      isValueAttr = attrName == 'value'

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

    if (expr._riot_id) { // if it's a tag
      if (expr.isMounted) {
        expr.update()

      // if it hasn't been mounted yet, do that now.
      } else {
        expr.mount()

        if (expr.root.tagName == 'VIRTUAL') {
          var frag = document.createDocumentFragment()
          makeVirtual(expr, frag)
          expr.root.parentElement.replaceChild(frag, expr.root)
        }
      }
      return
    }

    if (expr.update) {
      expr.update()
      return
    }

    var old = expr.value
    expr.value = value

    if (expr.isRtag && value) return updateRtag(expr, tag)

    // no change, so nothing more to do
    if (
      isValueAttr && dom.value == value || // was the value of this dom node changed?
      !isValueAttr && old === value // was the old value still the same?
    ) return

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
      // <select> <option selected={true}> </select>
      if (attrName == 'selected' && parent && /^(SELECT|OPTGROUP)$/.test(parent.nodeName) && value)
        parent.value = dom.value

      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
      }

      if (value === 0 || value && typeof value !== T_OBJECT)
        setAttr(dom, attrName, value)

    }

  })

}

/**
 * Update dynamically created riot-tag with changing expressions
 * @param   { Object } expr - expression tag and expression info
 * @param   { Tag } parent - parent for tag creation
 */

function updateRtag(expr, parent) {
  var tagName = tmpl(expr.value, parent),
    conf

  if (expr.tag && expr.tagName == tagName) {
    expr.tag.update()
    return
  }

  // sync _parent to accommodate changing tagnames
  if (expr.tag) {
    var delName = expr.tag.opts.riotTag,
      tags = expr.tag._parent.tags[delName]

    if (isArray(tags)) tags.splice(tags.indexOf(expr.tag), 1); else delete expr.tag._parent.tags[delName]

  }

  expr.impl = __tagImpl[tagName]
  conf = {root: expr.dom, parent: parent, hasImpl: true, tagName: tagName}
  expr.tag = initChildTag(expr.impl, conf, expr.dom.innerHTML, parent)
  expr.tagName = tagName
  expr.tag.mount()
  expr.tag.update()

}
