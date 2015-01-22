
;(function(riot, doc) {

  var tmpl = riot._tmpl,
      all_tags = [],
      tag_impl = {}

  function each(nodes, fn) {
    for (var i = 0; i < (nodes || []).length; i++) {
      if (fn(nodes[i], i) === false) i--
    }
  }

  function extend(obj, from) {
    from && Object.keys(from).map(function(key) {
      obj[key] = from[key]
    })
    return obj
  }

  function diff(arr1, arr2) {
    return arr1.filter(function(el) {
      return arr2.indexOf(el) < 0
    })
  }

  function walk(dom, fn) {
    dom = fn(dom) === false ? dom.nextSibling : dom.firstChild

    while (dom) {
      walk(dom, fn)
      dom = dom.nextSibling
    }
  }


  function mkdom(tmpl) {
    var el = doc.createElement('div')
    el.innerHTML = tmpl
    return el
  }


  function update(expressions, instance) {

    // allow recalculation of context data
    instance.trigger('update')

    each(expressions, function(expr) {
      var tag = expr.tag,
          dom = expr.dom

      function remAttr(name) {
        dom.removeAttribute(name)
      }

      // loops first: TODO remove from expressions arr
      if (expr.loop) {
        remAttr('each')
        return loop(expr, instance)
      }

      // custom tag
      if (tag) return tag.update ? tag.update() :
        expr.tag = createTag({ tmpl: tag[0], fn: tag[1], root: dom, parent: instance })


      var attr_name = expr.attr,
          value = tmpl(expr.expr, instance)

      if (value == null) value = ''

      // no change
      if (expr.value === value) return
      expr.value = value


      // text node
      if (!attr_name) return dom.nodeValue = value

      // attribute
      if (!value && expr.bool || /obj|func/.test(typeof value)) remAttr(attr_name)

      // event handler
      if (typeof value == 'function') {
        dom[attr_name] = function(e) {

          // cross browser event fix
          e = e || window.event
          e.which = e.which || e.charCode || e.keyCode
          e.target = e.target || e.srcElement
          e.currentTarget = dom

          // currently looped item
          e.item = instance.__item || instance

          // prevent default behaviour (by default)
          if (value.call(instance, e) !== true) {
            e.preventDefault && e.preventDefault()
            e.returnValue = false
          }

          instance.update()
        }

      // show / hide / if
      } else if (/^(show|hide|if)$/.test(attr_name)) {
        remAttr(attr_name)
        if (attr_name == 'hide') value = !value
        dom.style.display = value ? '' : 'none'

      // normal attribute
      } else {
        if (expr.bool) {
          if (!value) return
          value = attr_name
        }

        dom.setAttribute(attr_name, value)
      }

    })

    instance.trigger('updated')

  }

  function parse(root) {

    var named_elements = {},
        expressions = []

    walk(root, function(dom) {

      var type = dom.nodeType,
          value = dom.nodeValue

      function addExpr(value, data) {
        if (value ? value.indexOf('{') >= 0 : data) {
          var expr = { dom: dom, expr: value }
          expressions.push(extend(expr, data || {}))
        }
      }

      // text node
      if (type == 3 && dom.parentNode.tagName != 'STYLE') {
        addExpr(value)

      // element
      } else if (type == 1) {

        // loop?
        value = dom.getAttribute('each')

        if (value) {
          addExpr(value, { loop: 1 })
          return false
        }

        // custom tag?
        var tag = tag_impl[dom.tagName.toLowerCase()]

        // attributes
        each(dom.attributes, function(attr) {
          var name = attr.name,
              value = attr.value

          // named elements
          if (/^(name|id)$/.test(name)) named_elements[value] = dom

          // expressions
          if (!tag) {
            var bool = name.split('__')[1]
            addExpr(value, { attr: bool || name, bool: bool })
            if (bool) return dom.removeAttribute(name)
          }

        })

        if (tag) addExpr(0, { tag: tag })

      }

    })

    return { expr: expressions, elem: named_elements }

  }



  // create new custom tag (component)
  function createTag(conf) {

    var opts = conf.opts || {},
        dom = mkdom(conf.tmpl),
        mountNode = conf.root,
        parent = conf.parent,
        ast = parse(dom),
        tag = { root: mountNode, opts: opts, parent: parent, __item: conf.item },
        attributes = {},
        count = 0

    // named elements
    extend(tag, ast.elem)

    // attributes
    each(mountNode.attributes, function(attr) {
      attributes[attr.name] = attr.value
    })

    function updateOpts() {
      Object.keys(attributes).map(function(name) {
        var val = opts[name] = tmpl(attributes[name], parent || tag)
        if (typeof val == 'object') mountNode.removeAttribute(name)
      })
    }

    updateOpts()

    if (!tag.on) {
      riot.observable(tag)
      delete tag.off // off method not needed
    }

    if (conf.fn) conf.fn.call(tag, opts)


    tag.update = function(data, _system) {

      /*
        If loop is defined on the root of the HTML template
        the original parent is a temporary <div/> by mkdom()
      */
      if (parent && dom && !dom.firstChild) {
        mountNode = parent.root
        dom = null
      }

      if (_system || doc.body.contains(mountNode)) {
        extend(tag, data)
        extend(tag, tag.__item)
        updateOpts()
        update(ast.expr, tag)

        // update parent
        !_system && tag.__item && parent.update()
        return true

      } else {
        tag.trigger('unmount')
      }

    }

    tag.update(0, true)

    // append to root
    while (dom.firstChild) {
      if (conf.before) mountNode.insertBefore(dom.firstChild, conf.before)
      else mountNode.appendChild(dom.firstChild)
    }


    tag.trigger('mount')

    all_tags.push(tag)

    return tag
  }


  function loop(expr, instance) {

    // initialize once
    if (expr.done) return
    expr.done = true

    var dom = expr.dom,
        prev = dom.previousSibling,
        root = dom.parentNode,
        template = dom.outerHTML,
        val = expr.expr,
        els = val.split(/\s+in\s+/),
        rendered = [],
        checksum,
        root,
        keys


    if (els[1]) {
      val = '{ ' + els[1]
      keys = els[0].slice(1).trim().split(/,\s*/)
    }

    // clean template code
    instance.one('mount', function() {
      var p = dom.parentNode
      if (p) {
        root = p
        root.removeChild(dom)
      }
    })

    function startPos() {
      return Array.prototype.indexOf.call(root.childNodes, prev) + 1
    }

    instance.on('updated', function() {

      var items = tmpl(val, instance)
          is_array = Array.isArray(items)

      if (is_array) items = items.slice(0)

      else {

        if (!items) return // some IE8 issue

        // detect Object changes
        var testsum = JSON.stringify(items)
        if (testsum == checksum) return
        checksum = testsum

        items = Object.keys(items).map(function(key, i) {
          var item = {}
          item[keys[0]] = key
          item[keys[1]] = items[key]
          return item
        })

      }

      // remove redundant
      diff(rendered, items).map(function(item) {
        var pos = rendered.indexOf(item)
        root.removeChild(root.childNodes[startPos() + pos])
        rendered.splice(pos, 1)
      })

      // add new
      diff(items, rendered).map(function(item, i) {
        var pos = items.indexOf(item)

        // string array
        if (keys && !checksum) {
          var obj = {}
          obj[keys[0]] = item
          obj[keys[1]] = i
          item = obj
        }

        var tag = createTag({
          before: root.childNodes[startPos() + pos],
          parent: instance,
          tmpl: template,
          item: item,
          root: root
        })

        instance.on('update', function() {
          tag.update(0, true)
        })

      })

      // assign rendered
      rendered = items

    })

  }

  riot.tag = function(name, tmpl, fn) {
    fn = fn || noop,
    tag_impl[name] = [tmpl, fn]
  }

  riot.mountTo = function(node, tagName, opts) {
    var tag = tag_impl[tagName]
    return tag && createTag({ tmpl: tag[0], fn: tag[1], root: node, opts: opts })
  }

  riot.mount = function(selector, opts) {
    if (selector == '*') selector = Object.keys(tag_impl).join(', ')

    var instances = []

    each(doc.querySelectorAll(selector), function(node) {
      if (node.riot) return

      var tagName = node.tagName.toLowerCase(),
          instance = riot.mountTo(node, tagName, opts)

      if (instance) {
        instances.push(instance)
        node.riot = 1
      }
    })

    return instances
  }

  // update everything
  riot.update = function() {
    return all_tags = all_tags.filter(function(tag) {
      return !!tag.update()
    })
  }

})(riot, document)

