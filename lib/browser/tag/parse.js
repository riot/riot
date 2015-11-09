

function parseNamedElements(root, tag, childTags, forceParsingNamed) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = dom.isLoop || (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each')) ? 1 : 0

      // custom child tag
      if (childTags) {
        var child = getTag(dom)

        if (child && !dom.isLoop)

          if ((_x = dom.getElementsByTagName('myyield')).length > 0) {
            // get myyield to='' elements
            // and construct a map of this elements by to attribute
            var _to = {}
            for (var i = _x.length - 1; i >= 0; i--) {
              var _to_name = _x[i].getAttribute('to')
              if (_to_name) {
                _to[_to_name] = _x[i].innerHTML
              }
            }

            // substitute myyield from='_xpto_' elements by myyield to='_xpto_'
            var _tmpl = document.createElement('div')
            _tmpl.innerHTML = child.tmpl
            // console.log(_e1.getElementsByTagName('myyield')) // from elements
            // console.log(dom.getElementsByTagName('myyield')) // to elements
            var _from = _tmpl.getElementsByTagName('myyield')
            for (var i = _from.length - 1; i >= 0; i--) {
              var _from_name = _from[i].getAttribute('from');
              if (_from_name && _to[_from_name]) {
                // replace to with from (insert reversed logic joke here!)
                _from[i].innerHTML = _to[_from_name];
              }
            }
            child.tmpl = _tmpl.innerHTML
          }

          childTags.push(initChildTag(child, {root: dom, parent: tag}, dom.innerHTML, tag))
      }

      if (!dom.isLoop || forceParsingNamed)
        setNamed(dom, tag, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (tmpl.hasExpr(val)) {
      var expr = { dom: dom, expr: val }
      expressions.push(extend(expr, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    var attr = getAttr(dom, 'each')

    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
